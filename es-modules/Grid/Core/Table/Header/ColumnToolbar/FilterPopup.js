/* *
 *
 *  Grid Filter Popup class
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
import Popup from '../../../UI/Popup.js';
import U from '../../../../../Core/Utilities.js';
const { merge } = U;
/* *
 *
 *  Class
 *
 * */
/**
 * The column filtering popup.
 */
class FilterPopup extends Popup {
    /* *
     *
     *  Constructor
     *
     * */
    /**
     * Constructs a column filtering popup.
     *
     * @param filtering
     * The column filtering.
     *
     * @param button
     * The button that opened the popup.
     *
     * @param options
     * Popup options.
     */
    constructor(filtering, button, options) {
        const grid = filtering.column.viewport.grid;
        super(grid, button, merge({
            header: {
                category: grid.options?.lang?.setFilter,
                label: filtering.column.header?.value || ''
            }
        }, options));
        this.filtering = filtering;
    }
    /* *
     *
     *  Methods
     *
     * */
    show(anchorElement) {
        super.show(anchorElement);
        this.filtering.filterSelect?.focus();
    }
    renderContent(contentElement) {
        this.filtering.renderFilteringContent(contentElement);
    }
    onKeyDown(event) {
        super.onKeyDown(event);
        this.filtering.onKeyDown(event);
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default FilterPopup;
