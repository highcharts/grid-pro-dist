import type TableRow from './Body/TableRow';
import DataTable from '../../../Data/DataTable.js';
import ColumnResizingMode from './ColumnResizing/ResizingMode.js';
import Column from './Column.js';
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
     * The presentation version of the data table. It has applied modifiers
     * and is ready to be rendered.
     *
     * If you want to modify the data table, you should use the original
     * instance that is stored in the `grid.dataTable` property.
     */
    dataTable: DataTable;
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
     * The column distribution.
     */
    readonly columnResizing: ColumnResizingMode;
    /**
     * The focus cursor position: [rowIndex, columnIndex] or `undefined` if the
     * table cell is not focused.
     */
    focusCursor?: [number, number];
    /**
     * The only cell that is to be focusable using tab key - a table focus
     * entry point.
     */
    focusAnchorCell?: Cell;
    /**
     * The flag that indicates if the table rows are virtualized.
     */
    virtualRows: boolean;
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
     * Initializes the data grid table.
     */
    private init;
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
     * Scrolls the table to the specified row.
     *
     * @param index
     * The index of the row to scroll to.
     *
     * Try it: {@link https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/grid-lite/basic/scroll-to-row | Scroll to row}
     */
    scrollToRow(index: number): void;
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
    getStateMeta(): Table.ViewportStateMetadata;
    /**
     * Apply the metadata to the viewport state. It is used to restore the state
     * of the viewport when the data grid is re-rendered.
     *
     * @param meta
     * The viewport state metadata.
     */
    applyStateMeta(meta: Table.ViewportStateMetadata): void;
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
    getRow(id: number): TableRow | undefined;
}
declare namespace Table {
    /**
     * Represents the metadata of the viewport state. It is used to save the
     * state of the viewport and restore it when the data grid is re-rendered.
     */
    interface ViewportStateMetadata {
        scrollTop: number;
        scrollLeft: number;
        columnResizing: ColumnResizingMode;
        focusCursor?: [number, number];
    }
}
export default Table;
