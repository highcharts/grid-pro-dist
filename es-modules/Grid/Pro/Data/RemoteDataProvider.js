/* *
 *
 *  Remote Data Provider class
 *
 *  (c) 2020-2025 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Dawid Dragula
 *
 * */
'use strict';
import { DataProvider } from '../../Core/Data/DataProvider.js';
import DataProviderRegistry from '../../Core/Data/DataProviderRegistry.js';
import { createQueryFingerprint } from './QuerySerializer.js';
import { dataSourceFetch } from './DataSourceHelper.js';
/* *
 *
 *  Class
 *
 * */
/**
 * Remote data provider for the Grid.
 *
 * Fetches tabular data from a remote API in chunks and exposes it through the
 * standard `DataProvider` interface used by the Grid viewport.
 *
 * - Caches fetched chunks (optionally with an LRU eviction policy).
 * - Deduplicates concurrent requests for the same chunk.
 * - Uses a query fingerprint to invalidate caches when the query changes.
 */
export class RemoteDataProvider extends DataProvider {
    constructor() {
        /* *
         *
         *  Static Properties
         *
         * */
        super(...arguments);
        /**
         * Total row count before pagination (from API metadata `totalRowCount`).
         */
        this.prePaginationRowCount = null;
        /**
         * Current row count after pagination (actual rows returned in the chunk).
         * When pagination is disabled, this equals prePaginationRowCount.
         */
        this.rowCount = null;
        /**
         * Array of column IDs that have been fetched from the remote server.
         */
        this.columnIds = null;
        /**
         * Cached chunks are used to store the data for the chunks that have been
         * fetched from the remote server.
         */
        this.dataChunks = null;
        /**
         * Pending chunks are used to deduplicate concurrent requests for the same
         * chunk.
         */
        this.pendingChunks = null;
        /**
         * Reverse lookup map from rowId to { chunkIndex, localIndex } for O(1)
         * lookup in getRowIndex.
         */
        this.rowIdToChunkInfo = null;
        /**
         * Fingerprint of the last applied query; used to avoid clearing caches
         * when the query did not actually change.
         */
        this.lastQueryFingerprint = null;
        /**
         * Epoch used to invalidate stale in-flight requests when the query changes.
         */
        this.requestEpoch = 0;
        /**
         * Abort controllers for in-flight requests (latest-only policy).
         */
        this.pendingControllers = new Set();
    }
    /**
     * Returns the effective chunk size.
     * When pagination is enabled, uses the page size as chunk size,
     * so that one chunk = one page.
     */
    get maxChunkSize() {
        const pagination = this.querying.pagination;
        // When pagination is enabled, chunk size = page size
        if (pagination.enabled) {
            return pagination.currentPageSize;
        }
        return this.options.chunkSize ?? RemoteDataProvider.DEFAULT_CHUNK_SIZE;
    }
    /* *
     *
     *  Methods
     *
     * */
    get requestPolicy() {
        return this.options.requestPolicy ?? 'latest';
    }
    abortPendingRequests() {
        for (const controller of this.pendingControllers) {
            controller.abort();
        }
        this.pendingControllers.clear();
    }
    async getChunkForRowIndex(rowIndex) {
        // When pagination enabled, all rows for current page are in chunk 0
        // When disabled, calculate chunk from global index
        if (this.querying.pagination.enabled) {
            return await this.fetchChunk(0);
        }
        const chunkIndex = Math.floor(rowIndex / this.maxChunkSize);
        return await this.fetchChunk(chunkIndex);
    }
    /**
     * Gets the chunk index for a given row index.
     * When pagination is enabled, all rows are in chunk 0.
     *
     * @param rowIndex
     * The row index passed from the grid.
     *
     * @returns
     * The chunk index.
     */
    getChunkIndexForRow(rowIndex) {
        if (this.querying.pagination.enabled) {
            return 0;
        }
        return Math.floor(rowIndex / this.maxChunkSize);
    }
    /**
     * Gets the local index within the cached chunk data.
     * When pagination is enabled, rowIndex is already 0-based within the page.
     * When disabled, need to calculate offset within the chunk.
     *
     * @param rowIndex
     * The row index passed from the grid.
     *
     * @returns
     * The local index within the chunk.
     */
    getLocalIndexInChunk(rowIndex) {
        // When pagination enabled, rowIndex is already page-relative
        if (this.querying.pagination.enabled) {
            return rowIndex;
        }
        // Standard chunking: calculate local offset within chunk
        const chunkIndex = Math.floor(rowIndex / this.maxChunkSize);
        return rowIndex - (chunkIndex * this.maxChunkSize);
    }
    /**
     * Evicts the least recently used chunk if the cache limit is reached.
     * Also cleans up the reverse lookup map for evicted rowIds.
     */
    evictLRUChunkIfNeeded() {
        const { chunksLimit } = this.options;
        if (!chunksLimit ||
            !this.dataChunks ||
            this.dataChunks.size < chunksLimit) {
            return;
        }
        // Get the first (oldest/LRU) chunk
        const oldestKey = this.dataChunks.keys().next().value;
        if (oldestKey === void 0) {
            return;
        }
        const oldestChunk = this.dataChunks.get(oldestKey);
        // Clean up reverse lookup map for evicted chunk's rowIds
        if (oldestChunk && this.rowIdToChunkInfo) {
            for (const rowId of oldestChunk.rowIds) {
                this.rowIdToChunkInfo.delete(rowId);
            }
        }
        this.dataChunks.delete(oldestKey);
    }
    /**
     * Fetches a chunk from the remote server and caches it.
     * Deduplicates concurrent requests for the same chunk.
     *
     * @param chunkIndex
     * The index of the chunk to fetch.
     *
     * @returns
     * The cached chunk.
     */
    async fetchChunk(chunkIndex) {
        if (!this.dataChunks) {
            this.dataChunks = new Map();
        }
        // Check if chunk is already cached (with LRU update)
        const existingChunk = this.dataChunks.get(chunkIndex);
        if (existingChunk) {
            // Move to end (most recently used) by re-inserting
            this.dataChunks.delete(chunkIndex);
            this.dataChunks.set(chunkIndex, existingChunk);
            return existingChunk;
        }
        // Check if there's already a pending request for this chunk
        if (!this.pendingChunks) {
            this.pendingChunks = new Map();
        }
        if (this.pendingChunks.has(chunkIndex)) {
            // Return the existing pending request to avoid duplicate fetches
            const pendingRequest = this.pendingChunks.get(chunkIndex);
            return pendingRequest;
        }
        // Start a new fetch
        const requestEpoch = this.requestEpoch;
        const controller = this.requestPolicy === 'latest' ?
            new AbortController() :
            null;
        if (controller) {
            this.pendingControllers.add(controller);
        }
        const fetchPromise = (async () => {
            try {
                const pagination = this.querying.pagination;
                let offset;
                let limit;
                if (pagination.enabled) {
                    // When pagination is enabled, fetch the current page
                    offset = (pagination.currentPage - 1) *
                        pagination.currentPageSize;
                    limit = pagination.currentPageSize;
                }
                else {
                    // Standard chunking
                    offset = chunkIndex * this.maxChunkSize;
                    limit = this.maxChunkSize;
                }
                let result;
                const { fetchCallback, dataSource } = this.options;
                if (fetchCallback) {
                    result = await fetchCallback.call(this, this.querying, offset, limit, controller?.signal);
                }
                else if (dataSource) {
                    result = await dataSourceFetch(dataSource, {
                        query: this.querying,
                        offset,
                        limit,
                        signal: controller?.signal
                    });
                }
                else {
                    throw new Error('RemoteDataProvider: Either `dataSource` or ' +
                        '`fetchCallback` must be provided in options.');
                }
                if (requestEpoch !== this.requestEpoch ||
                    controller?.signal.aborted) {
                    return {
                        index: chunkIndex,
                        data: {},
                        rowIds: []
                    };
                }
                this.columnIds = Object.keys(result.columns);
                this.prePaginationRowCount = result.totalRowCount;
                // Calculate actual row count from returned data
                const firstColumn = result.columns[this.columnIds[0]];
                const chunkRowCount = firstColumn ? firstColumn.length : 0;
                // When pagination enabled: rowCount = actual rows on page
                // When disabled: rowCount = prePaginationRowCount (same value)
                if (pagination.enabled) {
                    this.rowCount = chunkRowCount;
                }
                else {
                    this.rowCount = result.totalRowCount;
                }
                const idColId = this.options.idColumn;
                let idColumn;
                if (idColId) {
                    idColumn = result.columns[idColId];
                }
                if (!idColumn) {
                    idColumn = result.rowIds ?? Array.from({ length: chunkRowCount }, (_, i) => i + offset);
                }
                const chunk = {
                    index: chunkIndex,
                    data: result.columns,
                    rowIds: idColumn
                };
                // Evict LRU chunk if limit is reached
                this.evictLRUChunkIfNeeded();
                // DataChunks guaranteed to exist (checked at start)
                this.dataChunks?.set(chunkIndex, chunk);
                // Populate reverse lookup map for getRowIndex
                if (!this.rowIdToChunkInfo) {
                    this.rowIdToChunkInfo = new Map();
                }
                for (let i = 0; i < chunk.rowIds.length; i++) {
                    this.rowIdToChunkInfo.set(chunk.rowIds[i], {
                        chunkIndex,
                        localIndex: i
                    });
                }
                return chunk;
            }
            catch (err) {
                if (controller?.signal.aborted ||
                    (err instanceof DOMException && err.name === 'AbortError')) {
                    return {
                        index: chunkIndex,
                        data: {},
                        rowIds: []
                    };
                }
                // eslint-disable-next-line no-console
                console.error('Error fetching data from remote server.\n', err);
                return {
                    index: chunkIndex,
                    data: {},
                    rowIds: []
                };
            }
            finally {
                // Remove from pending requests when done (success or error)
                this.pendingChunks?.delete(chunkIndex);
                if (controller) {
                    this.pendingControllers.delete(controller);
                }
            }
        })();
        // Store the pending request
        this.pendingChunks.set(chunkIndex, fetchPromise);
        return fetchPromise;
    }
    async getColumnIds() {
        if (this.columnIds) {
            return Promise.resolve(this.columnIds);
        }
        // Fetch first chunk to get columnIds
        await this.fetchChunk(0);
        return this.columnIds ?? [];
    }
    async getRowId(rowIndex) {
        const chunk = await this.getChunkForRowIndex(rowIndex);
        const localIndex = this.getLocalIndexInChunk(rowIndex);
        if (localIndex < chunk.rowIds.length) {
            return chunk.rowIds[localIndex];
        }
        return void 0;
    }
    getRowIndex(rowId) {
        // Check reverse lookup map (O(1))
        const info = this.rowIdToChunkInfo?.get(rowId);
        if (info) {
            if (this.querying.pagination.enabled) {
                // When pagination is enabled, return page-relative index
                return Promise.resolve(info.localIndex);
            }
            // Global index: chunk offset + local index
            return Promise.resolve(info.chunkIndex * this.maxChunkSize + info.localIndex);
        }
        // Not found in cached chunks - return undefined
        // (the chunk containing this rowId hasn't been fetched yet)
        return Promise.resolve(void 0);
    }
    async getRowObject(rowIndex) {
        // Ensure the chunk is fetched and cached
        await this.getChunkForRowIndex(rowIndex);
        // Return from cache
        return this.getRowObjectFromCache(rowIndex);
    }
    async getPrePaginationRowCount() {
        if (this.prePaginationRowCount !== null) {
            return this.prePaginationRowCount;
        }
        // Fetch first chunk to get row count from API metadata
        await this.fetchChunk(0);
        return this.prePaginationRowCount ?? 0;
    }
    async getRowCount() {
        if (this.rowCount !== null) {
            return this.rowCount;
        }
        // Fetch first chunk to get row count
        await this.fetchChunk(0);
        return this.rowCount ?? 0;
    }
    async getValue(columnId, rowIndex) {
        // Get the chunk containing this row
        const chunk = await this.getChunkForRowIndex(rowIndex);
        // Calculate local index within the chunk.
        // When pagination is enabled, rowIndex is already page-relative.
        // When disabled, need to calculate from global index.
        const localIndex = this.getLocalIndexInChunk(rowIndex);
        // Get the column from chunk data
        const column = chunk.data[columnId];
        if (!column || localIndex >= column.length) {
            return null;
        }
        return column[localIndex];
    }
    async setValue(value, columnId, rowId) {
        const { setValueCallback } = this.options;
        if (!setValueCallback) {
            throw new Error('The `setValueCallback` option is not defined.');
        }
        try {
            await setValueCallback.call(this, columnId, rowId, value);
            this.lastQueryFingerprint = null;
            // TODO(optim): Can be optimized by checking if the value was
            // changed in the specific, queried column.
            await this.applyQuery();
        }
        catch (err) {
            const prefix = 'Error persisting value to remote server.';
            if (err instanceof Error) {
                err.message = err.message ?
                    `${prefix} ${err.message}` :
                    prefix;
                throw err;
            }
            throw new Error(`${prefix} ${String(err)}`);
        }
    }
    /**
     * Gets a row object from the local cache without fetching.
     * Returns undefined if the row is not cached.
     *
     * @param rowIndex
     * The row index as passed from the grid.
     *
     * @returns
     * The row object or undefined if not in cache.
     */
    getRowObjectFromCache(rowIndex) {
        if (!this.dataChunks || !this.columnIds) {
            return;
        }
        const chunkIndex = this.getChunkIndexForRow(rowIndex);
        const chunk = this.dataChunks.get(chunkIndex);
        if (!chunk) {
            return;
        }
        const localIndex = this.getLocalIndexInChunk(rowIndex);
        const rowObject = {};
        for (const columnId of this.columnIds) {
            const column = chunk.data[columnId];
            rowObject[columnId] = (column && localIndex < column.length) ?
                column[localIndex] : null;
        }
        return rowObject;
    }
    async getColumnDataType(columnId) {
        const chunk = await this.getChunkForRowIndex(0);
        const column = chunk.data[columnId];
        if (!column) {
            return 'string';
        }
        if (!Array.isArray(column)) {
            // Typed array
            return 'number';
        }
        return DataProvider.assumeColumnDataType(column.slice(0, 30), columnId);
    }
    async applyQuery() {
        const fingerprint = createQueryFingerprint(this.querying);
        if (this.lastQueryFingerprint === fingerprint) {
            return;
        }
        this.lastQueryFingerprint = fingerprint;
        this.requestEpoch++;
        if (this.requestPolicy === 'latest') {
            this.abortPendingRequests();
        }
        // Clear cached chunks when query changes.
        this.dataChunks = null;
        this.pendingChunks = null;
        this.rowIdToChunkInfo = null;
        this.columnIds = null;
        this.prePaginationRowCount = null;
        this.rowCount = null;
        // When pagination is enabled, update the total items count
        // for the pagination controller (used to calculate total pages).
        if (this.querying.pagination.enabled) {
            const totalCount = await this.getPrePaginationRowCount();
            this.querying.pagination.totalItemsCount = totalCount;
        }
    }
    destroy() {
        this.abortPendingRequests();
        this.dataChunks = null;
        this.pendingChunks = null;
        this.rowIdToChunkInfo = null;
        this.columnIds = null;
        this.prePaginationRowCount = null;
        this.rowCount = null;
        this.lastQueryFingerprint = null;
        this.requestEpoch++;
    }
}
RemoteDataProvider.DEFAULT_CHUNK_SIZE = 50;
DataProviderRegistry.registerDataProvider('remote', RemoteDataProvider);
