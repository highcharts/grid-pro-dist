/* *
 *
 *  Cell Content Pro abstract class
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
 *
 *  Authors:
 *  - Dawid Dragula
 *
 * */
'use strict';
import CellContent from '../../Core/Table/CellContent/CellContent.js';
/* *
 *
 *  Class
 *
 * */
/**
 * Represents a cell content in the grid.
 */
class CellContentPro extends CellContent {
    /**
     * Creates and renders the cell content.
     *
     * @param cell
     * The cell to which the content belongs.
     *
     * @param renderer
     * Renderer that allows print content (inputs, selects, etc.)
     */
    constructor(cell, renderer) {
        super(cell);
        this.renderer = renderer;
    }
}
/* *
 *
 * Default Export
 *
 * */
export default CellContentPro;
