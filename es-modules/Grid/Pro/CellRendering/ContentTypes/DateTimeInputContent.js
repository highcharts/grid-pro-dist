/* *
 *
 *  DateTime Input Cell Content class
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
