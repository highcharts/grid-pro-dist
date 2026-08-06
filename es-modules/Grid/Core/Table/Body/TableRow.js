/* *
 *
 *  Grid TableRow class
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
import Row from '../Row.js';
import TableCell from './TableCell.js';
import Globals from '../../Globals.js';
import { fireEvent } from '../../../../Shared/Utilities.js';
/* *
 *
 *  Class
 *
 * */
/**
 * Represents a row in the data grid.
 */
class TableRow extends Row {
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
     *
     * @param index
     * The index of the row in the data table.
     */
    constructor(viewport, index) {
        super(viewport);
        /* *
        *
        *  Properties
        *
        * */
        /**
         * The row values from the data table in the original column order.
         */
        this.data = {};
        /**
         * The vertical translation of the row.
         */
        this.translateY = 0;
        this.index = index;
    }
    /* *
    *
    *  Methods
    *
    * */
    async init() {
        this.id = await this.viewport.grid.dataProvider?.getRowId(this.index);
        await this.loadData();
        this.setRowAttributes();
    }
    createCell(column) {
        return new TableCell(this, column);
    }
    /**
     * Loads the row data from the data table.
     */
    async loadData() {
        const data = await this.viewport.grid.dataProvider?.getRowObject(this.index);
        if (!data) {
            this.data = {};
            return;
        }
        this.data = data;
        fireEvent(this, 'afterLoadData', {
            data
        });
    }
    /**
     * Updates the row data and its cells with the latest values from the data
     * table.
     */
    async update() {
        this.id = await this.viewport.grid.dataProvider?.getRowId(this.index);
        this.updateRowAttributes();
        await this.loadData();
        for (let i = 0, iEnd = this.cells.length; i < iEnd; ++i) {
            const cell = this.cells[i];
            await cell.setValue();
        }
        await this.syncRenderedCells();
        this.reflow();
    }
    /**
     * Reuses the row instance for a new index.
     *
     * @param index
     * The index of the row in the data table.
     */
    async reuse(index) {
        for (let i = 0, iEnd = this.cells.length; i < iEnd; ++i) {
            fireEvent(this.cells[i], 'outdate');
        }
        if (this.index === index) {
            await this.update();
            return;
        }
        this.index = index;
        this.id = await this.viewport.grid.dataProvider?.getRowId(index);
        this.htmlElement.setAttribute('data-row-index', index + '');
        this.updateRowAttributes();
        this.updateParityClass();
        this.updateStateClasses();
        await this.loadData();
        for (let i = 0, iEnd = this.cells.length; i < iEnd; ++i) {
            const cell = this.cells[i];
            await cell.setValue();
        }
        await this.syncRenderedCells();
        this.reflow();
    }
    /**
     * Adds or removes the hovered CSS class to the row element.
     *
     * @param hovered
     * Whether the row should be hovered.
     */
    setHoveredState(hovered) {
        this.htmlElement.classList[hovered ? 'add' : 'remove'](Globals.getClassName('hoveredRow'));
        if (hovered) {
            this.viewport.grid.hoveredRowIndex = this.index;
        }
    }
    /**
     * Adds or removes the synced CSS class to the row element.
     *
     * @param synced
     * Whether the row should be synced.
     */
    setSyncedState(synced) {
        this.htmlElement.classList[synced ? 'add' : 'remove'](Globals.getClassName('syncedRow'));
        if (synced) {
            this.viewport.grid.syncedRowIndex = this.index;
        }
    }
    /**
     * Sets the row HTML element attributes and additional classes.
     */
    setRowAttributes() {
        const idx = this.index;
        const el = this.htmlElement;
        const rowsOptions = this.viewport.grid.options?.rendering?.rows;
        el.classList.add(Globals.getClassName('rowElement'));
        el.setAttribute('data-row-index', idx + '');
        if (rowsOptions?.className) {
            el.classList.add(...rowsOptions.className.split(/\s+/g));
        }
        this.updateRowAttributes();
        // Indexing from 0, so rows with even index are odd.
        this.updateParityClass();
        this.updateStateClasses();
    }
    /**
     * Sets the row HTML element attributes that are updateable in the row
     * lifecycle.
     */
    updateRowAttributes() {
        const vp = this.viewport;
        const a11y = vp.grid.accessibility;
        const idx = this.index;
        const el = this.htmlElement;
        // Index of the row in the original data table (ID)
        if (this.id !== void 0) {
            el.setAttribute('data-row-id', this.id);
        }
        // Calculate levels of header, 1 to avoid indexing from 0
        a11y?.setRowIndex(el, idx + (vp.header?.rows.length ?? 0) + 1);
        fireEvent(this, 'afterUpdateAttributes');
    }
    /**
     * Updates the row parity class based on index.
     */
    updateParityClass() {
        const el = this.htmlElement;
        const isEven = !!(this.index % 2);
        const evenClassName = this.viewport.grid.options?.rendering?.rows?.evenClassName;
        el.classList.remove(Globals.getClassName('rowEven'), Globals.getClassName('rowOdd'));
        if (evenClassName) {
            el.classList.remove(...evenClassName.split(/\s+/g));
        }
        // Indexing from 0, so rows with even index are odd.
        el.classList.add(Globals.getClassName(isEven ? 'rowEven' : 'rowOdd'));
        if (isEven && evenClassName) {
            el.classList.add(...evenClassName.split(/\s+/g));
        }
    }
    /**
     * Updates the hovered and synced classes based on grid state.
     */
    updateStateClasses() {
        const el = this.htmlElement;
        el.classList.remove(Globals.getClassName('hoveredRow'), Globals.getClassName('syncedRow'));
        if (this.viewport.grid.hoveredRowIndex === this.index) {
            el.classList.add(Globals.getClassName('hoveredRow'));
        }
        if (this.viewport.grid.syncedRowIndex === this.index) {
            el.classList.add(Globals.getClassName('syncedRow'));
        }
    }
    /**
     * Preserves logical focus when column virtualization detaches the active
     * body cell.
     *
     * @param cell
     * The cell that is about to be detached.
     */
    onCellBeforeDetach(cell) {
        const activeElement = document.activeElement;
        const columnIndex = cell.column?.index;
        const { focusCursor } = this.viewport;
        if (columnIndex === void 0 ||
            this.id === void 0 ||
            !focusCursor ||
            focusCursor.type === 'header' ||
            focusCursor.bodySectionId ||
            focusCursor.rowId !== this.id ||
            focusCursor.columnIndex !== columnIndex ||
            !(activeElement instanceof Element) ||
            !cell.htmlElement.contains(activeElement)) {
            return;
        }
        this.viewport.preserveFocusDuringDetach();
    }
    /**
     * Sets the vertical translation of the row. Used for virtual scrolling.
     *
     * @param value
     * The vertical translation of the row.
     */
    setTranslateY(value) {
        this.translateY = value;
        this.htmlElement.style.transform = `translateY(${value}px)`;
    }
    /**
     * Returns the default top offset of the row (before adjusting row heights).
     * @internal
     */
    getDefaultTopOffset() {
        return this.index * this.viewport.rowsVirtualizer.defaultRowHeight;
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default TableRow;
