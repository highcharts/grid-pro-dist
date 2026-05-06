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
 *  - Dawid Draguła
 *  - Sebastian Bochan
 *
 * */
'use strict';
import Globals from '../../Globals.js';
import Cell from '../Cell.js';
import { defined, fireEvent } from '../../../../Shared/Utilities.js';
import { mergeStyleValues } from '../../GridUtils.js';
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
        /**
         * A token used to prevent stale async responses from overwriting cell
         * data. In virtualized grids, cells are reused as rows scroll in/out of
         * view. If a cell starts an async value fetch for row A, then gets reused
         * for row B before the fetch completes, the stale response for row A
         * could incorrectly overwrite row B's data. This token is incremented
         * before each async fetch, and checked when the fetch completes - if the
         * token has changed, the response is discarded as stale.
         */
        this.asyncFetchToken = 0;
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
    async render() {
        await super.render();
        await this.setValue();
    }
    /**
     * Edits the cell value and updates the dataset. Call this instead of
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
     * @param updateDataset
     * Whether to update the dataset after setting the content. Defaults to
     * `false`, meaning the dataset will not be updated.
     */
    async setValue(value, updateDataset = false) {
        const fetchToken = ++this.asyncFetchToken;
        const { grid } = this.column.viewport;
        // TODO(design): Design a better way to show the cell val being updated.
        this.htmlElement.style.opacity = '0.5';
        if (!defined(value)) {
            value = await this.column.getCellValue(this);
            // Discard stale response if cell was reused for a different row
            if (fetchToken !== this.asyncFetchToken) {
                this.htmlElement.style.opacity = '';
                return;
            }
        }
        const oldValue = this.value;
        this.value = value;
        if (updateDataset) {
            try {
                grid.showLoading();
                if (await this.updateDataset()) {
                    return;
                }
            }
            catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
                this.value = oldValue;
            }
            finally {
                grid.hideLoading();
            }
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
        this.setCustomStyles(this.getCellStyles());
        // TODO(design): Remove this after the first part was implemented.
        this.htmlElement.style.opacity = '';
        fireEvent(this, 'afterRender', { target: this });
    }
    /**
     * Returns merged styles from defaults and current column options.
     */
    getCellStyles() {
        const { grid } = this.column.viewport;
        const rawColumnOptions = grid.columnPolicy.getIndividualColumnOptions(this.column.id);
        return {
            ...mergeStyleValues(this.column, grid.options?.columnDefaults?.style, rawColumnOptions?.style),
            ...mergeStyleValues(this, grid.options?.columnDefaults?.cells?.style, rawColumnOptions?.cells?.style)
        };
    }
    /**
     * Updates the the dataset so that it reflects the current state of the
     * grid.
     *
     * @returns
     * A promise that resolves to `true` if the cell triggered all the whole
     * viewport rows to be updated, or `false` if the only change was the cell's
     * content.
     */
    async updateDataset() {
        const sourceColumnId = this.column.viewport.grid.columnPolicy
            .getColumnSourceId(this.column.id);
        if (!sourceColumnId) {
            return false;
        }
        const oldValue = await this.column.viewport.grid.dataProvider?.getValue(sourceColumnId, this.row.index);
        if (oldValue === this.value) {
            // Abort if the value is the same as in the data table.
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
        if (vp.grid.querying.willNotModify()) {
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
        this.cellEvents.push(['blur', (e) => {
                this.onBlur(e);
            }]);
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
        const rowId = this.row.id;
        if (rowId === void 0) {
            return;
        }
        delete vp.pendingFocusCursor;
        vp.clearDetachedFocus();
        vp.focusCursor = {
            rowId,
            columnIndex: this.column.index
        };
    }
    /**
     * Handles the blur event on the cell.
     *
     * @param e
     * The focus event object.
     */
    onBlur(e) {
        if (e &&
            this.row.viewport.hasDetachedFocusAt(this.row.id, this.column.index)) {
            return;
        }
        super.onBlur();
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
