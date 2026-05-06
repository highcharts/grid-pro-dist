import type Cell from '../Cell';
import type Column from '../Column';
import type { RowObject as DataTableRowObject } from '../../../../Data/DataTable';
import type { RowId } from '../../Data/DataProvider';
import Row from '../Row.js';
import Table from '../Table.js';
/**
 * Represents a row in the data grid.
 */
declare class TableRow extends Row {
    /**
     * The row values from the data table in the original column order.
     */
    data: DataTableRowObject;
    /**
     * The local index of the row in the presentation data table.
     */
    index: number;
    /**
     * The unique ID of the row.
     */
    id?: RowId;
    /**
     * The vertical translation of the row.
     */
    translateY: number;
    /**
     * Constructs a row in the data grid.
     *
     * @param viewport
     * The Grid Table instance which the row belongs to.
     *
     * @param index
     * The index of the row in the data table.
     */
    constructor(viewport: Table, index: number);
    init(): Promise<void>;
    createCell(column: Column): Cell;
    /**
     * Loads the row data from the data table.
     */
    private loadData;
    /**
     * Updates the row data and its cells with the latest values from the data
     * table.
     */
    update(): Promise<void>;
    /**
     * Reuses the row instance for a new index.
     *
     * @param index
     * The index of the row in the data table.
     */
    reuse(index: number): Promise<void>;
    /**
     * Adds or removes the hovered CSS class to the row element.
     *
     * @param hovered
     * Whether the row should be hovered.
     */
    setHoveredState(hovered: boolean): void;
    /**
     * Adds or removes the synced CSS class to the row element.
     *
     * @param synced
     * Whether the row should be synced.
     */
    setSyncedState(synced: boolean): void;
    /**
     * Sets the row HTML element attributes and additional classes.
     */
    setRowAttributes(): void;
    /**
     * Sets the row HTML element attributes that are updateable in the row
     * lifecycle.
     */
    updateRowAttributes(): void;
    /**
     * Updates the row parity class based on index.
     */
    protected updateParityClass(): void;
    /**
     * Updates the hovered and synced classes based on grid state.
     */
    protected updateStateClasses(): void;
    /**
     * Sets the vertical translation of the row. Used for virtual scrolling.
     *
     * @param value
     * The vertical translation of the row.
     */
    setTranslateY(value: number): void;
}
export default TableRow;
