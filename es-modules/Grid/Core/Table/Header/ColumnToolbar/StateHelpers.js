/* *
 *
 *  Grid Header Cell State Helpers namespace
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
/* *
 *
 *  Namespace
 *
 * */
var StateHelpers;
(function (StateHelpers) {
    /**
     * Checks if the column is filtered.
     *
     * @param column
     * The column to check.
     */
    function isFiltered(column) {
        const { condition, value } = column.options.filtering || {};
        return !!(condition && (['empty', 'notEmpty', 'true', 'false'].includes(condition) ||
            (value !== void 0 && value !== '') // Accept null and 0
        ));
    }
    StateHelpers.isFiltered = isFiltered;
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
    function isSorted(column, order) {
        const { currentSorting } = column.viewport.grid.querying.sorting || {};
        if (currentSorting?.columnId !== column.id) {
            return false;
        }
        return order ?
            currentSorting?.order === order :
            !!currentSorting?.order;
    }
    StateHelpers.isSorted = isSorted;
})(StateHelpers || (StateHelpers = {}));
/* *
 *
 *  Default Export
 *
 * */
export default StateHelpers;
