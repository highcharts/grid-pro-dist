/* *
 *
 *  Grid class
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
 *
 *  Authors:
 *  - Dawid Dragula
 *  - Sebastian Bochan
 *
 * */
'use strict';
import Globals from '../../Globals.js';
import Cell from '../Cell.js';
import Utils from '../../../../Core/Utilities.js';
const { fireEvent } = Utils;
/* *
 *
 *  Class
 *
 * */
/**
 * Represents a cell in the data grid.
 */
class TableCell extends Cell {
    /* *
    *
    *  Constructor
    *
    * */
    /**
     * Constructs a cell in the data grid.
     *
     * @param row
     * The row of the cell.
     *
     * @param column
     * The column of the cell.
     */
    constructor(row, column) {
        super(row, column);
        this.column = column;
        this.row = row;
        this.column.registerCell(this);
    }
    /* *
    *
    *  Methods
    *
    * */
    /**
     * Renders the cell by appending it to the row and setting its value.
     */
    render() {
        super.render();
        void this.setValue();
    }
    /**
     * Edits the cell value and updates the data table. Call this instead of
     * `setValue` when you want it to trigger the cell value user change event.
     *
     * @param value
     * The new value to set.
     */
    async editValue(value) {
        if (this.value === value) {
            return;
        }
        fireEvent(this, 'beforeEditValue');
        await this.setValue(value, true);
        fireEvent(this, 'afterEditValue');
    }
    /**
     * Sets the cell value and updates its content with it.
     *
     * @param value
     * The raw value to set. If not provided, it will use the value from the
     * data table for the current row and column.
     *
     * @param updateTable
     * Whether to update the table after setting the content. Defaults to
     * `false`, meaning the table will not be updated.
     */
    async setValue(value = this.column.data?.[this.row.index], updateTable = false) {
        this.value = value;
        if (updateTable && await this.updateDataTable()) {
            return;
        }
        if (this.content) {
            this.content.update();
        }
        else {
            this.content = this.column.createCellContent(this);
        }
        this.htmlElement.setAttribute('data-value', this.value + '');
        // Set alignment in column cells based on column data type
        this.htmlElement.classList[this.column.dataType === 'number' ? 'add' : 'remove'](Globals.getClassName('rightAlign'));
        // Add custom class name from column options
        this.setCustomClassName(this.column.options.cells?.className);
        fireEvent(this, 'afterRender', { target: this });
    }
    /**
     * Updates the the data table so that it reflects the current state of
     * the grid.
     *
     * @returns
     * A promise that resolves to `true` if the cell triggered all the whole
     * viewport rows to be updated, or `false` if the only change should be
     * the cell's content.
     */
    async updateDataTable() {
        if (this.column.data?.[this.row.index] === this.value) {
            // Abort if the value is the same as in the data table.
            return false;
        }
        const vp = this.column.viewport;
        const { dataTable: originalDataTable } = vp.grid;
        const rowTableIndex = this.row.id &&
            originalDataTable?.getLocalRowIndex(this.row.id);
        if (!originalDataTable || rowTableIndex === void 0) {
            return false;
        }
        this.row.data[this.column.id] = this.value;
        originalDataTable.setCell(this.column.id, rowTableIndex, this.value);
        // If no modifiers, don't update all rows
        if (vp.grid.dataTable === vp.grid.presentationTable) {
            return false;
        }
        await vp.updateRows();
        return true;
    }
    /**
     * Initialize event listeners for table body cells.
     *
     * Most events (click, dblclick, keydown, mousedown, mouseover, mouseout)
     * are delegated to Table for better performance with virtualization.
     * Only focus/blur remain on individual cells for focus management.
     */
    initEvents() {
        this.cellEvents.push(['blur', () => this.onBlur()]);
        this.cellEvents.push(['focus', () => this.onFocus()]);
        this.cellEvents.forEach((pair) => {
            this.htmlElement.addEventListener(pair[0], pair[1]);
        });
    }
    /**
     * Handles the focus event on the cell.
     */
    onFocus() {
        super.onFocus();
        const vp = this.row.viewport;
        vp.focusCursor = [
            this.row.index,
            this.column.index
        ];
    }
    /**
     * Handles the mouse down event on the cell.
     *
     * @param e
     * The mouse event object.
     *
     * @internal
     */
    onMouseDown(e) {
        if (e.target === this.htmlElement) {
            this.htmlElement.focus();
        }
        fireEvent(this, 'mouseDown', {
            target: this,
            originalEvent: e
        });
    }
    onMouseOver() {
        this.row.viewport.grid.hoverRow(this.row.index);
        super.onMouseOver();
    }
    onMouseOut() {
        this.row.viewport.grid.hoverRow();
        super.onMouseOut();
    }
    /**
     * Handles the double click event on the cell.
     *
     * @param e
     * The mouse event object.
     */
    onDblClick(e) {
        fireEvent(this, 'dblClick', {
            target: this,
            originalEvent: e
        });
    }
    onClick() {
        fireEvent(this, 'click', {
            target: this
        });
    }
    /**
     * Handles the key down event on the cell.
     *
     * @param e
     * Keyboard event object.
     *
     * @internal
     */
    onKeyDown(e) {
        if (e.target !== this.htmlElement) {
            return;
        }
        fireEvent(this, 'keyDown', {
            target: this,
            originalEvent: e
        });
        super.onKeyDown(e);
    }
    /**
     * Destroys the cell.
     */
    destroy() {
        this.content?.destroy();
        delete this.content;
        super.destroy();
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default TableCell;
