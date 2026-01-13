/* *
 *
 *  Sparkline Cell Renderer class
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
import SparklineContent from '../ContentTypes/SparklineContent.js';
import U from '../../../../Core/Utilities.js';
const { merge } = U;
/* *
 *
 *  Class
 *
 * */
/**
 * Renderer for the Text in a column..
 */
class SparklineRenderer extends CellRenderer {
    /**
     * Imports the Highcharts namespace to be used by the Sparkline Renderer.
     *
     * @param H
     * Highcharts namespace.
     */
    static useHighcharts(H) {
        if (H && !SparklineContent.H) {
            SparklineContent.H = H;
        }
    }
    /* *
     *
     *  Constructor
     *
     * */
    constructor(column) {
        super(column);
        if (!SparklineContent.H) {
            throw new Error('Sparkline Renderer: Highcharts is not loaded. Please ensure ' +
                'that Highcharts namespace is registered before the Sparkline' +
                ' Renderer is used.');
        }
        this.options = merge(SparklineRenderer.defaultOptions, this.column.options.cells?.renderer || {});
    }
    /* *
     *
     *  Methods
     *
     * */
    render(cell) {
        return new SparklineContent(cell, this);
    }
}
/**
 * The default edit mode renderer type names for this view renderer.
 */
SparklineRenderer.defaultEditingRenderer = 'textInput';
/**
 * Default options for the sparkline renderer.
 */
SparklineRenderer.defaultOptions = {
    type: 'sparkline'
};
registerRenderer('sparkline', SparklineRenderer);
/* *
 *
 *  Default Export
 *
 * */
export default SparklineRenderer;
