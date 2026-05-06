/* *
 *
 *  Grid Pro pinned table row
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
 * */
'use strict';
import TableRow from '../../Core/Table/Body/TableRow.js';
import PinnedTableCell from './PinnedTableCell.js';
import Globals from '../../Core/Globals.js';
class PinnedTableRow extends TableRow {
    constructor(viewport, section, index) {
        super(viewport, index);
        this.bodySectionId = section;
    }
    init() {
        this.setRowAttributes();
        return Promise.resolve();
    }
    createCell(column) {
        return new PinnedTableCell(this, column);
    }
    async update() {
        await this.sync(this.id, this.data, this.index);
    }
    async sync(rowId, data, index = this.index, doReflow = true) {
        this.index = index;
        this.id = rowId;
        this.data = data;
        this.setRowAttributes();
        if (this.rendered) {
            for (let i = 0, iEnd = this.cells.length; i < iEnd; ++i) {
                await this.cells[i].setValue();
            }
        }
        if (doReflow) {
            this.reflow();
        }
    }
    setHoveredState(hovered) {
        this.htmlElement.classList[hovered ? 'add' : 'remove'](Globals.getClassName('hoveredRow'));
    }
    setSyncedState(synced) {
        this.htmlElement.classList[synced ? 'add' : 'remove'](Globals.getClassName('syncedRow'));
    }
    setRowAttributes() {
        const el = this.htmlElement;
        el.classList.add(Globals.getClassName('rowElement'));
        el.removeAttribute('data-row-index');
        el.setAttribute('data-pinned-section', this.bodySectionId);
        this.updateRowAttributes();
        this.updateParityClass();
        this.updateStateClasses();
    }
    updateRowAttributes() {
        const el = this.htmlElement;
        if (this.id !== void 0) {
            el.setAttribute('data-row-id', this.id);
        }
        el.removeAttribute('aria-rowindex');
    }
    updateParityClass() {
        const el = this.htmlElement;
        el.classList.remove(Globals.getClassName('rowEven'), Globals.getClassName('rowOdd'));
        el.classList.add(Globals.getClassName(this.index % 2 ? 'rowEven' : 'rowOdd'));
    }
    updateStateClasses() {
        const el = this.htmlElement;
        el.classList.remove(Globals.getClassName('hoveredRow'), Globals.getClassName('syncedRow'));
    }
}
export default PinnedTableRow;
