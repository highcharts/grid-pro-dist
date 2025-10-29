import type Column from '../../Column';
declare namespace StateHelpers {
    /**
     * Checks if the column is filtered.
     *
     * @param column
     * The column to check.
     */
    function isFiltered(column: Column): boolean;
    /**
     * Checks if the column is sorted.
     *
     * @param column
     * The column to check.
     *
     * @param order
     * Optional sorting order to check for.
     *
     * @returns
     * True if the column is sorted. In case of `order` is provided, true
     * only if the column is sorted in the provided order.
     */
    function isSorted(column: Column, order?: ('asc' | 'desc')): boolean;
}
export default StateHelpers;
