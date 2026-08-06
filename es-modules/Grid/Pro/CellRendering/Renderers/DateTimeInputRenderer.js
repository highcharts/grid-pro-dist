/* *
 *
 *  Date Time Input Cell Renderer class
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
import { CellRenderer } from '../CellRenderer.js';
import { registerRenderer } from '../CellRendererRegistry.js';
import DateTimeInputContent from '../ContentTypes/DateTimeInputContent.js';
import { merge } from '../../../../Shared/Utilities.js';
/* *
 *
 *  Class
 *
 * */
/**
 * Renderer for the Select in a column..
 */
class DateTimeInputRenderer extends CellRenderer {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(column, options) {
        super(column);
        this.options = merge(DateTimeInputRenderer.defaultOptions, options);
    }
    /* *
     *
     *  Methods
     *
     * */
    render(cell, parentElement) {
        return new DateTimeInputContent(cell, this, parentElement);
    }
}
/**
 * The default edit mode renderer type name for this view renderer.
 */
DateTimeInputRenderer.defaultEditingRenderer = 'dateTimeInput';
/**
 * Default options for the date input renderer.
 */
DateTimeInputRenderer.defaultOptions = {
    type: 'dateTimeInput'
};
registerRenderer('dateTimeInput', DateTimeInputRenderer);
/* *
 *
 *  Default Export
 *
 * */
export default DateTimeInputRenderer;
