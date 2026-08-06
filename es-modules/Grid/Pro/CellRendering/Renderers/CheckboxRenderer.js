/* *
 *
 *  Checkbox Cell Renderer class
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
import CheckboxContent from '../ContentTypes/CheckboxContent.js';
import { merge } from '../../../../Shared/Utilities.js';
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
