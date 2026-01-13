/* *
 *
 *  Grid Menu Toolbar Button class
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
import ToolbarButton from '../../../../UI/ToolbarButton.js';
import StateHelpers from '../StateHelpers.js';
import MenuPopup from '../MenuPopup.js';
import U from '../../../../../../Core/Utilities.js';
const { addEvent } = U;
/* *
 *
 *  Class
 *
 * */
class MenuToolbarButton extends ToolbarButton {
    /* *
     *
     *  Constructor
     *
     * */
    constructor() {
        super({
            icon: 'menu',
            classNameKey: 'headerCellMenuIcon'
        });
    }
    /* *
     *
     *  Methods
     *
     * */
    clickHandler(event) {
        super.clickHandler(event);
        const grid = this.toolbar?.column.viewport.grid;
        if (!grid) {
            return;
        }
        if (!this.popup) {
            this.popup = new MenuPopup(grid, this);
        }
        this.popup.toggle(this.wrapper);
    }
    refreshState() {
        const column = this.toolbar?.column;
        if (!column) {
            return;
        }
        this.setActive(StateHelpers.isSorted(column) ||
            StateHelpers.isFiltered(column));
    }
    addEventListeners() {
        super.addEventListeners();
        const column = this.toolbar?.column;
        if (!column) {
            return;
        }
        this.eventListenerDestroyers.push(addEvent(column.viewport.grid, 'afterSort', () => {
            this.refreshState();
        }), addEvent(column, 'afterFilter', () => {
            this.refreshState();
        }));
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default MenuToolbarButton;
