/* *
 *
 *  Grid Pagination Controller class
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
 *
 *  Authors:
 *  - Sebastian Bochan
 *
 * */
'use strict';
/* *
 *
 *  Imports
 *
 * */
import { hasDataTableProvider } from '../Data/DataProvider.js';
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
        /**
         * The current page (1-based index).
         */
        this.currentPage = 1;
        /**
         * The current page size.
         */
        this.currentPageSize = 10;
        this.querying = querying;
        this.enabled = !!querying.grid.options?.pagination?.enabled;
    }
    /* *
    *
    *  Functions
    *
    * */
    /**
     * Total number of items (rows before pagination).
     */
    get totalItems() {
        return this.totalItemsCount ?? 0;
    }
    /**
     * Gets the total number of pages.
     */
    get totalPages() {
        const computed = this.currentPageSize > 0 ? Math.ceil(this.totalItems / this.currentPageSize) : 1;
        return Math.max(1, computed);
    }
    /**
     * Clamps the current page to the valid range [1, totalPages].
     */
    clampPage() {
        if (this.totalItemsCount === void 0) {
            return;
        }
        const target = Math.max(1, Math.min(this.currentPage, this.totalPages || 1));
        if (this.currentPage === target) {
            return;
        }
        this.currentPage = target;
        this.querying.shouldBeUpdated = true;
    }
    /**
     * Sets the page.
     *
     * @param currentPage
     * The current page.
     */
    setPage(currentPage) {
        this.currentPage = currentPage;
        this.clampPage();
        this.querying.shouldBeUpdated = true;
    }
    /**
     * Sets the page size.
     *
     * @param pageSize
     * The page size.
     */
    setPageSize(pageSize) {
        this.currentPageSize = pageSize;
        this.querying.shouldBeUpdated = true;
    }
    /**
     * Loads range options from the grid options.
     */
    loadOptions() {
        const options = this.querying.grid.options?.pagination || {};
        if (this.enabled === !options.enabled) {
            this.enabled = !!options.enabled;
            this.querying.shouldBeUpdated = true;
        }
        if (this.currentPageSize !== options.pageSize) {
            this.setPageSize(options.pageSize ?? this.currentPageSize);
        }
        if (this.currentPage !== options.page) {
            this.setPage(options.page ?? this.currentPage);
        }
    }
    /**
     * Returns the range modifier.
     *
     * @param rowsCountBeforePagination
     * The number of rows before pagination. Default is the number of rows in
     * the original data table.
     */
    createModifier(rowsCountBeforePagination = (hasDataTableProvider(this.querying.grid.dataProvider) ?
        this.querying.grid.dataProvider.getDataTable()?.rowCount || 0 :
        0)) {
        if (!this.enabled) {
            return;
        }
        const currentPage = this.currentPage;
        const pageSize = this.currentPageSize;
        // Calculate the start index (0-based)
        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, rowsCountBeforePagination);
        this.totalItemsCount = rowsCountBeforePagination;
        return new RangeModifier({
            start,
            end
        });
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default PaginationController;
