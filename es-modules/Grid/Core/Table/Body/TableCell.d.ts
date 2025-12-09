import type DataTable from '../../../../Data/DataTable';
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
    render(): void;
    /**
     * Edits the cell value and updates the data table. Call this instead of
     * `setValue` when you want it to trigger the cell value user change event.
     *
     * @param value
     * The new value to set.
     */
    editValue(value: DataTable.CellType): Promise<void>;
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
    setValue(value?: DataTable.CellType, updateTable?: boolean): Promise<void>;
    /**
     * Updates the the data table so that it reflects the current state of
     * the grid.
     *
     * @returns
     * A promise that resolves to `true` if the cell triggered all the whole
     * viewport rows to be updated, or `false` if the only change should be
     * the cell's content.
     */
    private updateDataTable;
    initEvents(): void;
    /**
     * Handles the focus event on the cell.
     */
    protected onFocus(): void;
    protected onMouseOver(): void;
    protected onMouseOut(): void;
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
