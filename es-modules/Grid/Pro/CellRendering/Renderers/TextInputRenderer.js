/* *
 *
 *  Text Input Cell Renderer class
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
import TextInputContent from '../ContentTypes/TextInputContent.js';
import { merge } from '../../../../Shared/Utilities.js';
/* *
 *
 *  Class
 *
 * */
/**
 * Renderer for the Select in a column..
 */
class TextInputRenderer extends CellRenderer {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(column, options) {
        super(column);
        this.options = merge(TextInputRenderer.defaultOptions, options);
    }
    /* *
     *
     *  Methods
     *
     * */
    render(cell, parentElement) {
        return new TextInputContent(cell, this, parentElement);
    }
}
/**
 * The default edit mode renderer type names for this view renderer.
 */
TextInputRenderer.defaultEditingRenderer = 'textInput';
/**
 * Default options for the text input renderer.
 */
TextInputRenderer.defaultOptions = {
    type: 'textInput'
};
registerRenderer('textInput', TextInputRenderer);
/* *
 *
 *  Default Export
 *
 * */
export default TextInputRenderer;
