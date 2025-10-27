/* *
 *
 *  Grid Table Viewport class
 *
 *  (c) 2020-2025 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Dawid Dragula
 *  - Sebastian Bochan
 *
 * */
'use strict';
import GridUtils from '../GridUtils.js';
import Utils from '../../../Core/Utilities.js';
import ColumnResizing from './ColumnResizing/ColumnResizing.js';
import Column from './Column.js';
import TableHeader from './Header/TableHeader.js';
import RowsVirtualizer from './Actions/RowsVirtualizer.js';
import ColumnsResizer from './Actions/ColumnsResizer.js';
import Globals from '../Globals.js';
const { makeHTMLElement } = GridUtils;
const { fireEvent, getStyle, defined } = Utils;
/* *
 *
 *  Class
 *
 * */
/**
 * Represents a table viewport of the data grid.
 */
class Table {
    /* *
    *
    *  Constructor
    *
    * */
    /**
     * Constructs a new data grid table.
     *
     * @param grid
     * The data grid instance which the table (viewport) belongs to.
     *
     * @param tableElement
     * The HTML table element of the data grid.
     */
    constructor(grid, tableElement) {
        /**
         * The visible columns of the table.
         */
        this.columns = [];
        /**
         * The visible rows of the table.
         */
        this.rows = [];
        /**
         * Handles the focus event on the table body.
         *
         * @param e
         * The focus event.
         */
        this.onTBodyFocus = (e) => {
            e.preventDefault();
            this.rows[this.rowsVirtualizer.rowCursor - this.rows[0].index]
                ?.cells[0]?.htmlElement.focus();
        };
        /**
         * Handles the resize event.
         */
        this.onResize = () => {
            this.reflow();
        };
        /**
         * Handles the scroll event.
         */
        this.onScroll = () => {
            if (this.virtualRows) {
                this.rowsVirtualizer.scroll();
            }
            this.header?.scrollHorizontally(this.tbodyElement.scrollLeft);
        };
        this.grid = grid;
        this.tableElement = tableElement;
        this.dataTable = this.grid.presentationTable;
        const dgOptions = grid.options;
        const customClassName = dgOptions?.rendering?.table?.className;
        this.columnResizing = ColumnResizing.initMode(this);
        this.virtualRows = this.shouldVirtualizeRows();
        if (dgOptions?.rendering?.header?.enabled) {
            this.theadElement = makeHTMLElement('thead', {}, tableElement);
        }
        this.tbodyElement = makeHTMLElement('tbody', {}, tableElement);
        if (this.virtualRows) {
            tableElement.classList.add(Globals.getClassName('virtualization'));
        }
        if (dgOptions?.rendering?.columns?.resizing?.enabled) {
            this.columnsResizer = new ColumnsResizer(this);
        }
        if (customClassName) {
            tableElement.classList.add(...customClassName.split(/\s+/g));
        }
        tableElement.classList.add(Globals.getClassName('scrollableContent'));
        // Load columns
        this.loadColumns();
        // Virtualization
        this.rowsVirtualizer = new RowsVirtualizer(this);
        // Init Table
        this.init();
        // Add event listeners
        this.resizeObserver = new ResizeObserver(this.onResize);
        this.resizeObserver.observe(tableElement);
        this.tbodyElement.addEventListener('scroll', this.onScroll);
        this.tbodyElement.addEventListener('focus', this.onTBodyFocus);
    }
    /* *
    *
    *  Methods
    *
    * */
    /**
     * Initializes the data grid table.
     */
    init() {
        fireEvent(this, 'beforeInit');
        this.setTbodyMinHeight();
        // Load & render head
        if (this.grid.options?.rendering?.header?.enabled) {
            this.header = new TableHeader(this);
            this.header.render();
        }
        // TODO: Load & render footer
        // this.footer = new TableFooter(this);
        // this.footer.render();
        this.rowsVirtualizer.initialRender();
        fireEvent(this, 'afterInit');
    }
    /**
     * Sets the minimum height of the table body.
     */
    setTbodyMinHeight() {
        const { options } = this.grid;
        const minVisibleRows = options?.rendering?.rows?.minVisibleRows;
        const tbody = this.tbodyElement;
        if (defined(minVisibleRows) &&
            !getStyle(tbody, 'min-height', true)) {
            tbody.style.minHeight = (minVisibleRows * this.rowsVirtualizer.defaultRowHeight) + 'px';
        }
    }
    /**
     * Checks if rows virtualization should be enabled.
     *
     * @returns
     * Whether rows virtualization should be enabled.
     */
    shouldVirtualizeRows() {
        const { grid } = this;
        const rows = grid.userOptions.rendering?.rows;
        if (defined(rows?.virtualization)) {
            return rows.virtualization;
        }
        // Consider changing this to use the presentation table row count
        // instead of the original data table row count.
        const rowCount = Number(grid.dataTable?.rowCount);
        const threshold = rows?.virtualizationThreshold ?? 50;
        const paginationPageSize = grid.pagination?.currentPageSize;
        return paginationPageSize ?
            paginationPageSize >= threshold :
            rowCount >= threshold;
    }
    /**
     * Loads the columns of the table.
     */
    loadColumns() {
        const { enabledColumns } = this.grid;
        if (!enabledColumns) {
            return;
        }
        let columnId;
        for (let i = 0, iEnd = enabledColumns.length; i < iEnd; ++i) {
            columnId = enabledColumns[i];
            this.columns.push(new Column(this, columnId, i));
        }
        this.columnResizing.loadColumns();
    }
    /**
     * Updates the rows of the table.
     */
    async updateRows() {
        const vp = this;
        let focusedRowId;
        if (vp.focusCursor) {
            focusedRowId = vp.dataTable.getOriginalRowIndex(vp.focusCursor[0]);
        }
        vp.grid.pagination?.clampCurrentPage();
        // Update data
        const oldRowsCount = (vp.rows[vp.rows.length - 1]?.index ?? -1) + 1;
        await vp.grid.querying.proceed();
        vp.dataTable = vp.grid.presentationTable;
        for (const column of vp.columns) {
            column.loadData();
        }
        // Update virtualization if needed
        const shouldVirtualize = this.shouldVirtualizeRows();
        let shouldRerender = false;
        if (this.virtualRows !== shouldVirtualize) {
            this.virtualRows = shouldVirtualize;
            vp.tableElement.classList.toggle(Globals.getClassName('virtualization'), shouldVirtualize);
            shouldRerender = true;
        }
        if (shouldRerender || oldRowsCount !== vp.dataTable.rowCount) {
            // Rerender all rows
            vp.rowsVirtualizer.rerender();
        }
        else {
            // Update existing rows
            for (let i = 0, iEnd = vp.rows.length; i < iEnd; ++i) {
                vp.rows[i].update();
            }
        }
        // Update the pagination controls
        vp.grid.pagination?.updateControls();
        vp.reflow();
        // Scroll to the focused row
        if (focusedRowId !== void 0 && vp.focusCursor) {
            const newRowIndex = vp.dataTable.getLocalRowIndex(focusedRowId);
            if (newRowIndex !== void 0) {
                // Scroll to the focused row.
                vp.scrollToRow(newRowIndex);
                // Focus the cell that was focused before the update.
                setTimeout(() => {
                    if (!defined(vp.focusCursor?.[1])) {
                        return;
                    }
                    vp.rows[newRowIndex - vp.rows[0].index]?.cells[vp.focusCursor[1]].htmlElement.focus();
                });
            }
        }
    }
    /**
     * Reflows the table's content dimensions.
     */
    reflow() {
        this.columnResizing.reflow();
        // Reflow the head
        this.header?.reflow();
        // Reflow rows content dimensions
        this.rowsVirtualizer.reflowRows();
        // Reflow the pagination
        this.grid.pagination?.reflow();
        // Reflow popups
        this.grid.popups.forEach((popup) => {
            popup.reflow();
        });
    }
    /**
     * Scrolls the table to the specified row.
     *
     * @param index
     * The index of the row to scroll to.
     *
     * Try it: {@link https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/grid-lite/basic/scroll-to-row | Scroll to row}
     */
    scrollToRow(index) {
        if (this.virtualRows) {
            this.tbodyElement.scrollTop =
                index * this.rowsVirtualizer.defaultRowHeight;
            return;
        }
        const rowClass = '.' + Globals.getClassName('rowElement');
        const firstRowTop = this.tbodyElement
            .querySelectorAll(rowClass)[0]
            .getBoundingClientRect().top;
        this.tbodyElement.scrollTop = (this.tbodyElement
            .querySelectorAll(rowClass)[index]
            .getBoundingClientRect().top) - firstRowTop;
    }
    /**
     * Get the widthRatio value from the width in pixels. The widthRatio is
     * calculated based on the width of the viewport.
     *
     * @param width
     * The width in pixels.
     *
     * @return The width ratio.
     *
     * @internal
     */
    getRatioFromWidth(width) {
        return width / this.tbodyElement.clientWidth;
    }
    /**
     * Get the width in pixels from the widthRatio value. The width is
     * calculated based on the width of the viewport.
     *
     * @param ratio
     * The width ratio.
     *
     * @returns The width in pixels.
     *
     * @internal
     */
    getWidthFromRatio(ratio) {
        return this.tbodyElement.clientWidth * ratio;
    }
    /**
     * Destroys the grid table.
     */
    destroy() {
        this.tbodyElement.removeEventListener('focus', this.onTBodyFocus);
        this.tbodyElement.removeEventListener('scroll', this.onScroll);
        this.resizeObserver.disconnect();
        this.columnsResizer?.removeEventListeners();
        this.header?.destroy();
        for (let i = 0, iEnd = this.rows.length; i < iEnd; ++i) {
            this.rows[i].destroy();
        }
        fireEvent(this, 'afterDestroy');
    }
    /**
     * Get the viewport state metadata. It is used to save the state of the
     * viewport and restore it when the data grid is re-rendered.
     *
     * @returns
     * The viewport state metadata.
     */
    getStateMeta() {
        return {
            scrollTop: this.tbodyElement.scrollTop,
            scrollLeft: this.tbodyElement.scrollLeft,
            columnResizing: this.columnResizing,
            focusCursor: this.focusCursor
        };
    }
    /**
     * Apply the metadata to the viewport state. It is used to restore the state
     * of the viewport when the data grid is re-rendered.
     *
     * @param meta
     * The viewport state metadata.
     */
    applyStateMeta(meta) {
        this.tbodyElement.scrollTop = meta.scrollTop;
        this.tbodyElement.scrollLeft = meta.scrollLeft;
        if (meta.focusCursor) {
            const [rowIndex, columnIndex] = meta.focusCursor;
            const row = this.rows[rowIndex - this.rows[0].index];
            row?.cells[columnIndex]?.htmlElement.focus();
        }
    }
    /**
     * Sets the focus anchor cell.
     *
     * @param cell
     * The cell to set as the focus anchor cell.
     */
    setFocusAnchorCell(cell) {
        this.focusAnchorCell?.htmlElement.setAttribute('tabindex', '-1');
        this.focusAnchorCell = cell;
        this.focusAnchorCell.htmlElement.setAttribute('tabindex', '0');
    }
    /**
     * Returns the column with the provided ID.
     *
     * @param id
     * The ID of the column.
     */
    getColumn(id) {
        const columns = this.grid.enabledColumns;
        if (!columns) {
            return;
        }
        const columnIndex = columns.indexOf(id);
        if (columnIndex < 0) {
            return;
        }
        return this.columns[columnIndex];
    }
    /**
     * Returns the row with the provided ID.
     *
     * @param id
     * The ID of the row.
     */
    getRow(id) {
        // TODO: Change `find` to a method using `vp.dataTable.getLocalRowIndex`
        // and rows[presentationRowIndex - firstRowIndex]. Needs more testing,
        // but it should be faster.
        return this.rows.find((row) => row.id === id);
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default Table;
