/* *
 *
 *  Grid Querying Controller class
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
import ChainModifier from '../../../Data/Modifiers/ChainModifier.js';
import SortingController from './SortingController.js';
import FilteringController from './FilteringController.js';
import PaginationController from './PaginationController.js';
/* *
 *
 *  Class
 *
 * */
/**
 * Class that manage data modification of the visible data in the data grid.
 * It manages the modifiers that are applied to the data table.
 */
class QueryingController {
    /* *
    *
    *  Constructor
    *
    * */
    constructor(grid) {
        /**
         * This flag should be set to `true` if the modifiers should reapply to the
         * data table due to some data change or other important reason.
         */
        this.shouldBeUpdated = false;
        this.grid = grid;
        this.filtering = new FilteringController(this);
        this.sorting = new SortingController(this);
        this.pagination = new PaginationController(this);
    }
    /* *
    *
    *  Functions
    *
    * */
    /**
     * Proceeds with the data modification if needed.
     *
     * @param force
     * If the data should be modified even if the significant options are not
     * changed.
     */
    async proceed(force = false) {
        if (force || this.shouldBeUpdated) {
            await this.modifyData();
        }
    }
    /**
     * Load all options needed to generate the modifiers.
     */
    loadOptions() {
        this.filtering.loadOptions();
        this.sorting.loadOptions();
        this.pagination.loadOptions();
    }
    /**
     * Creates a list of modifiers that should be applied to the data table.
     */
    willNotModify() {
        return (!this.sorting.modifier &&
            !this.filtering.modifier);
    }
    /**
     * Returns a list of modifiers that should be applied to the data table.
     */
    getGroupedModifiers() {
        const modifiers = [];
        if (this.sorting.modifier) {
            modifiers.push(this.sorting.modifier);
        }
        if (this.filtering.modifier) {
            modifiers.push(this.filtering.modifier);
        }
        return modifiers;
    }
    /**
     * Apply all modifiers to the data table.
     */
    async modifyData() {
        const originalDataTable = this.grid.dataTable;
        if (!originalDataTable) {
            return;
        }
        const groupedModifiers = this.getGroupedModifiers();
        let interTable;
        // Grouped modifiers
        if (groupedModifiers.length > 0) {
            const chainModifier = new ChainModifier({}, ...groupedModifiers);
            const dataTableCopy = originalDataTable.clone();
            await chainModifier.modify(dataTableCopy.getModified());
            interTable = dataTableCopy.getModified();
        }
        else {
            interTable = originalDataTable.getModified();
        }
        // Pagination modifier
        const paginationModifier = this.pagination.createModifier(interTable.rowCount);
        if (paginationModifier) {
            interTable = interTable.clone();
            await paginationModifier.modify(interTable);
            interTable = interTable.getModified();
        }
        this.grid.presentationTable = interTable;
        this.shouldBeUpdated = false;
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default QueryingController;
