import type Column from '../../Column';
/**
 * Checks if the column is filtered.
 *
 * @param column
 * The column to check.
 */
export declare function isFiltered(column: Column): boolean;
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
export declare function isSorted(column: Column, order?: ('asc' | 'desc')): boolean;
declare const _default: {
    readonly isFiltered: typeof isFiltered;
    readonly isSorted: typeof isSorted;
};
export default _default;
