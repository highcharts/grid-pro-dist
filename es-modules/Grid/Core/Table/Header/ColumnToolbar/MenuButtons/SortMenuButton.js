/* *
 *
 *  Grid Sort Context Menu Button class
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
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
        this.baseLabel = langOptions[direction === 'asc' ? 'sortAscending' : 'sortDescending'] || '';
        this.options.label = this.baseLabel;
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
        const isSorted = StateHelpers.isSorted(column, this.direction);
        this.setActive(isSorted);
        // Update label with priority if multi-column sorting is active
        this.updateLabelWithPriority(isSorted ? column : void 0);
    }
    /**
     * Updates the label to include the sort priority when multi-column
     * sorting is active.
     *
     * @param column
     * The column to get the priority from, or undefined to reset the label.
     */
    updateLabelWithPriority(column) {
        if (!column) {
            this.setLabel(this.baseLabel);
            return;
        }
        const { currentSortings } = column.viewport.grid.querying.sorting;
        const sortings = currentSortings || [];
        const sortIndex = sortings.findIndex((sorting) => sorting.columnId === column.id);
        const priority = (sortings.length > 1 && sortIndex !== -1 ?
            sortIndex + 1 :
            void 0);
        if (priority) {
            this.setLabel(`${this.baseLabel} (${priority})`);
        }
        else {
            this.setLabel(this.baseLabel);
        }
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
        void sorting.setOrder(this.isActive ? null : this.direction, !!event?.shiftKey);
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default SortMenuButton;
