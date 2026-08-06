/* *
 *
 *  Grid Filter Toolbar Button class
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  Integration of this software requires a license.
 *  - For commercial use, see www.highcharts.com/license
 *  - For non-commercial, see www.highcharts.com/license-eula
 *
 *
 *  Authors:
 *  - Dawid Draguła
 *
 * */
'use strict';
import FilterPopup from '../FilterPopup.js';
import ToolbarButton from '../../../../UI/ToolbarButton.js';
import StateHelpers from '../StateHelpers.js';
import { addEvent } from '../../../../../../Shared/Utilities.js';
/* *
 *
 *  Class
 *
 * */
class FilterToolbarButton extends ToolbarButton {
    /* *
     *
     *  Constructor
     *
     * */
    constructor() {
        super({
            icon: 'filter',
            classNameKey: 'headerCellFilterIcon',
            accessibility: {
                ariaLabel: 'filter',
                ariaExpanded: false,
                ariaControls: 'filter-popup'
            }
        });
    }
    /* *
     *
     *  Methods
     *
     * */
    refreshState() {
        const column = this.toolbar?.column;
        if (column) {
            this.setActive(StateHelpers.isFiltered(column));
        }
    }
    addEventListeners() {
        super.addEventListeners();
        const toolbar = this.toolbar;
        if (!toolbar) {
            return;
        }
        this.eventListenerDestroyers.push(addEvent(toolbar.column, 'afterFilter', () => {
            this.refreshState();
        }));
    }
    clickHandler(event) {
        super.clickHandler(event);
        const filtering = this.toolbar?.column.filtering;
        if (!filtering) {
            return;
        }
        if (!this.popup) {
            this.popup = new FilterPopup(filtering, this);
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
