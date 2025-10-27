/* *
 *
 *  Grid Sort Context Menu Button class
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
import ContextMenuButton from '../../../../UI/ContextMenuButton.js';
import StateHelpers from '../StateHelpers.js';
import U from '../../../../../../Core/Utilities.js';
const { addEvent } = U;
/* *
 *
 *  Class
 *
 * */
class SortMenuButton extends ContextMenuButton {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(langOptions, direction) {
        super({ icon: direction === 'asc' ? 'sortAsc' : 'sortDesc' });
        this.direction = direction;
        this.options.label = langOptions[direction === 'asc' ? 'sortAscending' : 'sortDescending'];
    }
    /* *
     *
     *  Methods
     *
     * */
    refreshState() {
        const column = this.contextMenu?.button?.toolbar?.column;
        if (!column) {
            return;
        }
        this.setActive(StateHelpers.isSorted(column, this.direction));
    }
    addEventListeners() {
        super.addEventListeners();
        const column = this.contextMenu?.button?.toolbar?.column;
        if (!column) {
            return;
        }
        // If this grid is currently sorted, update the state
        this.eventListenerDestroyers.push(addEvent(column.viewport.grid, 'afterSort', () => this.refreshState()));
    }
    clickHandler(event) {
        super.clickHandler(event);
        const sorting = this.contextMenu?.button?.toolbar?.column.sorting;
        if (!sorting) {
            return;
        }
        void sorting.setOrder(this.isActive ? null : this.direction);
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default SortMenuButton;
