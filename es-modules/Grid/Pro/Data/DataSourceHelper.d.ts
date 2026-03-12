import type { RemoteFetchCallbackResult } from './RemoteDataProvider';
import type QueryingController from '../../Core/Querying/QueryingController';
/**
 * Builds a URL with query parameters for fetching data from the remote server.
 *
 * @param options
 * The options for building the URL.
 *
 * @param state
 * The query state containing the query, offset and limit.
 *
 * @returns
 * The complete URL string with all query parameters.
 */
export declare function buildUrl(options: DataSourceOptions, state: QueryState): string;
/**
 * Fetches data from the remote server using the data source options.
 *
 * @param options
 * The options for fetching data from the remote server.
 *
 * @param state
 * The query state containing the query, offset and limit.
 *
 * @returns
 * The fetched data.
 */
export declare function dataSourceFetch(options: DataSourceOptions, state: QueryState): Promise<RemoteFetchCallbackResult>;
/**
 * Serialized configuration alternatively to `fetchCallback`.
 */
export interface DataSourceOptions {
    /**
     * The URL template to be used to fetch data from the remote server.
     * Available template variables:
     * - `page` - The current page number.
     * - `pageSize` - The current page size.
     * - `offset` - The current offset ((page - 1) * pageSize).
     * - `limit` - Alias to `pageSize`.
     * - `filter` - The filter conditions.
     * - `sortBy` - The sort by conditions.
     * - `sortOrder` - The sort order.
     *
     * Example: `https://api.example.com/data?page={page}&pageSize={pageSize}`
     *
     * This list can be extended by adding custom template variables to the
     * `templateVariables` option.
     */
    urlTemplate: string;
    /**
     * Template variables to be replaced in the urlTemplate.
     */
    templateVariables?: Record<string, (state: QueryState) => string>;
    /**
     * If `true`, empty query parameters are omitted from the URL.
     * @default true
     */
    omitEmpty?: boolean;
    /**
     * Callback to parse the response from the remote server.
     */
    parseResponse?: (res: Response) => Promise<RemoteFetchCallbackResult>;
    /**
     * Timeout (ms) for the remote request. Set to 0 to disable.
     * @default 30000
     */
    fetchTimeout?: number;
}
export interface QueryState {
    query: QueryingController;
    offset: number;
    limit: number;
    signal?: AbortSignal;
}
