/* *
 *
 *  Grid Pagination Controller class
 *
 *  (c) 2020-2025 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Sebastian Bochan
 *
 * */
'use strict';
import RangeModifier from '../../../Data/Modifiers/RangeModifier.js';
/* *
 *
 *  Class
 *
 * */
/**
 * Class that manages one of the data grid querying types - pagination.
 */
class PaginationController {
    /* *
    *
    *  Constructor
    *
    * */
    /**
     * Constructs the PaginationController instance.
     *
     * @param querying
     * The querying controller instance.
     */
    constructor(querying) {
        this.querying = querying;
    }
    /* *
    *
    *  Functions
    *
    * */
    /**
     * Sets the range options.
     *
     * @param currentPage
     * The current page.
     */
    setRange(currentPage) {
        this.currentPage = currentPage;
        this.querying.shouldBeUpdated = true;
    }
    /**
     * Loads range options from the grid options.
     */
    loadOptions() {
        const pagination = this.querying.grid.pagination;
        if (pagination?.options.enabled &&
            this.currentPage !== pagination.currentPage) {
            this.currentPage = pagination.currentPage;
            this.setRange(this.currentPage);
        }
    }
    /**
     * Returns the range modifier.
     *
     * @param rowsCountBeforePagination
     * The number of rows before pagination. Default is the number of rows in
     * the original data table.
     */
    createModifier(rowsCountBeforePagination = (this.querying.grid.dataTable?.rowCount || 0)) {
        const currentPage = this.currentPage || 1; // Start from page 1, not 0
        const pageSize = this.querying.grid.pagination?.currentPageSize;
        if (!pageSize) {
            return;
        }
        // Calculate the start index (0-based)
        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, rowsCountBeforePagination);
        this.totalItems = rowsCountBeforePagination;
        return new RangeModifier({
            start,
            end
        });
    }
    /**
     * Reset the pagination controller.
     */
    reset() {
        delete this.currentPage;
        this.querying.shouldBeUpdated = true;
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default PaginationController;
