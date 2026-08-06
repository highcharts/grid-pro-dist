/* *
 *
 *  Cell Content abstract class
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
