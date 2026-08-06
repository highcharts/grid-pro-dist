import type { GroupedHeaderOptions } from '../../Options';
import type Cell from '../Cell';
import Table from '../Table.js';
import Row from '../Row.js';
import HeaderCell from './HeaderCell.js';
import Column from '../Column.js';
interface HeaderRowSyncResult {
    cell: HeaderCell;
    isNew: boolean;
}
/**
 * Represents a row in the data grid header.
 */
declare class HeaderRow extends Row {
    /**
     * The level in the header.
     */
    level: number;
    /**
     * Header cells indexed by a stable render key.
     */
    private headerCellsByKey;
    /**
     * Constructs a row in the data grid.
     *
     * @param viewport
     * The Grid Table instance which the row belongs to.
     *
     * @param level
     * The current level of header that is rendered.
     */
    constructor(viewport: Table, level: number);
    createCell(column?: Column, columnsTree?: GroupedHeaderOptions[]): HeaderCell;
    reflow(): void;
    /**
     * Applies absolute cell positions and row-span heights for virtualized
     * columns. This emulates native table layout after rows are measured.
     *
     * @param rowHeights
     * Natural header row heights.
     *
     * @param rowIndex
     * Index of this row in the table header.
     */
    applyVirtualColumnLayout(rowHeights: number[], rowIndex: number): void;
    /**
     * Sets a specific class to the last cell in the row.
     */
    protected setLastCellClass(): void;
    /**
     * Synchronizes a row that consists of column header cells only.
     *
     * @param columns
     * The columns to synchronize.
     *
     * @param desiredKeys
     * The keys expected after synchronization.
     *
     * @param orderedCells
     * The cells in the expected DOM order.
     */
    protected syncColumnHeaders(columns: Column[], desiredKeys: Record<string, boolean>, orderedCells: HeaderCell[]): Promise<void>;
    /**
     * Synchronizes one header cell.
     *
     * @param key
     * The stable cell key.
     *
     * @param desiredKeys
     * The keys expected after synchronization.
     *
     * @param orderedCells
     * The cells in the expected DOM order.
     *
     * @param column
     * The direct column represented by the cell.
     *
     * @param columnsTree
     * The grouped header tree represented by the cell.
     *
     * @returns
     * The synchronized cell and whether it was newly created.
     */
    protected syncHeaderCell(key: string, desiredKeys: Record<string, boolean>, orderedCells: HeaderCell[], column?: Column, columnsTree?: GroupedHeaderOptions[]): HeaderRowSyncResult;
    /**
     * Destroys cells that are no longer expected in this row.
     *
     * @param desiredKeys
     * The keys expected after synchronization.
     */
    protected destroyStaleCells(desiredKeys: Record<string, boolean>): void;
    /**
     * Synchronizes header cell elements with the expected DOM order.
     *
     * @param orderedCells
     * The cells in the expected DOM order.
     */
    protected syncCellElements(orderedCells: HeaderCell[]): void;
    /**
     * Clears position-related classes before recalculating them.
     */
    protected clearPositionClasses(): void;
    /**
     * Returns the stable key for a column header cell.
     *
     * @param columnId
     * The column ID.
     */
    protected getColumnCellKey(columnId: string): string;
    /**
     * Returns a header cell by its stable render key.
     *
     * @param key
     * The stable header cell key.
     */
    getCellByKey(key: string): HeaderCell | undefined;
    /**
     * Preserves logical focus when column virtualization detaches the active
     * header cell.
     *
     * @param cell
     * The cell that is about to be detached.
     */
    protected onCellBeforeDetach(cell: Cell): void;
    /**
     * Returns a restorable focus cursor for a header cell.
     *
     * @param cell
     * The focused header cell.
     *
     * @param activeElement
     * The active element inside the header cell.
     */
    private getFocusCursor;
    /**
     * Returns the stable key for a grouped header cell.
     *
     * @param level
     * The header row level.
     *
     * @param index
     * The index of the grouped header on the level.
     */
    private getGroupCellKey;
    unregisterCell(cell: Cell): void;
    /**
     * Get all headers that should be rendered in a level.
     *
     * @param scope
     * Level that we start from
     *
     * @param targetLevel
     * Max level
     *
     * @param currentLevel
     * Current level
     *
     * @param result
     * Target array for matched headers.
     *
     * @return
     * Array of headers that should be rendered in a level
     */
    private getColumnsAtLevel;
    /**
     * Sets the row HTML element attributes and additional classes.
     */
    private setRowAttributes;
}
export default HeaderRow;
