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
 *  - Dawid Draguła
 *
 * */
'use strict';
import ToolbarButton from '../../../../UI/ToolbarButton.js';
import GridUtils from '../../../../GridUtils.js';
import StateHelpers from '../StateHelpers.js';
import MenuPopup from '../MenuPopup.js';
import { addEvent } from '../../../../../../Shared/Utilities.js';
const { formatText } = GridUtils;
/* *
 *
 *  Class
 *
 * */
class MenuToolbarButton extends ToolbarButton {
    getColumnLabel() {
        const column = this.toolbar?.column;
        const label = (column?.header?.headerContent?.textContent ||
            column?.id ||
            '').trim();
        return label || column?.id || '';
    }
    updateA11yLabel() {
        const button = this.wrapper?.querySelector('button');
        const column = this.toolbar?.column;
        const lang = column?.viewport.grid.options?.lang;
        const columnLabel = this.getColumnLabel();
        const menuLabel = formatText(lang?.accessibility?.columnMenu || 'Open menu for {column}.', { column: columnLabel });
        if (button && menuLabel) {
            button.setAttribute('aria-label', menuLabel);
        }
    }
    /* *
     *
     *  Constructor
     *
     * */
    constructor() {
        super({
            icon: 'menu',
            classNameKey: 'headerCellMenuIcon',
            accessibility: {
                ariaExpanded: false
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
        this.updateA11yLabel();
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
