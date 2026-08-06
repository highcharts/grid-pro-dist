/* *
 *
 *  Grid Pro pinned table cell
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  Integration of this software requires a license.
 *  - For commercial use, see www.highcharts.com/license
 *  - For non-commercial, see www.highcharts.com/license-eula
 *
 * */
'use strict';
import TableCell from '../../Core/Table/Body/TableCell.js';
import { defined, fireEvent } from '../../../Shared/Utilities.js';
class PinnedTableCell extends TableCell {
    async setValue(value, updateDataset = false) {
        if (!defined(value)) {
            const sourceColumnId = this.column.viewport.grid.columnPolicy
                .getColumnSourceId(this.column.id);
            value = (sourceColumnId && sourceColumnId in this.row.data ?
                this.row.data[sourceColumnId] :
                this.row.data[this.column.id]);
        }
        await super.setValue(value, updateDataset);
    }
    async updateDataset() {
        const sourceColumnId = this.column.viewport.grid.columnPolicy
            .getColumnSourceId(this.column.id);
        if (!sourceColumnId) {
            return false;
        }
        const oldValue = (sourceColumnId in this.row.data ?
            this.row.data[sourceColumnId] :
            this.row.data[this.column.id]);
        if (oldValue === this.value) {
            return false;
        }
        const vp = this.column.viewport;
        const { dataProvider: dp } = vp.grid;
        const rowId = this.row.id;
        if (!dp || rowId === void 0) {
            return false;
        }
        this.row.data[this.column.id] = this.value;
        if (sourceColumnId !== this.column.id) {
            this.row.data[sourceColumnId] = this.value;
        }
        await dp.setValue(this.value, sourceColumnId, rowId);
        vp.grid.rowPinning?.updatePinnedRowValue(rowId, this.column.id, this.value);
        const updateRowsEvent = {
            requiresFullRowsUpdate: false,
            rowId,
            sourceColumnId
        };
        fireEvent(this, 'afterDataMutation', updateRowsEvent);
        if (vp.grid.querying.willNotModify() &&
            !updateRowsEvent.requiresFullRowsUpdate) {
            await vp.rowPinningView?.syncRenderedMirrors(rowId, this.column.id, this.value, this.row, sourceColumnId);
            return false;
        }
        await vp.updateRows();
        return true;
    }
    onFocus() {
        super.onFocus();
        const rowId = this.row.id;
        if (rowId === void 0) {
            return;
        }
        this.row.viewport.focusCursor = {
            bodySectionId: this.row.bodySectionId,
            rowId,
            columnIndex: this.column.index
        };
    }
    onMouseOver() {
        this.row.setHoveredState(true);
        super.onMouseOver();
    }
    onMouseOut() {
        this.row.setHoveredState(false);
        super.onMouseOut();
    }
}
export default PinnedTableCell;
