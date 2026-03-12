/* *
 *
 *  Grid Table Viewport class
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
import GridUtils from '../GridUtils.js';
import ColumnResizing from './ColumnResizing/ColumnResizing.js';
import Column from './Column.js';
import TableHeader from './Header/TableHeader.js';
import RowsVirtualizer from './Actions/RowsVirtualizer.js';
import ColumnsResizer from './Actions/ColumnsResizer.js';
import Globals from '../Globals.js';
import { defined, fireEvent, getStyle } from '../../../Shared/Utilities.js';
import CellContextMenu from './Body/CellContextMenu.js';
const { makeHTMLElement } = GridUtils;
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
         * The flag that indicates if the table rows are virtualized.
         */
        this.virtualRows = true;
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
                void this.rowsVirtualizer.scroll();
            }
            this.header?.scrollHorizontally(this.tbodyElement.scrollLeft);
        };
        /**
         * Delegated click handler for cells.
         * @param e Mouse event
         */
        this.onCellClick = (e) => {
            const cell = this.getCellFromElement(e.target);
            if (cell) {
                cell
                    .onClick(e);
            }
        };
        /**
         * Delegated double-click handler for cells.
         * @param e Mouse event
         */
        this.onCellDblClick = (e) => {
            const cell = this.getCellFromElement(e.target);
            if (cell && 'onDblClick' in cell) {
                cell.onDblClick(e);
            }
        };
        /**
         * Delegated context menu handler for cells.
         * @param e Mouse event
         */
        this.onCellContextMenu = (e) => {
            const cell = this.getCellFromElement(e.target);
            if (!cell || !('column' in cell) || !('row' in cell)) {
                return;
            }
            const tableCell = cell;
            if (this.openCellContextMenu(tableCell, e.clientX, e.clientY)) {
                e.preventDefault();
            }
        };
        /**
         * Delegated mousedown handler for cells.
         * @param e Mouse event
         */
        this.onCellMouseDown = (e) => {
            const cell = this.getCellFromElement(e.target);
            if (cell && 'onMouseDown' in cell) {
                cell.onMouseDown(e);
            }
        };
        /**
         * Delegated mouseover handler for cells.
         * @param e Mouse event
         */
        this.onCellMouseOver = (e) => {
            const cell = this.getCellFromElement(e.target);
            if (cell) {
                cell.onMouseOver();
            }
        };
        /**
         * Delegated mouseout handler for cells.
         * @param e Mouse event
         */
        this.onCellMouseOut = (e) => {
            const cell = this.getCellFromElement(e.target);
            if (cell) {
                cell.onMouseOut();
            }
        };
        /**
         * Delegated keydown handler for cells.
         * @param e Keyboard event
         */
        this.onCellKeyDown = (e) => {
            const cell = this.getCellFromElement(e.target);
            if (!cell) {
                return;
            }
            // Disabled until meaningful functionality is ready.
            // const isContextMenuKey = (
            //     e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey)
            // );
            // if (isContextMenuKey && 'column' in cell && 'row' in cell) {
            //     const tableCell = cell as TableCell;
            //     const rect = tableCell.htmlElement.getBoundingClientRect();
            //     const opened = this.openCellContextMenu(
            //         tableCell,
            //         rect.left + 4,
            //         rect.bottom - 2
            //     );
            //     if (opened) {
            //         e.preventDefault();
            //         e.stopPropagation();
            //         return;
            //     }
            // }
            cell.onKeyDown(e);
        };
        this.grid = grid;
        this.tableElement = tableElement;
        this.columnResizing = ColumnResizing.initMode(this);
        if (grid.options?.rendering?.header?.enabled) {
            this.theadElement = makeHTMLElement('thead', {}, tableElement);
        }
        this.tbodyElement = makeHTMLElement('tbody', {}, tableElement);
        this.rowsVirtualizer = new RowsVirtualizer(this);
        fireEvent(this, 'beforeInit');
        // Add event listeners
        this.resizeObserver = new ResizeObserver(this.onResize);
        this.resizeObserver.observe(tableElement);
        this.tbodyElement.addEventListener('scroll', this.onScroll);
        this.tbodyElement.addEventListener('focus', this.onTBodyFocus);
        // Delegated cell events
        this.tbodyElement.addEventListener('click', this.onCellClick);
        this.tbodyElement.addEventListener('dblclick', this.onCellDblClick);
        this.tbodyElement.addEventListener('contextmenu', this.onCellContextMenu);
        this.tbodyElement.addEventListener('mousedown', this.onCellMouseDown);
        this.tbodyElement.addEventListener('mouseover', this.onCellMouseOver);
        this.tbodyElement.addEventListener('mouseout', this.onCellMouseOut);
        this.tbodyElement.addEventListener('keydown', this.onCellKeyDown);
    }
    /* *
    *
    *  Methods
    *
    * */
    /**
     * The presentation version of the data table. It has applied modifiers
     * and is ready to be rendered.
     *
     * @deprecated Use `grid.dataProvider` instead.
     */
    get dataTable() {
        const dp = this.grid.dataProvider;
        if (dp && 'getDataTable' in dp) {
            return dp.getDataTable(true);
        }
    }
    /**
     * Initializes the table. Should be called after creation so that the table
     * can be asynchronously initialized.
     */
    async init() {
        try {
            this.grid.showLoading();
            const { tableElement } = this;
            const renderingOptions = this.grid.options?.rendering;
            const customClassName = renderingOptions?.table?.className;
            this.virtualRows = await this.shouldVirtualizeRows();
            if (this.virtualRows) {
                tableElement.classList.add(Globals.getClassName('virtualization'));
            }
            if (renderingOptions?.columns?.resizing?.enabled) {
                this.columnsResizer = new ColumnsResizer(this);
            }
            if (customClassName) {
                tableElement.classList.add(...customClassName.split(/\s+/g));
            }
            tableElement.classList.add(Globals.getClassName('scrollableContent'));
            await this.loadColumns();
            this.setTbodyMinHeight();
            // Load & render head
            if (this.grid.options?.rendering?.header?.enabled) {
                this.header = new TableHeader(this);
                await this.header.render();
            }
            // TODO(footer): Load & render footer
            // this.footer = new TableFooter(this);
            // this.footer.render();
            await this.rowsVirtualizer.initialRender();
        }
        finally {
            fireEvent(this, 'afterInit');
            this.reflow();
            this.grid.hideLoading();
        }
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
    async shouldVirtualizeRows() {
        const { grid } = this;
        const rows = grid.userOptions.rendering?.rows;
        if (defined(rows?.virtualization)) {
            return rows.virtualization;
        }
        // Consider changing this to use the presentation table row count
        // instead of the original data table row count.
        const rowCount = (await this.grid.dataProvider?.getRowCount()) ?? 0;
        const threshold = rows?.virtualizationThreshold ?? 50;
        if (grid.pagination) {
            return grid.querying.pagination.currentPageSize >= threshold;
        }
        return rowCount >= threshold;
    }
    /**
     * Loads the columns of the table.
     */
    async loadColumns() {
        const { enabledColumns } = this.grid;
        if (!enabledColumns) {
            return;
        }
        let columnId;
        for (let i = 0, iEnd = enabledColumns.length; i < iEnd; ++i) {
            columnId = enabledColumns[i];
            const column = new Column(this, columnId, i);
            await column.init();
            this.columns.push(column);
        }
        this.columnResizing.loadColumns();
    }
    /**
     * Updates the rows of the table.
     */
    async updateRows() {
        const vp = this;
        const { dataProvider: dp } = vp.grid;
        if (!dp) {
            return;
        }
        vp.grid.querying.pagination.clampPage();
        try {
            this.grid.showLoading();
            // Update data
            const oldRowsCount = vp.rows.length > 0 ?
                (vp.rows[vp.rows.length - 1]?.index ?? -1) + 1 :
                0;
            await vp.grid.querying.proceed();
            for (const column of vp.columns) {
                column.loadData();
            }
            // Update virtualization if needed
            const shouldVirtualize = await this.shouldVirtualizeRows();
            let shouldRerender = false;
            if (this.virtualRows !== shouldVirtualize) {
                this.virtualRows = shouldVirtualize;
                vp.tableElement.classList.toggle(Globals.getClassName('virtualization'), shouldVirtualize);
                shouldRerender = true;
            }
            const newRowCount = await dp.getRowCount();
            if (shouldRerender) {
                // Rerender all rows
                await vp.rowsVirtualizer.rerender();
            }
            else if (oldRowsCount !== newRowCount) {
                // Refresh rows without full teardown
                await vp.rowsVirtualizer.refreshRows();
            }
            else {
                // Update existing rows - create a snapshot to avoid issues
                // if array changes during iteration
                const rowsToUpdate = [...vp.rows];
                for (let i = 0, iEnd = rowsToUpdate.length; i < iEnd; ++i) {
                    await rowsToUpdate[i].update();
                }
            }
            // Update the pagination controls
            vp.grid.pagination?.updateControls();
            vp.reflow();
        }
        finally {
            this.grid.hideLoading();
        }
        vp.grid.dirtyFlags.delete('rows');
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
        this.grid.dirtyFlags.delete('reflow');
    }
    /**
     * Opens a cell context menu if configured and enabled.
     *
     * @param tableCell
     * The target cell.
     *
     * @param clientX
     * The viewport X coordinate for anchoring.
     *
     * @param clientY
     * The viewport Y coordinate for anchoring.
     *
     * @returns
     * True if the menu was opened.
     */
    openCellContextMenu(tableCell, clientX, clientY) {
        const options = tableCell.column?.options.cells?.contextMenu;
        if (options?.enabled === false) {
            return false;
        }
        const items = options?.items || [];
        if (!items.length) {
            return false; // Keep native browser menu
        }
        if (!this.cellContextMenu) {
            this.cellContextMenu = new CellContextMenu(this.grid);
        }
        // Close any existing popups before opening a new menu.
        // Copy to array to avoid mutation during iteration.
        for (const popup of Array.from(this.grid.popups)) {
            if (popup !== this.cellContextMenu) {
                popup.hide();
            }
        }
        if (this.cellContextMenu.isVisible) {
            this.cellContextMenu.hide();
        }
        this.cellContextMenu.showAt(tableCell, clientX, clientY);
        return true;
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
     * Finds a cell from a DOM element within the table body.
     *
     * @param element
     * The DOM element to find the cell for (typically event.target).
     *
     * @returns
     * The Cell instance or undefined if not found.
     *
     * @internal
     */
    getCellFromElement(element) {
        if (!(element instanceof Element)) {
            return;
        }
        const td = element.closest('td');
        if (!td) {
            return;
        }
        const tr = td.parentElement;
        if (!tr) {
            return;
        }
        const rowIndexAttr = tr.getAttribute('data-row-index');
        if (rowIndexAttr === null) {
            return;
        }
        const rowIndex = parseInt(rowIndexAttr, 10);
        const firstRowIndex = this.rows[0]?.index ?? 0;
        const row = this.rows[rowIndex - firstRowIndex];
        if (!row) {
            return;
        }
        // Find cell index by position in row
        const cellIndex = Array.prototype.indexOf.call(tr.children, td);
        return row.cells[cellIndex];
    }
    /**
     * Destroys the grid table.
     */
    destroy() {
        this.tbodyElement.removeEventListener('focus', this.onTBodyFocus);
        this.tbodyElement.removeEventListener('scroll', this.onScroll);
        this.tbodyElement.removeEventListener('click', this.onCellClick);
        this.tbodyElement.removeEventListener('dblclick', this.onCellDblClick);
        this.tbodyElement.removeEventListener('contextmenu', this.onCellContextMenu);
        this.tbodyElement.removeEventListener('mousedown', this.onCellMouseDown);
        this.tbodyElement.removeEventListener('mouseover', this.onCellMouseOver);
        this.tbodyElement.removeEventListener('mouseout', this.onCellMouseOut);
        this.tbodyElement.removeEventListener('keydown', this.onCellKeyDown);
        this.resizeObserver.disconnect();
        this.columnsResizer?.removeEventListeners();
        this.header?.destroy();
        this.cellContextMenu?.hide();
        delete this.cellContextMenu;
        for (let i = 0, iEnd = this.rows.length; i < iEnd; ++i) {
            this.rows[i]?.destroy();
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
        return this.rows.find((row) => row.id === id);
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default Table;
