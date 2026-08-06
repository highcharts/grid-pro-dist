/* *
 *
 *  Time Input Cell Content class
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
import DateInputContentBase from './DateInputContentBase.js';
/* *
 *
 *  Class
 *
 * */
/**
 * Represents a time input type of cell content.
 */
class TimeInputContent extends DateInputContentBase {
    getInputType() {
        return 'time';
    }
    get value() {
        return new Date(`1970-01-01T${this.input.value}Z`).getTime();
    }
    convertToInputValue() {
        return this.cell.column.viewport.grid.time.dateFormat('%H:%M:%S', Number(this.cell.value || 0));
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default TimeInputContent;
