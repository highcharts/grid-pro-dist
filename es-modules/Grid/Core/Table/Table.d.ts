import type { RowId } from '../Data/DataProvider';
import ColumnResizingMode from './ColumnResizing/ResizingMode.js';
import Column from './Column.js';
import TableRow from './Body/TableRow.js';
import TableHeader from './Header/TableHeader.js';
import Grid from '../Grid.js';
import Cell from './Cell.js';
/**
 * Represents a table viewport of the data grid.
 */
declare class Table {
    /**
     * The data grid instance which the table (viewport) belongs to.
     */
    readonly grid: Grid;
    /**
     * The HTML element of the table.
     */
    readonly tableElement: HTMLTableElement;
    /**
     * The HTML element of the table head.
     */
    readonly theadElement?: HTMLElement;
    /**
     * The HTML element of the table body.
     */
    readonly tbodyElement: HTMLElement;
    /**
     * The head of the table.
     */
    header?: TableHeader;
    /**
     * The visible columns of the table.
     */
    columns: Column[];
    /**
     * The visible rows of the table.
     */
    rows: TableRow[];
    /**
     * Additional rendered body sections composed into the table.
     */
    private readonly bodySections;
    /**
     * The column distribution.
     */
    readonly columnResizing: ColumnResizingMode;
    /**
     * The focus cursor position or `undefined` if no table cell is focused.
     */
    focusCursor?: FocusCursor;
    /**
     * Pending focus target used while virtualization scrolls a body row into
     * the render window.
     */
    pendingFocusCursor?: [number, number];
    /**
     * The only cell that is to be focusable using tab key - a table focus
     * entry point.
     */
    focusAnchorCell?: Cell;
    /**
     * Whether the current logical focus belongs to a body cell that has been
     * detached from the DOM by virtualization.
     */
    private hasDetachedFocus;
    /**
     * The flag that indicates if the table rows are virtualized.
     */
    virtualRows: boolean;
    /**
     * Cell context menu instance (lazy created).
     */
    private cellContextMenu?;
    /**
     * Whether the table body min-height was set by the grid.
     */
    private tbodyMinHeightManaged;
    /**
     * Constructs a new data grid table.
     *
     * @param grid
     * The data grid instance which the table (viewport) belongs to.
     *
     * @param tableElement
     * The HTML table element of the data grid.
     */
    constructor(grid: Grid, tableElement: HTMLTableElement);
    /**
     * Initializes the table. Should be called after creation so that the table
     * can be asynchronously initialized.
     */
    init(): Promise<void>;
    private addBodyEventListeners;
    private removeBodyEventListeners;
    /**
     * Sets the minimum height of the table body.
     */
    private setTbodyMinHeight;
    /**
     * Checks if rows virtualization should be enabled.
     *
     * @returns
     * Whether rows virtualization should be enabled.
     */
    private shouldVirtualizeRows;
    /**
     * Loads the columns of the table.
     */
    private loadColumns;
    /**
     * Updates the rows of the table.
     */
    updateRows(): Promise<void>;
    /**
     * Reflows the table's content dimensions.
     */
    reflow(): void;
    /**
     * Handles the focus event on the table body.
     *
     * @param e
     * The focus event.
     */
    private onTBodyFocus;
    /**
     * Handles the resize event.
     */
    private onResize;
    /**
     * Handles the scroll event.
     */
    private onScroll;
    /**
     * Handles document focus changes while a logically focused cell is
     * temporarily detached by virtualization.
     *
     * @param e
     * The focus event.
     */
    private onDocumentFocusIn;
    /**
     * Clears detached logical focus when the user interacts outside of the
     * table while the focused cell is not rendered.
     *
     * @param e
     * The pointer event.
     */
    private onDocumentPointerDown;
    /**
     * Delegated click handler for cells.
     * @param e Mouse event
     */
    private onCellClick;
    /**
     * Delegated double-click handler for cells.
     * @param e Mouse event
     */
    private onCellDblClick;
    /**
     * Delegated context menu handler for cells.
     * @param e Mouse event
     */
    private onCellContextMenu;
    /**
     * Delegated mousedown handler for cells.
     * @param e Mouse event
     */
    private onCellMouseDown;
    /**
     * Delegated mouseover handler for cells.
     * @param e Mouse event
     */
    private onCellMouseOver;
    /**
     * Delegated mouseout handler for cells.
     * @param e Mouse event
     */
    private onCellMouseOut;
    /**
     * Delegated keydown handler for cells.
     * @param e Keyboard event
     */
    private onCellKeyDown;
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
    private openCellContextMenu;
    /**
     * Scrolls the table to the specified row.
     *
     * @param index
     * The index of the row to scroll to.
     *
     * Try it: {@link https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/grid-lite/basic/scroll-to-row | Scroll to row}
     */
    scrollToRow(index: number): void;
    /**
     * Returns the top inset of the visible table body area. Composed modules
     * can extend this via the `getViewportTopInset` event.
     */
    getViewportTopInset(): number;
    /**
     * Ensures that a row is fully visible inside the scrollable body.
     *
     * @param row
     * The row to reveal.
     */
    ensureRowFullyVisible(row: TableRow): void;
    /**
     * Focuses a body cell by its row index in the rendered table order.
     *
     * @param rowIndex
     * The target row index.
     *
     * @param columnIndex
     * The target column index.
     */
    focusCellByRowIndex(rowIndex: number, columnIndex: number): void;
    /**
     * Marks the current logical focus as temporarily detached by
     * virtualization.
     */
    preserveFocusDuringDetach(): void;
    /**
     * Returns whether the provided cell currently owns detached logical focus.
     *
     * @param rowId
     * Target row ID.
     *
     * @param columnIndex
     * Target column index.
     */
    hasDetachedFocusAt(rowId: RowId | undefined, columnIndex: number): boolean;
    /**
     * Clears detached logical focus state and optionally the logical focus
     * cursor itself.
     *
     * @param clearFocusCursor
     * Whether to also clear the logical focus cursor.
     */
    clearDetachedFocus(clearFocusCursor?: boolean): void;
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
     */
    restoreRenderedCellFocus(cell: Cell | undefined, rowIndex: number, columnIndex: number): void;
    /**
     * Destroys the grid table.
     */
    destroy(): void;
    /**
     * Get the viewport state metadata. It is used to save the state of the
     * viewport and restore it when the data grid is re-rendered.
     *
     * @returns
     * The viewport state metadata.
     */
    getStateMeta(): ViewportStateMetadata;
    /**
     * Apply the metadata to the viewport state. It is used to restore the state
     * of the viewport when the data grid is re-rendered.
     *
     * @param meta
     * The viewport state metadata.
     */
    applyStateMeta(meta: ViewportStateMetadata): void;
    /**
     * Sets the focus anchor cell.
     *
     * @param cell
     * The cell to set as the focus anchor cell.
     */
    setFocusAnchorCell(cell: Cell): void;
    /**
     * Returns the column with the provided ID.
     *
     * @param id
     * The ID of the column.
     */
    getColumn(id: string): Column | undefined;
    /**
     * Returns the row with the provided ID.
     *
     * @param id
     * The ID of the row.
     */
    getRow(id: RowId): TableRow | undefined;
    syncAriaRowIndexes(): Promise<void>;
    private focusCellFromCursor;
}
export interface FocusCursor {
    rowId: RowId;
    columnIndex: number;
    bodySectionId?: string;
}
export interface TableBodySection {
    id: string;
    position: 'before' | 'after';
    tbodyElement: HTMLElement;
    getRows: () => TableRow[];
    getRowByElement: (rowElement: HTMLElement) => TableRow | undefined;
    getRowById: (rowId: RowId) => TableRow | undefined;
}
/**
 * Represents the metadata of the viewport state. It is used to save the
 * state of the viewport and restore it when the data grid is re-rendered.
 */
export interface ViewportStateMetadata {
    scrollTop: number;
    scrollLeft: number;
    columnResizing: ColumnResizingMode;
    focusCursor?: FocusCursor;
}
/**
 * Event object emitted before focus is restored to a rendered body cell.
 */
export interface RestoreCellFocusEvent {
    cell: Cell;
    columnIndex: number;
    rowIndex: number;
    defaultPrevented?: boolean;
    preventDefault?: () => void;
}
export default Table;
