/* *
 *
 *  Distributed Resizing Mode class
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
import ResizingMode from './ResizingMode.js';
/* *
 *
 *  Class
 *
 * */
class DistributedResizingMode extends ResizingMode {
    constructor() {
        /* *
         *
         *  Properties
         *
         * */
        super(...arguments);
        this.type = 'distributed';
    }
    /* *
     *
     *  Methods
     *
     * */
    resize(resizer, diff) {
        const column = resizer.draggedColumn;
        if (!column) {
            return;
        }
        // Set the width of the resized column.
        const width = this.columnWidths[column.id] = Math.round(ResizingMode.fitWidth(column, (resizer.columnStartWidth ?? 0) + diff) * 10) / 10;
        this.columnWidthUnits[column.id] = 0; // Set to px
        column.setOptions({ width });
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default DistributedResizingMode;
