/* *
 *
 *  Grid Filter Popup class
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
import Popup from '../../../UI/Popup.js';
import { merge } from '../../../../../Shared/Utilities.js';
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
