/* *
 *
 *  Cell Content abstract class
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
/* *
 *
 *  Class
 *
 * */
/**
 * Represents a cell content in the grid.
 */
class CellContent {
    /**
     * Creates and renders the cell content.
     *
     * @param cell
     * The cell to which the content belongs.
     */
    constructor(cell) {
        this.cell = cell;
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default CellContent;
