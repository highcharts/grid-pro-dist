import type { RowObject as RowObjectType, Column as DataTableColumnType, CellType as DataTableCellType } from '../../../Data/DataTable';
import type { DataProviderOptions, RowId } from '../../Core/Data/DataProvider';
import type { ColumnDataType } from '../../Core/Table/Column';
import type QueryingController from '../../Core/Querying/QueryingController';
import type { DataSourceOptions } from './DataSourceHelper';
import { DataProvider } from '../../Core/Data/DataProvider.js';
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
export declare class RemoteDataProvider extends DataProvider {
    private static readonly DEFAULT_CHUNK_SIZE;
    readonly options: RemoteDataProviderOptions;
    /**
     * Total row count before pagination (from API metadata `totalRowCount`).
     */
    private prePaginationRowCount;
    /**
     * Current row count after pagination (actual rows returned in the chunk).
     * When pagination is disabled, this equals prePaginationRowCount.
     */
    private rowCount;
    /**
     * Array of column IDs that have been fetched from the remote server.
     */
    private columnIds;
    /**
     * Cached chunks are used to store the data for the chunks that have been
     * fetched from the remote server.
     */
    private dataChunks;
    /**
     * Pending chunks are used to deduplicate concurrent requests for the same
     * chunk.
     */
    private pendingChunks;
    /**
     * Reverse lookup map from rowId to { offset, localIndex } for O(1)
     * lookup in getRowIndex.
     */
    private rowIdToChunkInfo;
    /**
     * Effective chunk size reported by the backend for the current query.
     * When defined, it takes precedence over the configured chunk size.
     */
    private effectiveChunkSize;
    /**
     * Epoch used to invalidate stale in-flight requests when the chunk layout
     * changes (for example when the backend clamps the requested page size).
     */
    private chunkLayoutEpoch;
    /**
     * Fingerprint of the last applied query; used to avoid clearing caches
     * when the query did not actually change.
     */
    private lastQueryFingerprint;
    /**
     * Epoch used to invalidate stale in-flight requests when the query changes.
     */
    private requestEpoch;
    /**
     * Abort controllers for in-flight requests (latest-only policy).
     */
    private pendingControllers;
    /**
     * Returns the configured chunk size for the current query.
     * When pagination is enabled, one chunk always equals one page.
     */
    private get configuredChunkSize();
    /**
     * Returns the effective chunk size used for index calculations.
     */
    private get activeChunkSize();
    private get requestPolicy();
    private abortPendingRequests;
    private getChunkForRowIndex;
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
    private getChunkIndexForRow;
    /**
     * Gets the local index within the cached chunk data.
     * When pagination is enabled, rowIndex is already 0-based within the page.
     * When disabled, need to calculate offset within the chunk.
     *
     * @param rowIndex
     * The row index passed from the grid.
     *
     * @param chunk
     * The data chunk containing the row. Optional, used to optimize index
     *
     * @returns
     * The local index within the chunk.
     */
    private getLocalIndexInChunk;
    /**
     * Clears cached chunk data and reverse lookup maps.
     */
    private clearChunkCache;
    /**
     * Adopts the effective chunk size reported by the backend for the current
     * query and invalidates chunk caches that were built with the previous
     * layout.
     *
     * @param chunkSize
     * The chunk size confirmed by the backend.
     */
    private adoptEffectiveChunkSize;
    /**
     * Evicts the least recently used chunk if the cache limit is reached.
     * Also cleans up the reverse lookup map for evicted rowIds.
     */
    private evictLRUChunkIfNeeded;
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
    private fetchChunk;
    getColumnIds(): Promise<string[]>;
    getRowId(rowIndex: number): Promise<RowId | undefined>;
    getRowIndex(rowId: RowId): Promise<number | undefined>;
    getRowObject(rowIndex: number): Promise<RowObjectType | undefined>;
    getPrePaginationRowCount(): Promise<number>;
    getRowCount(): Promise<number>;
    getValue(columnId: string, rowIndex: number): Promise<DataTableCellType>;
    setValue(value: DataTableCellType, columnId: string, rowId: RowId): Promise<void>;
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
    private getRowObjectFromCache;
    getColumnDataType(columnId: string): Promise<ColumnDataType>;
    applyQuery(): Promise<void>;
    destroy(): void;
}
export interface RemoteFetchCallbackResult {
    /**
     * Column data keyed by column ID, where each value is an array of cell
     * values for the fetched rows.
     */
    columns: Record<string, DataTableColumnType>;
    /**
     * Total number of rows available on the server for the current query.
     * Used to calculate page count and scrollbar size.
     */
    totalRowCount: number;
    /**
     * Stable identifiers for the fetched rows. When omitted, the Grid assigns
     * sequential numeric IDs starting from `offset`.
     */
    rowIds?: RowId[];
    /**
     * Effective page size used by the backend for the returned chunk.
     * Return this when the server can clamp or otherwise adjust the requested
     * page size so the Grid can keep chunk indexing aligned.
     */
    pageSize?: number;
}
export interface DataChunk {
    index: number;
    offset: number;
    data: Record<string, DataTableColumnType>;
    rowIds: RowId[];
}
export interface RemoteDataProviderOptions extends DataProviderOptions {
    /**
     * The remote data provider type.
     *
     * @default 'remote'
     */
    providerType: 'remote';
    /**
     * Serialized data source configuration, alternatively to `fetchCallback`.
     *
     * @sample grid-pro/demo/serverside-data
     *         Server-side data source
     */
    dataSource?: DataSourceOptions;
    /**
     * Custom callback to fetch data from the remote server. Has higher priority
     * than `dataSource`.
     *
     * @param query
     * The current query state (sorting, filtering, pagination).
     *
     * @param offset
     * Zero-based index of the first row to fetch.
     *
     * @param limit
     * Number of rows to fetch.
     *
     * @param signal
     * Abort signal that fires when the request is superseded by a newer one.
     *
     * @returns
     * A `RemoteFetchCallbackResult` with `columns`, `totalRowCount`, and
     * optionally `rowIds` and `pageSize`. See `RemoteFetchCallbackResult` for
     * field descriptions.
     *
     * @sample grid-pro/options/remote-fetch-callback
     *         Remote fetch callback
     */
    fetchCallback?: (this: RemoteDataProvider, query: QueryingController, offset: number, limit: number, signal?: AbortSignal) => Promise<RemoteFetchCallbackResult>;
    /**
     * Callback to persist value changes to the remote server. If not provided,
     * cell value editing will not be possible.
     *
     * The callback receives the column ID, row ID and value to set.
     */
    setValueCallback?: (this: RemoteDataProvider, columnId: string, rowId: RowId, value: DataTableCellType) => Promise<void>;
    /**
     * The number of rows to fetch per chunk.
     */
    chunkSize?: number;
    /**
     * Maximum number of chunks to keep in memory. When exceeded, the least
     * recently used (LRU) chunk is evicted. If not set, all chunks are kept.
     */
    chunksLimit?: number;
    /**
     * Request policy for rapid query changes. `latest` aborts or ignores
     * in-flight requests so only the final query updates the cache.
     * @default 'latest'
     */
    requestPolicy?: 'latest' | 'all';
    /**
     * The column ID that contains the stable, unique row IDs. If not
     * provided, the row IDs will be extracted from the `result.rowIds` property
     * if available. If `result.rowIds` is also not defined, the row IDs will
     * default to the indices of the rows in their display order.
     */
    idColumn?: string;
}
declare module '../../Core/Data/DataProviderType' {
    interface DataProviderTypeRegistry {
        remote: typeof RemoteDataProvider;
    }
}
