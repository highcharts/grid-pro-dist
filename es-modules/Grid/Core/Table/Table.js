/* *
 *
 *  Grid Table Viewport class
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
import ColumnResizing from './ColumnResizing/ColumnResizing.js';
import Column from './Column.js';
import TableHeader from './Header/TableHeader.js';
import RowsVirtualizer from './Actions/RowsVirtualizer.js';
import ColumnsVirtualizer from './Actions/ColumnsVirtualizer.js';
import ColumnsResizer from './Actions/ColumnsResizer.js';
import Globals from '../Globals.js';
import ColumnLayout from './Layout/ColumnLayout.js';
import { defined, fireEvent, getStyle } from '../../../Shared/Utilities.js';
import CellContextMenu from './CellContextMenu/CellContextMenu.js';
import CellContextMenuBuiltInActions from './CellContextMenu/CellContextMenuBuiltInActions.js';
import { CellContextMenuLongPress } from './CellContextMenu/CellContextMenuLongPress.js';
const { makeHTMLElement, applyUserClassNames } = GridUtils;
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
         * Columns indexed by ID.
         */
        this.columnsById = {};
        /**
         * The columns that are currently rendered in the DOM.
         */
        this.renderedColumns = [];
        /**
         * The visible rows of the table.
         */
        this.rows = [];
        /**
         * Additional rendered body sections composed into the table.
         */
        this.bodySections = [];
        /**
         * The flag that indicates if the table rows are virtualized.
         */
        this.virtualRows = true;
        /**
         * The flag that indicates if the table columns are virtualized.
         */
        this.virtualColumns = false;
        /**
         * Async hooks executed after the main row update cycle.
         * @internal
         */
        this.afterUpdateRowsHooks = [];
        /**
         * Whether the table body min-height was set by the grid.
         */
        this.tbodyMinHeightManaged = false;
        /**
         * Handles the focus event on the table body.
         *
         * @param e
         * The focus event.
         */
        this.onTBodyFocus = (e) => {
            e.preventDefault();
            this.getRenderedRows()[0]?.cells[0]?.htmlElement.focus();
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
            if (this.virtualColumns) {
                this.columnsVirtualizer.scroll();
            }
            this.header?.scrollHorizontally(this.tbodyElement.scrollLeft);
            fireEvent(this, 'bodyScroll', {
                scrollLeft: this.tbodyElement.scrollLeft,
                scrollTop: this.tbodyElement.scrollTop
            });
        };
        /**
         * Handles wheel scrolling over the table header.
         *
         * @param e
         * The wheel event.
         */
        this.onHeaderWheel = (e) => {
            if (e.ctrlKey) {
                return;
            }
            const tbody = this.tbodyElement;
            let deltaX = e.deltaX;
            let deltaY = e.deltaY;
            if (e.shiftKey && !deltaX) {
                deltaX = deltaY;
                deltaY = 0;
            }
            if (!deltaX && !deltaY) {
                return;
            }
            if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) {
                deltaX *= this.rowsVirtualizer.defaultRowHeight;
                deltaY *= this.rowsVirtualizer.defaultRowHeight;
            }
            else if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
                deltaX *= tbody.clientWidth;
                deltaY *= tbody.clientHeight;
            }
            const maxScrollLeft = Math.max(tbody.scrollWidth - tbody.clientWidth, 0);
            const maxScrollTop = Math.max(tbody.scrollHeight - tbody.clientHeight, 0);
            const scrollLeft = Math.max(0, Math.min(tbody.scrollLeft + deltaX, maxScrollLeft));
            const scrollTop = Math.max(0, Math.min(tbody.scrollTop + deltaY, maxScrollTop));
            if (scrollLeft === tbody.scrollLeft &&
                scrollTop === tbody.scrollTop) {
                return;
            }
            e.preventDefault();
            tbody.scrollLeft = scrollLeft;
            tbody.scrollTop = scrollTop;
        };
        /**
         * Handles document focus changes while a logically focused cell is
         * temporarily detached by virtualization.
         *
         * @param e
         * The focus event.
         */
        this.onDocumentFocusIn = (e) => {
            if (!this.focusCursor?.detached) {
                return;
            }
            const target = e.target;
            const isTableTarget = target instanceof Node &&
                this.tableElement.contains(target);
            this.clearDetachedFocus(!isTableTarget);
        };
        /**
         * Clears detached logical focus when the user interacts outside of the
         * table while the focused cell is not rendered.
         *
         * @param e
         * The pointer event.
         */
        this.onDocumentPointerDown = (e) => {
            if (!this.focusCursor?.detached) {
                return;
            }
            const target = e.target;
            if (target instanceof Node &&
                this.tableElement.contains(target)) {
                return;
            }
            this.clearDetachedFocus(true);
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
            const tableCell = this.getTableCellFromTarget(e.target);
            if (!tableCell) {
                return;
            }
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
            const isContextMenuKey = (e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey));
            if (isContextMenuKey && 'column' in cell && 'row' in cell) {
                const tableCell = cell;
                const rect = tableCell.htmlElement.getBoundingClientRect();
                const opened = this.openCellContextMenu(tableCell, rect.left + 4, rect.bottom - 2);
                if (opened) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
            }
            cell.onKeyDown(e);
        };
        this.grid = grid;
        this.tableElement = tableElement;
        this.columnLayout = new ColumnLayout(this);
        if (!grid.options?.rendering?.columns?.strictWidths) {
            this.columnResizing = ColumnResizing.initMode(this);
        }
        if (grid.options?.rendering?.header?.enabled) {
            this.theadElement = makeHTMLElement('thead', {}, tableElement);
        }
        this.tbodyElement = makeHTMLElement('tbody', {}, tableElement);
        this.rowsVirtualizer = new RowsVirtualizer(this);
        this.columnsVirtualizer = new ColumnsVirtualizer(this);
        fireEvent(this, 'beforeInit');
        // Add event listeners
        this.resizeObserver = new ResizeObserver(this.onResize);
        this.resizeObserver.observe(tableElement);
        this.tbodyElement.addEventListener('scroll', this.onScroll);
        this.theadElement?.addEventListener('wheel', this.onHeaderWheel, {
            passive: false
        });
        this.addBodyEventListeners(this.tbodyElement);
        if (this.isContextMenuLongPressed()) {
            this.cellContextMenuLongPress.addEvents(this.tableElement);
        }
        document.addEventListener('focusin', this.onDocumentFocusIn, true);
        document.addEventListener('pointerdown', this.onDocumentPointerDown, true);
    }
    /* *
    *
    *  Methods
    *
    * */
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
            if (!renderingOptions?.columns?.strictWidths &&
                renderingOptions?.columns?.resizing?.enabled) {
                this.columnsResizer = new ColumnsResizer(this);
            }
            if (customClassName) {
                applyUserClassNames(tableElement, void 0, customClassName);
            }
            tableElement.classList.add(Globals.getClassName('scrollableContent'));
            await this.loadColumns();
            this.reflowColumns();
            this.columnsVirtualizer.initialize();
            this.setTbodyMinHeight();
            // Load & render head
            if (this.grid.options?.rendering?.header?.enabled) {
                this.header = new TableHeader(this);
                await this.header.render();
            }
            // TODO(footer): Load & render footer
            // this.footer = new TableFooter(this);
            // this.footer.render();
            // Ensure row widths are ready before first row render to prevent
            // initial pinned-row misalignment.
            this.reflowColumns();
            await this.rowsVirtualizer.initialRender();
        }
        finally {
            fireEvent(this, 'afterInit');
            this.reflow();
            this.grid.hideLoading();
        }
    }
    addBodyEventListeners(body) {
        body.addEventListener('focus', this.onTBodyFocus);
        body.addEventListener('click', this.onCellClick);
        body.addEventListener('dblclick', this.onCellDblClick);
        body.addEventListener('contextmenu', this.onCellContextMenu);
        body.addEventListener('mousedown', this.onCellMouseDown);
        body.addEventListener('mouseover', this.onCellMouseOver);
        body.addEventListener('mouseout', this.onCellMouseOut);
        body.addEventListener('keydown', this.onCellKeyDown);
    }
    removeBodyEventListeners(body) {
        body.removeEventListener('focus', this.onTBodyFocus);
        body.removeEventListener('click', this.onCellClick);
        body.removeEventListener('dblclick', this.onCellDblClick);
        body.removeEventListener('contextmenu', this.onCellContextMenu);
        body.removeEventListener('mousedown', this.onCellMouseDown);
        body.removeEventListener('mouseover', this.onCellMouseOver);
        body.removeEventListener('mouseout', this.onCellMouseOut);
        body.removeEventListener('keydown', this.onCellKeyDown);
    }
    isContextMenuLongPressed() {
        if (!Globals.isIos) {
            return false;
        }
        if (!this.cellContextMenuLongPress) {
            this.cellContextMenuLongPress = new CellContextMenuLongPress({
                getTableCellFromTarget: (target) => this.getTableCellFromTarget(target),
                openCellContextMenu: (cell, clientX, clientY) => this.openCellContextMenu(cell, clientX, clientY),
                isCellInEditMode: (cell) => this.cellEditing?.editedCell === cell
            });
        }
        return true;
    }
    getTableCellFromTarget(target) {
        const cell = this.getCellFromElement(target);
        if (!cell || !('column' in cell) || !('row' in cell)) {
            return;
        }
        return cell;
    }
    /**
     * Registers an auxiliary table body section.
     *
     * @param section
     * Body section descriptor.
     *
     * @internal
     */
    registerBodySection(section) {
        this.unregisterBodySection(section.id);
        this.bodySections.push(section);
        this.addBodyEventListeners(section.tbodyElement);
    }
    /**
     * Unregisters an auxiliary table body section.
     *
     * @param sectionId
     * Body section ID.
     *
     * @internal
     */
    unregisterBodySection(sectionId) {
        const sectionIndex = this.bodySections.findIndex((section) => section.id === sectionId);
        if (sectionIndex < 0) {
            return;
        }
        this.removeBodyEventListeners(this.bodySections[sectionIndex].tbodyElement);
        this.bodySections.splice(sectionIndex, 1);
    }
    /**
     * Sets the minimum height of the table body.
     */
    setTbodyMinHeight() {
        const { options } = this.grid;
        const minVisibleRows = options?.rendering?.rows?.minVisibleRows;
        const tbody = this.tbodyElement;
        if (!defined(minVisibleRows)) {
            if (this.tbodyMinHeightManaged) {
                tbody.style.minHeight = '';
                this.tbodyMinHeightManaged = false;
            }
            return;
        }
        const hasUserMinHeight = !!getStyle(tbody, 'min-height', true);
        if (!this.tbodyMinHeightManaged && hasUserMinHeight) {
            return;
        }
        const extraRowsCount = this.bodySections.reduce((count, section) => count + section.getRows().length, 0);
        const minScrollableRows = Math.max(0, minVisibleRows - extraRowsCount);
        tbody.style.minHeight = (minScrollableRows * this.rowsVirtualizer.defaultRowHeight) + 'px';
        this.tbodyMinHeightManaged = true;
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
            this.columnsById[columnId] = column;
        }
        this.columnResizing?.loadColumns();
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
        const { focusCursor } = vp;
        try {
            this.grid.showLoading();
            // Update data
            const oldRowsCount = vp.rows.length > 0 ?
                (vp.rows[vp.rows.length - 1]?.index ?? -1) + 1 :
                0;
            await vp.grid.querying.proceed();
            vp.grid.querying.pagination.clampPage();
            if (vp.grid.querying.shouldBeUpdated) {
                await vp.grid.querying.proceed();
            }
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
            for (const hook of vp.afterUpdateRowsHooks) {
                await hook();
            }
            // Update the pagination controls
            vp.grid.pagination?.updateControls();
            vp.reflow();
            if (focusCursor) {
                vp.focusCellFromCursor(focusCursor, true);
            }
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
        this.reflowColumns();
        this.columnsVirtualizer.refresh();
        // Reflow the head
        this.header?.reflow();
        // Reflow rows content dimensions
        this.rowsVirtualizer.reflowRows();
        const measuredRowHeight = (this.rowsVirtualizer.measureRenderedRowHeight());
        if (defined(measuredRowHeight)) {
            this.rowsVirtualizer.applyMeasuredRowHeight(measuredRowHeight);
        }
        this.setTbodyMinHeight();
        // Reflow the pagination
        this.grid.pagination?.reflow();
        // Reflow popups
        this.grid.popups.forEach((popup) => {
            popup.reflow();
        });
        this.grid.dirtyFlags.delete('reflow');
        fireEvent(this, 'afterReflow');
    }
    /**
     * Reflows column dimensions.
     */
    reflowColumns() {
        const columnResizing = this.columnResizing;
        if (columnResizing) {
            columnResizing.reflow();
            return;
        }
        this.columnLayout.reflow();
        this.rowsWidth = this.columnLayout.totalWidth;
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
        const items = CellContextMenuBuiltInActions.resolveCellContextMenuItems(tableCell);
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
        const viewportTopInset = this.getViewportTopInset();
        if (this.virtualRows) {
            this.tbodyElement.scrollTop = Math.max(0, index * this.rowsVirtualizer.defaultRowHeight -
                viewportTopInset);
            return;
        }
        const rowClass = '.' + Globals.getClassName('rowElement');
        const rows = this.tbodyElement.querySelectorAll(rowClass);
        const firstRow = rows[0];
        const safeIndex = Math.min(Math.max(0, index), Math.max(0, rows.length - 1));
        const targetRow = rows[safeIndex];
        if (!firstRow || !targetRow) {
            return;
        }
        const firstRowTop = firstRow.getBoundingClientRect().top;
        this.tbodyElement.scrollTop = Math.max(0, targetRow.getBoundingClientRect().top -
            firstRowTop -
            viewportTopInset);
    }
    /**
     * Scrolls the table to the specified column.
     *
     * @param index
     * The global index of the column to scroll to.
     *
     * @internal
     */
    scrollToColumn(index) {
        this.ensureColumnFullyVisible(index);
    }
    /**
     * Ensures that a column is fully visible inside the scrollable body.
     *
     * @param index
     * The global index of the column to reveal.
     *
     * @internal
     */
    ensureColumnFullyVisible(index) {
        const column = this.getColumnByIndex(index);
        if (!column) {
            return;
        }
        const left = this.columnLayout.getColumnLeft(column.index);
        const right = this.columnLayout.getColumnRight(column.index);
        const { tbodyElement } = this;
        const visibleLeft = tbodyElement.scrollLeft;
        const visibleRight = visibleLeft + tbodyElement.clientWidth;
        let nextScrollLeft = visibleLeft;
        if (left < visibleLeft) {
            nextScrollLeft = left;
        }
        else if (right > visibleRight) {
            nextScrollLeft = Math.max(0, right - tbodyElement.clientWidth);
        }
        if (nextScrollLeft !== visibleLeft) {
            tbodyElement.scrollLeft = nextScrollLeft;
            this.header?.scrollHorizontally(tbodyElement.scrollLeft);
        }
    }
    /**
     * Returns the top inset of the visible table body area. Composed modules
     * can extend this via the `getViewportTopInset` event.
     */
    getViewportTopInset() {
        const eventObject = {
            top: 0
        };
        fireEvent(this, 'getViewportTopInset', eventObject);
        return eventObject.top;
    }
    /**
     * Ensures that a row is fully visible inside the scrollable body.
     *
     * @param row
     * The row to reveal.
     */
    ensureRowFullyVisible(row) {
        if (!row.htmlElement.isConnected ||
            row.htmlElement.parentElement !== this.tbodyElement) {
            return;
        }
        const tbodyRect = this.tbodyElement.getBoundingClientRect();
        const rowRect = row.htmlElement.getBoundingClientRect();
        const visibleTop = tbodyRect.top + this.getViewportTopInset();
        const visibleBottom = tbodyRect.bottom;
        const visibleHeight = Math.max(visibleBottom - visibleTop, 0);
        const maxScrollTop = Math.max(this.tbodyElement.scrollHeight - this.tbodyElement.clientHeight, 0);
        let nextScrollTop = this.tbodyElement.scrollTop;
        if (rowRect.top < visibleTop) {
            nextScrollTop -= visibleTop - rowRect.top;
        }
        else if (rowRect.bottom > visibleBottom) {
            if (rowRect.height >= visibleHeight) {
                nextScrollTop += rowRect.top - visibleTop;
            }
            else {
                nextScrollTop += rowRect.bottom - visibleBottom;
            }
        }
        this.tbodyElement.scrollTop = Math.max(0, Math.min(nextScrollTop, maxScrollTop));
    }
    /**
     * Focuses a body cell by its row index in the rendered table order.
     *
     * @param rowIndex
     * The target row index.
     *
     * @param columnIndex
     * The target column index.
     */
    focusCellByRowIndex(rowIndex, columnIndex) {
        if (columnIndex < 0 ||
            columnIndex >= this.columns.length ||
            rowIndex < 0 ||
            rowIndex >= this.rowsVirtualizer.rowCount) {
            return;
        }
        const targetRow = this.rows.find((row) => row.index === rowIndex);
        if (!this.isColumnRendered(columnIndex)) {
            this.pendingFocusCursor = [rowIndex, columnIndex];
            this.scrollToColumn(columnIndex);
            this.scrollToRow(rowIndex);
            return;
        }
        const targetCell = targetRow?.getCellByColumnIndex(columnIndex);
        if (targetCell) {
            delete this.pendingFocusCursor;
            this.clearDetachedFocus();
            targetCell.htmlElement.focus({
                preventScroll: true
            });
            this.ensureColumnFullyVisible(columnIndex);
            if (targetRow?.htmlElement.parentElement === this.tbodyElement) {
                this.ensureRowFullyVisible(targetRow);
            }
            return;
        }
        this.pendingFocusCursor = [rowIndex, columnIndex];
        this.scrollToRow(rowIndex);
    }
    /**
     * Marks the current logical focus as temporarily detached by
     * virtualization.
     *
     * @param cursor
     * Focus cursor to restore when the cell is rendered again.
     */
    preserveFocusDuringDetach(cursor) {
        if (cursor) {
            this.focusCursor = {
                ...cursor,
                detached: true
            };
        }
        else if (this.focusCursor) {
            this.focusCursor.detached = true;
        }
    }
    /**
     * Returns whether the provided cell currently owns detached logical focus.
     *
     * @param rowId
     * Target row ID.
     *
     * @param columnIndex
     * Target column index.
     */
    hasDetachedFocusAt(rowId, columnIndex) {
        const { focusCursor } = this;
        return !!(rowId !== void 0 &&
            focusCursor &&
            focusCursor.detached &&
            focusCursor.type !== 'header' &&
            focusCursor.rowId === rowId &&
            focusCursor.columnIndex === columnIndex);
    }
    /**
     * Clears detached logical focus state and optionally the logical focus
     * cursor itself.
     *
     * @param clearFocusCursor
     * Whether to also clear the logical focus cursor.
     */
    clearDetachedFocus(clearFocusCursor = false) {
        if (clearFocusCursor) {
            delete this.focusCursor;
        }
        else if (this.focusCursor) {
            delete this.focusCursor.detached;
        }
    }
    /**
     * Restores focus to a rendered body cell. Composed modules can prevent the
     * default focus transfer via the `beforeRestoreCellFocus` event.
     *
     * @param cell
     * Rendered body cell to focus.
     *
     * @param rowIndex
     * Target row index in the rendered/projected order.
     *
     * @param columnIndex
     * Target column index.
     *
     * @param ensureVisible
     * Whether to scroll the target column fully into view. Should be `false`
     * for passive focus re-attachment during scroll-driven virtualization
     * re-renders, so the user's scroll position is not fought.
     */
    restoreRenderedCellFocus(cell, rowIndex, columnIndex, ensureVisible = true) {
        if (!cell) {
            return;
        }
        const eventObject = {
            cell,
            columnIndex,
            rowIndex
        };
        fireEvent(this, 'beforeRestoreCellFocus', eventObject, () => {
            this.clearDetachedFocus();
            cell.htmlElement.focus({
                preventScroll: true
            });
            if (ensureVisible) {
                this.ensureColumnFullyVisible(columnIndex);
            }
        });
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
        const cellElement = element.closest('.' + Globals.getClassName('cell'));
        if (!cellElement) {
            return;
        }
        const tr = cellElement.parentElement;
        if (!tr) {
            return;
        }
        const tbody = tr.parentElement;
        if (!tbody) {
            return;
        }
        let row;
        if (tbody === this.tbodyElement) {
            const rowIndexAttr = tr.getAttribute('data-row-index');
            if (rowIndexAttr === null) {
                return;
            }
            const rowIndex = parseInt(rowIndexAttr, 10);
            row = this.getRenderedRowByIndex(rowIndex);
        }
        else {
            row = this.bodySections.find((section) => section.tbodyElement === tbody)?.getRowByElement(tr);
        }
        if (!row) {
            return;
        }
        // Find cell index by position in row
        const cellIndex = Array.prototype.indexOf.call(tr.children, cellElement);
        return row.cells[cellIndex];
    }
    /**
     * Destroys the grid table.
     */
    destroy() {
        this.tbodyElement.removeEventListener('scroll', this.onScroll);
        this.theadElement?.removeEventListener('wheel', this.onHeaderWheel);
        document.removeEventListener('focusin', this.onDocumentFocusIn, true);
        document.removeEventListener('pointerdown', this.onDocumentPointerDown, true);
        this.removeBodyEventListeners(this.tbodyElement);
        for (const section of this.bodySections) {
            this.removeBodyEventListeners(section.tbodyElement);
        }
        this.bodySections.length = 0;
        this.resizeObserver.disconnect();
        this.columnsResizer?.removeEventListeners();
        this.header?.destroy();
        this.cellContextMenu?.hide();
        delete this.cellContextMenu;
        this.cellContextMenuLongPress?.removeEvents();
        delete this.cellContextMenuLongPress;
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
        this.columnsVirtualizer.refresh();
        this.header?.scrollHorizontally(meta.scrollLeft);
        fireEvent(this, 'bodyScroll', {
            scrollLeft: meta.scrollLeft,
            scrollTop: meta.scrollTop
        });
        if (meta.focusCursor) {
            this.focusCellFromCursor(meta.focusCursor);
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
        return this.columnsById[id];
    }
    /**
     * Returns the column with the provided global index.
     *
     * @param index
     * The global column index.
     *
     * @internal
     */
    getColumnByIndex(index) {
        return this.columns[index];
    }
    /**
     * Returns columns that are currently rendered.
     *
     * @internal
     */
    getRenderedColumns() {
        return (this.renderedColumns.length || this.virtualColumns ?
            this.renderedColumns :
            this.columns);
    }
    /**
     * Returns whether the column is rendered.
     *
     * @param column
     * Column ID or global column index.
     *
     * @internal
     */
    isColumnRendered(column) {
        const columnObject = typeof column === 'number' ?
            this.getColumnByIndex(column) :
            this.getColumn(column);
        if (!columnObject) {
            return false;
        }
        if (!this.virtualColumns) {
            return true;
        }
        return (columnObject.index >= this.columnsVirtualizer.columnCursor &&
            columnObject.index <= this.columnsVirtualizer.columnEnd);
    }
    /**
     * Returns the horizontal offset of the first rendered column.
     *
     * @internal
     */
    getRenderedColumnOffset() {
        return this.virtualColumns ?
            this.columnLayout.getColumnLeft(this.columnsVirtualizer.columnCursor) :
            0;
    }
    /**
     * Synchronizes rendered column cells and headers with the current range.
     *
     * @internal
     */
    async updateRenderedColumns() {
        for (const row of this.getRenderedRows()) {
            if (row.rendered) {
                await row.syncRenderedCells();
            }
        }
        if (this.grid.options?.rendering?.header?.enabled) {
            if (!this.header) {
                this.header = new TableHeader(this);
                await this.header.render();
            }
            else {
                await this.header.syncRenderedColumns();
            }
        }
        this.header?.scrollHorizontally(this.tbodyElement.scrollLeft);
        this.header?.reflow();
        this.rowsVirtualizer.reflowRows();
        const { focusCursor } = this;
        if (focusCursor?.detached &&
            focusCursor.type === 'header') {
            this.restoreHeaderFocusFromCursor(focusCursor, false);
        }
        if (this.pendingFocusCursor) {
            const [rowIndex, columnIndex] = this.pendingFocusCursor;
            const row = this.getRenderedRowByIndex(rowIndex);
            const cell = row?.getCellByColumnIndex(columnIndex);
            if (cell) {
                delete this.pendingFocusCursor;
                this.restoreRenderedCellFocus(cell, rowIndex, columnIndex);
            }
        }
        else if (focusCursor &&
            focusCursor.type !== 'header' &&
            !focusCursor.bodySectionId) {
            const rowIndex = await this.grid.dataProvider?.getRowIndex(focusCursor.rowId);
            const row = defined(rowIndex) ?
                this.getRenderedRowByIndex(rowIndex) :
                void 0;
            if (defined(rowIndex)) {
                this.restoreRenderedCellFocus(row?.getCellByColumnIndex(focusCursor.columnIndex), rowIndex, focusCursor.columnIndex, false);
            }
        }
    }
    /**
     * Returns the row with the provided ID.
     *
     * @param id
     * The ID of the row.
     */
    getRow(id) {
        return this.rows.find((row) => row.id === id) ||
            this.getRenderedRows().find((row) => row.id === id);
    }
    /**
     * Returns all rendered rows in visual order.
     *
     * @internal
     */
    getRenderedRows() {
        return [
            ...[].concat(...this.bodySections
                .filter((section) => section.position === 'before')
                .map((section) => section.getRows())),
            ...this.rows,
            ...[].concat(...this.bodySections
                .filter((section) => section.position === 'after')
                .map((section) => section.getRows()))
        ];
    }
    /**
     * Returns the rendered row with the provided presentation index.
     *
     * @param index
     * The row index in the presentation table.
     *
     * @internal
     */
    getRenderedRowByIndex(index) {
        return this.rows.find((row) => row.index === index);
    }
    async syncAriaRowIndexes() {
        const headerRowsCount = this.header?.rows.length ?? 0;
        const rows = this.getRenderedRows();
        for (let i = 0, iEnd = rows.length; i < iEnd; ++i) {
            this.grid.accessibility?.setRowIndex(rows[i].htmlElement, i + headerRowsCount + 1);
        }
        const baseRowCount = await this.grid.dataProvider?.getRowCount() || 0;
        const tableElement = this.grid.tableElement;
        if (tableElement) {
            tableElement.setAttribute('aria-rowcount', (baseRowCount +
                this.bodySections.reduce((count, section) => count + section.getRows().length, 0) +
                headerRowsCount) + '');
        }
    }
    focusCellFromCursor(cursor, defer = false) {
        const focus = () => {
            if (cursor.type === 'header') {
                this.restoreHeaderFocusFromCursor(cursor);
                return;
            }
            if (cursor.bodySectionId) {
                this.bodySections.find((section) => section.id === cursor.bodySectionId)?.getRowById(cursor.rowId)
                    ?.getCellByColumnIndex(cursor.columnIndex)
                    ?.htmlElement.focus();
                return;
            }
            void this.grid.dataProvider?.getRowIndex(cursor.rowId).then((rowIndex) => {
                if (rowIndex === void 0) {
                    return;
                }
                if (defer) {
                    this.focusCellByRowIndex(rowIndex, cursor.columnIndex);
                    return;
                }
                const row = this.getRenderedRowByIndex(rowIndex);
                this.restoreRenderedCellFocus(row?.getCellByColumnIndex(cursor.columnIndex), rowIndex, cursor.columnIndex);
            });
        };
        if (defer) {
            setTimeout(focus);
        }
        else {
            focus();
        }
    }
    /**
     * Restores focus to a rendered header cell when its logical focus was
     * detached by column virtualization.
     *
     * @param cursor
     * Focus cursor to restore.
     *
     * @param ensureVisible
     * Whether to scroll the target column fully into view. Should be `false`
     * for passive focus re-attachment during scroll-driven virtualization
     * re-renders, so the user's scroll position is not fought.
     */
    restoreHeaderFocusFromCursor(cursor = this.focusCursor, ensureVisible = true) {
        if (cursor?.type !== 'header') {
            return;
        }
        const rowIndex = this.header ?
            this.header.rows.length + (cursor.rowIndex || 0) :
            -1;
        const cell = this.header?.rows[rowIndex]?.getCellByKey(cursor.cellKey);
        if (!cell) {
            return;
        }
        this.clearDetachedFocus(true);
        if (cursor.toolbarButtonIndex !== void 0) {
            const button = cell.toolbar?.buttons[cursor.toolbarButtonIndex];
            if (button) {
                button.focus({
                    preventScroll: true
                });
                if (ensureVisible) {
                    this.ensureColumnFullyVisible(cursor.columnIndex);
                }
                return;
            }
        }
        cell.htmlElement.focus({
            preventScroll: true
        });
        if (ensureVisible) {
            this.ensureColumnFullyVisible(cursor.columnIndex);
        }
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default Table;
