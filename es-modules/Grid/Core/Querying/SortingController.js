/* *
 *
 *  Grid Sorting Controller class
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
 *
 *  Authors:
 *  - Dawid Draguła
 *
 * */
'use strict';
import SortModifier from '../../../Data/Modifiers/SortModifier.js';
/* *
 *
 *  Class
 *
 * */
/**
 * Class that manages one of the data grid querying types - sorting.
 */
class SortingController {
    /* *
    *
    *  Constructor
    *
    * */
    /**
     * Constructs the SortingController instance.
     *
     * @param querying
     * The querying controller instance.
     */
    constructor(querying) {
        this.querying = querying;
    }
    setSorting(orderOrSortings, columnId) {
        if (Array.isArray(orderOrSortings)) {
            const sortings = orderOrSortings
                .filter((sorting) => !!(sorting.columnId && sorting.order))
                .map((sorting) => ({
                columnId: sorting.columnId,
                order: sorting.order
            }));
            const currentSortings = this.currentSortings || [];
            if (!SortingController.sortingsEqual(sortings, currentSortings)) {
                this.querying.shouldBeUpdated = true;
                this.currentSortings = sortings;
                this.currentSorting = sortings[0] || { order: null };
            }
            this.modifier = this.createModifier();
            return;
        }
        const order = orderOrSortings;
        if (this.currentSorting?.columnId !== columnId ||
            this.currentSorting?.order !== order) {
            this.querying.shouldBeUpdated = true;
            this.currentSorting = {
                columnId,
                order
            };
            this.currentSortings = (order && columnId ?
                [{ columnId, order }] :
                []);
        }
        this.modifier = this.createModifier();
    }
    /**
     * Checks whether two sorting state arrays are equal.
     *
     * @param a
     * First sorting state array.
     *
     * @param b
     * Second sorting state array.
     */
    static sortingsEqual(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        for (let i = 0, iEnd = a.length; i < iEnd; ++i) {
            if (a[i].columnId !== b[i].columnId ||
                a[i].order !== b[i].order) {
                return false;
            }
        }
        return true;
    }
    /**
     * Returns the sorting options from the data grid options.
     */
    getSortingOptions() {
        const grid = this.querying.grid;
        const columnPolicy = grid.columnPolicy;
        const columnIDs = columnPolicy.getColumnIds();
        const sortings = [];
        for (let i = 0, iEnd = columnIDs.length; i < iEnd; ++i) {
            const columnId = columnIDs[i];
            if (columnPolicy.isColumnUnbound(columnId)) {
                continue;
            }
            const columnOptions = columnPolicy
                .getIndividualColumnOptions(columnId) || {};
            const order = columnOptions.sorting?.order;
            if (order) {
                sortings.push({
                    columnId,
                    order,
                    priority: columnOptions.sorting?.priority,
                    index: i
                });
            }
        }
        if (sortings.some((sorting) => typeof sorting.priority === 'number')) {
            sortings.sort((a, b) => {
                const aPriority = (typeof a.priority === 'number' ?
                    a.priority :
                    Number.POSITIVE_INFINITY);
                const bPriority = (typeof b.priority === 'number' ?
                    b.priority :
                    Number.POSITIVE_INFINITY);
                if (aPriority !== bPriority) {
                    return aPriority - bPriority;
                }
                return a.index - b.index;
            });
        }
        else {
            sortings.reverse();
        }
        return sortings.map((sorting) => ({
            columnId: sorting.columnId,
            order: sorting.order
        }));
    }
    /**
     * Loads sorting options from the data grid options.
     */
    loadOptions() {
        const sortingsFromOptions = this.getSortingOptions();
        if (!SortingController.sortingsEqual(sortingsFromOptions, this.currentSortings || [])) {
            this.setSorting(sortingsFromOptions);
        }
    }
    /**
     * Returns the sorting modifier based on the loaded sorting options.
     */
    createModifier() {
        const sortings = (this.currentSortings ||
            (this.currentSorting ? [this.currentSorting] : [])).filter((sorting) => !!(sorting.columnId &&
            sorting.order &&
            !this.querying.grid.columnPolicy.isColumnUnbound(sorting.columnId)));
        if (!sortings.length) {
            return;
        }
        const grid = this.querying.grid;
        const sourceSortings = sortings
            .map((sorting) => ({
            ...sorting,
            sourceColumnId: grid.columnPolicy.getColumnSourceId(sorting.columnId)
        }))
            .filter((sorting) => !!sorting.sourceColumnId);
        if (!sourceSortings.length) {
            return;
        }
        const defaultCompare = grid.options?.columnDefaults?.sorting?.compare;
        return new SortModifier({
            direction: sourceSortings[0].order,
            columns: sourceSortings.map((sorting) => ({
                column: sorting.sourceColumnId,
                direction: sorting.order,
                compare: grid.columnPolicy
                    .getIndividualColumnOptions(sorting.columnId)
                    ?.sorting?.compare || defaultCompare
            }))
        });
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default SortingController;
