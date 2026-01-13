/* *
 *
 *  Cell Renderer abstract class
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
 * Renderer class that initialize all options per column.
 */
export class CellRenderer {
    /**
     * Constructs the CellRenderer instance.
     *
     * @param column
     * The column of the cell.
     *
     */
    constructor(column) {
        this.column = column;
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default CellRenderer;
