/* *
 *
 *  Distributed Resizing Mode class
 *
 *  (c) 2020-2025 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Dawid Dragula
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
        const width = this.columnWidths[column.id] = Math.round(Math.max((resizer.columnStartWidth || 0) + diff, ResizingMode.getMinWidth(column)) * 10) / 10;
        this.columnWidthUnits[column.id] = 0; // Set to px
        column.update({ width }, false);
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default DistributedResizingMode;
