/* *
 *
 *  Checkbox Cell Renderer class
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
import CheckboxContent from '../ContentTypes/CheckboxContent.js';
import U from '../../../../Core/Utilities.js';
const { merge } = U;
/* *
 *
 *  Class
 *
 * */
/**
 * Renderer for the Checkbox in a column.
 */
class CheckboxRenderer extends CellRenderer {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(column, options) {
        super(column);
        this.options = merge(CheckboxRenderer.defaultOptions, options);
    }
    /* *
     *
     *  Methods
     *
     * */
    render(cell, parentElement) {
        return new CheckboxContent(cell, this, parentElement);
    }
}
/**
 * The default edit mode renderer type name for this view renderer.
 */
CheckboxRenderer.defaultEditingRenderer = 'checkbox';
/**
 * Default options for the checkbox renderer.
 */
CheckboxRenderer.defaultOptions = {
    type: 'checkbox'
};
registerRenderer('checkbox', CheckboxRenderer);
/* *
 *
 *  Default Export
 *
 * */
export default CheckboxRenderer;
