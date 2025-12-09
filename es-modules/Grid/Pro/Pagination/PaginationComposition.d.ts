import type Pagination from '../../Core/Pagination/Pagination';
declare module '../../Core/Pagination/PaginationOptions' {
    interface PaginationOptions {
        /**
         * Pagination events.
         *
         */
        events?: PaginationEvents;
    }
}
/**
 * Pagination events for Pro version.
 */
export interface PaginationEvents {
    /**
     * Fired before a page change occurs.
     *
     * @param e
     * The event object.
     */
    beforePageChange?: (e: BeforePageChangeEvent) => void;
    /**
     * Fired after a page change occurs.
     *
     * @param e
     * The event object.
     */
    afterPageChange?: (e: AfterPageChangeEvent) => void;
    /**
     * Fired before the page size setting changes.
     *
     * @param e
     * The event object.
     */
    beforePageSizeChange?: (e: BeforePageSizeChangeEvent) => void;
    /**
     * Fired after the page size setting changes.
     *
     * @param e
     * The event object.
     */
    afterPageSizeChange?: (e: AfterPageSizeChangeEvent) => void;
}
export interface BeforePageChangeEvent {
    currentPage: number;
    nextPage: number;
    pageSize: number;
}
export interface AfterPageChangeEvent {
    currentPage: number;
    previousPage: number;
    pageSize: number;
}
export interface BeforePageSizeChangeEvent {
    pageSize: number;
    newPageSize: number;
}
export interface AfterPageSizeChangeEvent {
    pageSize: number;
    previousPageSize: number;
}
export type PaginationEvent = Record<string, number> & {
    target: Pagination;
};
declare const _default: {
    readonly compose: typeof compose;
};
export default _default;
