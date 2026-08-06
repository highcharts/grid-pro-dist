/* *
 *
 *  Select Cell Renderer class
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
 *  - Sebastian Bochan
 *
 * */
'use strict';
import { CellRenderer } from '../CellRenderer.js';
import { registerRenderer } from '../CellRendererRegistry.js';
import SelectContent from '../ContentTypes/SelectContent.js';
import { merge } from '../../../../Shared/Utilities.js';
/* *
 *
 *  Class
 *
 * */
/**
 * Renderer for the Select in a column..
 */
class SelectRenderer extends CellRenderer {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(column, options) {
        super(column);
        this.options = merge(SelectRenderer.defaultOptions, options);
    }
    /* *
     *
     *  Methods
     *
     * */
    render(cell, parentElement) {
        return new SelectContent(cell, this, parentElement);
    }
}
/**
 * The default edit mode renderer type name for this view renderer.
 */
SelectRenderer.defaultEditingRenderer = 'select';
/**
 * Default options for the select renderer.
 */
SelectRenderer.defaultOptions = {
    type: 'select',
    options: []
};
registerRenderer('select', SelectRenderer);
/* *
 *
 *  Default Export
 *
 * */
export default SelectRenderer;
