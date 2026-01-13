/* *
 *
 *  Date Input Cell Renderer class
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
 *
 *  Authors:
 *  - Dawid Dragula
 *  - Sebastian Bochan
 *
 * */
'use strict';
import { CellRenderer } from '../CellRenderer.js';
import { registerRenderer } from '../CellRendererRegistry.js';
import DateInputContent from '../ContentTypes/DateInputContent.js';
import U from '../../../../Core/Utilities.js';
const { merge } = U;
/* *
 *
 *  Class
 *
 * */
/**
 * Renderer for the Select in a column..
 */
class DateInputRenderer extends CellRenderer {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(column, options) {
        super(column);
        this.options = merge(DateInputRenderer.defaultOptions, options);
    }
    /* *
     *
     *  Methods
     *
     * */
    render(cell, parentElement) {
        return new DateInputContent(cell, this, parentElement);
    }
}
/**
 * The default edit mode renderer type name for this view renderer.
 */
DateInputRenderer.defaultEditingRenderer = 'dateInput';
/**
 * Default options for the date input renderer.
 */
DateInputRenderer.defaultOptions = {
    type: 'dateInput'
};
registerRenderer('dateInput', DateInputRenderer);
/* *
 *
 *  Default Export
 *
 * */
export default DateInputRenderer;
