/* *
 *
 *  Cell Renderer abstract class
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
