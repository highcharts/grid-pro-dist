import type { CellType as DataTableCellType } from '../../../../Data/DataTable';
import type Column from '../Column';
import type TableRow from './TableRow';
import Cell from '../Cell.js';
import CellContent from '../CellContent/CellContent.js';
/**
 * Represents a cell in the data grid.
 */
declare class TableCell extends Cell {
    /**
     * The row of the cell.
     */
    readonly row: TableRow;
    /**
     * The column of the cell.
     */
    column: Column;
    /**
     * The cell's content.
     */
    content?: CellContent;
    /**
     * A token used to prevent stale async responses from overwriting cell
     * data. In virtualized grids, cells are reused as rows scroll in/out of
     * view. If a cell starts an async value fetch for row A, then gets reused
     * for row B before the fetch completes, the stale response for row A
     * could incorrectly overwrite row B's data. This token is incremented
     * before each async fetch, and checked when the fetch completes - if the
     * token has changed, the response is discarded as stale.
     */
    private asyncFetchToken;
    /**
     * Constructs a cell in the data grid.
     *
     * @param row
     * The row of the cell.
     *
     * @param column
     * The column of the cell.
     */
    constructor(row: TableRow, column: Column);
    /**
     * Renders the cell by appending it to the row and setting its value.
     */
    render(): Promise<void>;
    /**
     * Edits the cell value and updates the dataset. Call this instead of
     * `setValue` when you want it to trigger the cell value user change event.
     *
     * @param value
     * The new value to set.
     */
    editValue(value: DataTableCellType): Promise<void>;
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
    setValue(value?: DataTableCellType, updateDataset?: boolean): Promise<void>;
    /**
     * Returns merged styles from defaults and current column options.
     */
    private getCellStyles;
    /**
     * Updates the the dataset so that it reflects the current state of the
     * grid.
     *
     * @returns
     * A promise that resolves to `true` if the cell triggered all the whole
     * viewport rows to be updated, or `false` if the only change was the cell's
     * content.
     */
    protected updateDataset(): Promise<boolean>;
    /**
     * Initialize event listeners for table body cells.
     *
     * Most events (click, dblclick, keydown, mousedown, mouseover, mouseout)
     * are delegated to Table for better performance with virtualization.
     * Only focus/blur remain on individual cells for focus management.
     */
    initEvents(): void;
    /**
     * Handles the focus event on the cell.
     */
    protected onFocus(): void;
    /**
     * Handles the blur event on the cell.
     *
     * @param e
     * The focus event object.
     */
    protected onBlur(e?: FocusEvent): void;
    onMouseOver(): void;
    onMouseOut(): void;
    /**
     * Handles the double click event on the cell.
     *
     * @param e
     * The mouse event object.
     */
    protected onDblClick(e: MouseEvent): void;
    onClick(): void;
    /**
     * Destroys the cell.
     */
    destroy(): void;
}
/**
 * Event interface for table cell events.
 */
export interface TableCellEvent {
    target: TableCell;
}
export default TableCell;
