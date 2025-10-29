/* *
 *
 *  Grid Sort Toolbar Button class
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
import ToolbarButton from '../../../../UI/ToolbarButton.js';
import StateHelpers from '../StateHelpers.js';
import U from '../../../../../../Core/Utilities.js';
const { addEvent } = U;
/* *
 *
 *  Class
 *
 * */
class SortToolbarButton extends ToolbarButton {
    /* *
     *
     *  Constructor
     *
     * */
    constructor() {
        super({
            icon: 'upDownArrows',
            classNameKey: 'headerCellSortIcon',
            accessibility: {
                ariaLabel: 'sort'
            }
        });
    }
    /* *
     *
     *  Methods
     *
     * */
    clickHandler(event) {
        super.clickHandler(event);
        this.toolbar?.column.sorting?.toggle();
    }
    refreshState() {
        const column = this.toolbar?.column;
        if (!column) {
            return;
        }
        if (!StateHelpers.isSorted(column)) {
            this.setActive(false);
            this.setIcon('upDownArrows');
            return;
        }
        const { currentSorting } = column.viewport.grid.querying.sorting;
        this.setActive(true);
        this.setIcon(currentSorting?.order === 'asc' ? 'sortAsc' : 'sortDesc');
    }
    addEventListeners() {
        super.addEventListeners();
        const column = this.toolbar?.column;
        if (!column) {
            return;
        }
        // If this grid is currently sorted, update the state
        this.eventListenerDestroyers.push(addEvent(column.viewport.grid, 'afterSort', () => this.refreshState()));
    }
    renderActiveIndicator() {
        // Do nothing
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default SortToolbarButton;
