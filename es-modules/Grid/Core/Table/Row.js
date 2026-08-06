/* *
 *
 *  Grid Row abstract class
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
 *  - Sebastian Bochan
 *
 * */
'use strict';
import GridUtils from '../GridUtils.js';
const { makeHTMLElement } = GridUtils;
/* *
 *
 *  Abstract Class of Row
 *
 * */
/**
 * Represents a row in the data grid.
 */
class Row {
    /* *
    *
    *  Constructor
    *
    * */
    /**
     * Constructs a row in the data grid.
     *
     * @param viewport
     * The Grid Table instance which the row belongs to.
     */
    constructor(viewport) {
        /* *
        *
        *  Properties
        *
        * */
        /**
         * The cells of the row.
         */
        this.cells = [];
        /**
         * Cells indexed by column ID.
         */
        this.cellsByColumnId = {};
        this.viewport = viewport;
        this.htmlElement = makeHTMLElement('tr', {});
        this.htmlElement.setAttribute('role', 'row');
    }
    /**
     * Renders the row's content. It does not attach the row element to the
     * viewport nor pushes the rows to the viewport.rows array.
     */
    async render() {
        await this.syncRenderedCells();
        this.rendered = true;
        if (this.viewport.virtualRows) {
            this.reflow();
        }
    }
    /**
     * Synchronizes the row cells with the currently rendered columns.
     */
    async syncRenderedCells() {
        const vp = this.viewport;
        const columns = vp.getRenderedColumns();
        const firstColumn = columns[0];
        const lastColumn = columns[columns.length - 1];
        const from = vp.virtualColumns ?
            vp.columnsVirtualizer.columnCursor :
            firstColumn?.index ?? 0;
        const to = vp.virtualColumns ?
            vp.columnsVirtualizer.columnEnd :
            lastColumn?.index ?? -1;
        for (let i = this.cells.length - 1; i >= 0; --i) {
            const cell = this.cells[i];
            const columnIndex = cell.column?.index;
            if (columnIndex === void 0 ||
                columnIndex < from ||
                columnIndex > to) {
                this.onCellBeforeDetach(cell);
                cell.destroy();
            }
        }
        const orderedCells = [];
        for (let i = 0, iEnd = columns.length; i < iEnd; ++i) {
            const column = columns[i];
            let cell = this.getCell(column.id);
            const cellIndex = orderedCells.length;
            if (!cell) {
                cell = this.createCell(column);
                await cell.render();
            }
            else {
                cell.reflow();
            }
            this.insertCellElement(cell, cellIndex);
            orderedCells.push(cell);
        }
        this.cells = orderedCells;
        this.reflowPosition();
    }
    /**
     * Reflows the row's content dimensions.
     */
    reflow() {
        for (let j = 0, jEnd = this.cells.length; j < jEnd; ++j) {
            this.cells[j].reflow();
        }
        this.reflowPosition();
    }
    /**
     * Reflows row-level dimensions and horizontal offset.
     */
    reflowPosition() {
        const vp = this.viewport;
        if (vp.rowsWidth) {
            this.htmlElement.style.width = vp.rowsWidth + 'px';
        }
        this.htmlElement.style.paddingLeft = vp.getRenderedColumnOffset() +
            'px';
    }
    /**
     * Destroys the row.
     */
    destroy() {
        if (!this.htmlElement) {
            return;
        }
        for (let i = this.cells.length - 1; i >= 0; --i) {
            this.cells[i].destroy();
        }
        this.htmlElement.remove();
    }
    /**
     * Returns the cell with the given column ID.
     *
     * @param columnId
     * The column ID that the cell belongs to.
     *
     * @returns
     * The cell with the given column ID or undefined if not found.
     */
    getCell(columnId) {
        return this.cellsByColumnId[columnId];
    }
    /**
     * Returns the cell with the given column index.
     *
     * @param columnIndex
     * The global column index.
     *
     * @returns
     * The cell with the given column index or undefined if not found.
     */
    getCellByColumnIndex(columnIndex) {
        const column = this.viewport.getColumnByIndex(columnIndex);
        return column ? this.getCell(column.id) : void 0;
    }
    /**
     * Inserts a cell only when it is not already at the expected position.
     *
     * @param cell
     * The cell to position.
     *
     * @param index
     * The expected DOM index.
     */
    insertCellElement(cell, index) {
        const cellElement = cell.htmlElement;
        const referenceElement = this.htmlElement.children[index];
        if (referenceElement !== cellElement) {
            this.htmlElement.insertBefore(cellElement, referenceElement || null);
        }
    }
    /**
     * Handles a cell before it is detached from the row.
     *
     * @param cell
     * The cell that is about to be detached.
     */
    onCellBeforeDetach(cell) {
        void cell;
    }
    /**
     * Registers a cell in the row.
     *
     * @param cell
     * The cell to register.
     */
    registerCell(cell) {
        this.cells.push(cell);
        if (cell.column) {
            this.cellsByColumnId[cell.column.id] = cell;
        }
    }
    /**
     * Unregister a cell from the row.
     *
     * @param cell
     * The cell to unregister.
     */
    unregisterCell(cell) {
        const index = this.cells.indexOf(cell);
        if (index > -1) {
            this.cells.splice(index, 1);
        }
        if (cell.column &&
            this.cellsByColumnId[cell.column.id] === cell) {
            delete this.cellsByColumnId[cell.column.id];
        }
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default Row;
