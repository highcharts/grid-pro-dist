/* *
 *
 *  Grid Filter Context Menu Button class
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
import FilterPopup from '../FilterPopup.js';
import StateHelpers from '../StateHelpers.js';
import ContextMenuButton from '../../../../UI/ContextMenuButton.js';
import U from '../../../../../../Core/Utilities.js';
const { addEvent } = U;
/* *
 *
 *  Class
 *
 * */
class FilterToolbarButton extends ContextMenuButton {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(langOptions) {
        super({
            label: langOptions.filter,
            icon: 'filter',
            chevron: true
        });
    }
    /* *
     *
     *  Methods
     *
     * */
    refreshState() {
        const column = this.contextMenu?.button.toolbar?.column;
        if (column) {
            this.setActive(StateHelpers.isFiltered(column));
        }
    }
    addEventListeners() {
        super.addEventListeners();
        const toolbar = this.contextMenu?.button.toolbar;
        if (!toolbar) {
            return;
        }
        this.eventListenerDestroyers.push(addEvent(toolbar.column, 'afterFilter', () => {
            this.refreshState();
        }));
    }
    clickHandler(event) {
        super.clickHandler(event);
        const filtering = this.contextMenu?.button.toolbar?.column.filtering;
        if (!filtering) {
            return;
        }
        if (!this.popup) {
            this.popup = new FilterPopup(filtering, this, {
                nextToAnchor: true
            });
        }
        this.popup.toggle(this.wrapper);
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default FilterToolbarButton;
