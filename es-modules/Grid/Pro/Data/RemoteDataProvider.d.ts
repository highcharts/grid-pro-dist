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
     * Reverse lookup map from rowId to { chunkIndex, localIndex } for O(1)
     * lookup in getRowIndex.
     */
    private rowIdToChunkInfo;
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
     * Returns the effective chunk size.
     * When pagination is enabled, uses the page size as chunk size,
     * so that one chunk = one page.
     */
    private get maxChunkSize();
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
     * @returns
     * The local index within the chunk.
     */
    private getLocalIndexInChunk;
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
    columns: Record<string, DataTableColumnType>;
    totalRowCount: number;
    rowIds?: RowId[];
}
export interface DataChunk {
    index: number;
    data: Record<string, DataTableColumnType>;
    rowIds: RowId[];
}
export interface RemoteDataProviderOptions extends DataProviderOptions {
    providerType: 'remote';
    /**
     * Serialized data source configuration, alternatively to `fetchCallback`.
     */
    dataSource?: DataSourceOptions;
    /**
     * Custom callback to fetch data from the remote server. Has higher priority
     * than `dataSource`.
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
