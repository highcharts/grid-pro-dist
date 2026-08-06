import type Grid from '../../Core/Grid';
import type { CellContextMenuContext } from '../../Core/Table/CellContextMenu/CellContextMenuBuiltInActions';
/**
 * Options for structural table editing.
 */
export interface TableEditingOptions {
    /**
     * Whether built-in structural table editing UI is enabled.
     *
     * When enabled, Grid Pro adds built-in context menu actions for adding and
     * deleting rows and columns.
     *
     * @default false
     */
    enabled?: boolean;
}
/**
 * Handles structural row and column editing for Grid Pro.
 */
declare class TableEditingController {
    private readonly grid;
    constructor(grid: Grid);
    /**
     * Returns whether table editing UI is explicitly enabled.
     */
    isEnabled(): boolean;
    /**
     * Returns whether row actions can be used for the current context.
     *
     * @param context
     * Context menu runtime context.
     */
    canEditRows(context: CellContextMenuContext): boolean;
    /**
     * Returns whether column actions can be used for the current context.
     *
     * @param context
     * Context menu runtime context.
     */
    canEditColumns(context: CellContextMenuContext): boolean;
    /**
     * Returns whether a column can be deleted.
     *
     * @param context
     * Context menu runtime context.
     */
    canDeleteColumn(context: CellContextMenuContext): boolean;
    /**
     * Adds an empty row above the context row.
     *
     * @param context
     * Context menu runtime context.
     */
    addRowAbove(context: CellContextMenuContext): Promise<void>;
    /**
     * Adds an empty row below the context row.
     *
     * @param context
     * Context menu runtime context.
     */
    addRowBelow(context: CellContextMenuContext): Promise<void>;
    /**
     * Deletes the context row.
     *
     * @param context
     * Context menu runtime context.
     */
    deleteRow(context: CellContextMenuContext): Promise<void>;
    /**
     * Adds an empty column before the context column.
     *
     * @param context
     * Context menu runtime context.
     */
    addColumnBefore(context: CellContextMenuContext): Promise<void>;
    /**
     * Adds an empty column after the context column.
     *
     * @param context
     * Context menu runtime context.
     */
    addColumnAfter(context: CellContextMenuContext): Promise<void>;
    /**
     * Deletes the context column.
     *
     * @param context
     * Context menu runtime context.
     */
    deleteColumn(context: CellContextMenuContext): Promise<void>;
    private addRow;
    private addColumn;
    private getDataTable;
    private getOriginalRowIndex;
    private getNewColumnId;
    private getEmptyColumn;
    private getEmptyRow;
    private getNewRowId;
    private updateColumnsFromTable;
    private updateRowsFromTable;
    private redrawGrid;
    private getColumnOptions;
    private isIdColumn;
    private getIdColumn;
}
export default TableEditingController;
