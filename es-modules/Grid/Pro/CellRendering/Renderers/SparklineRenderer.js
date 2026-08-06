/* *
 *
 *  Sparkline Cell Renderer class
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
import SparklineContent from '../ContentTypes/SparklineContent.js';
import { merge } from '../../../../Shared/Utilities.js';
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
