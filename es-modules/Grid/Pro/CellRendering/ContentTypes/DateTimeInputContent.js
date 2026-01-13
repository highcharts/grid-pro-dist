/* *
 *
 *  DateTime Input Cell Content class
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
import DateInputContentBase from './DateInputContentBase.js';
/* *
 *
 *  Class
 *
 * */
/**
 * Represents a datetime input type of cell content.
 */
class DateTimeInputContent extends DateInputContentBase {
    getInputType() {
        return 'datetime-local';
    }
    convertToInputValue() {
        return this.cell.column.viewport.grid.time.dateFormat('%Y-%m-%dT%H:%M:%S', Number(this.cell.value || 0));
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default DateTimeInputContent;
