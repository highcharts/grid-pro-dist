import type DataTable from '../../../Data/DataTable';
import type Grid from '../../Core/Grid';
import type { RowId } from '../../Core/Data/DataProvider';
import type { TreeProjectionState } from './TreeViewTypes';
import type { ResolvedTreeViewOptions } from './TreeViewOptionsNormalizer';
/**
 * Infrastructure controller for TreeView projection state.
 *
 * Validates tree input options, builds a canonical relation index and projects
 * queried tables into tree order before pagination.
 */
declare class TreeProjectionController {
    private readonly grid;
    private indexCache?;
    private projectionStateCache?;
    private injectedAncestorIds?;
    private expansionStateSeedKey?;
    private resolvedOptions?;
    private cacheSource?;
    constructor(grid: Grid);
    /**
     * Synchronizes internal state from current Grid options and provider.
     */
    sync(): void;
    /**
     * Returns resolved TreeView options for the current source table.
     */
    get options(): ResolvedTreeViewOptions | undefined;
    /**
     * Returns metadata for currently projected rows.
     */
    getProjectionState(): TreeProjectionState | undefined;
    /**
     * Toggles expansion state for a row in current projection.
     *
     * @param rowId
     * Row ID to toggle.
     *
     * @param redraw
     * Whether to redraw rows after state change.
     *
     * @param originalEvent
     * Browser event that initiated the toggle.
     *
     * @returns
     * Promise resolving to `true` when state changed, otherwise `false`.
     */
    toggleRow(rowId: RowId, redraw?: boolean, originalEvent?: TreeRowToggleTriggerEvent): Promise<boolean>;
    /**
     * Expands all currently expandable tree rows.
     *
     * @param redraw
     * Whether to redraw rows after state change.
     *
     * @returns
     * Promise resolving to `true` when state changed, otherwise `false`.
     */
    expandAll(redraw?: boolean): Promise<boolean>;
    /**
     * Collapses all currently expandable tree rows.
     *
     * @param redraw
     * Whether to redraw rows after state change.
     *
     * @returns
     * Promise resolving to `true` when state changed, otherwise `false`.
     */
    collapseAll(redraw?: boolean): Promise<boolean>;
    /**
     * Projects a queried table into TreeView row order and visibility.
     *
     * @param table
     * Table after sort/filter and before pagination.
     *
     * The input table is expected to be after sort/filter, but before
     * pagination. If TreeView is disabled, unchanged table is returned.
     */
    projectTable(table: DataTable): DataTable;
    /**
     * Destroys controller state.
     */
    destroy(): void;
    /**
     * Clears cached index, projection state, and source metadata.
     */
    private clearCache;
    /**
     * Marks rows as dirty and schedules redraw after projection state updates.
     *
     * @param redraw
     * Whether to redraw rows immediately.
     */
    private requestRowsRedraw;
    /**
     * Ensures row metadata record exists for a row.
     *
     * @param rowId
     * Row ID.
     *
     * @returns
     * Row metadata record.
     */
    private ensureRowMetaRecord;
    /**
     * Removes empty row metadata records.
     *
     * @param rowId
     * Row ID.
     */
    private cleanupRowMeta;
    /**
     * Clears TreeView metadata state for all rows.
     */
    private clearTreeRowMetaState;
    /**
     * Sets explicit expanded state for a row.
     *
     * @param rowId
     * Row ID.
     *
     * @param expanded
     * Whether row should be explicitly expanded.
     *
     * @returns
     * `true` when state changed.
     */
    private setRowMetaExpanded;
    /**
     * Returns data options with TreeView extension for local provider.
     */
    private getDataOptions;
    /**
     * Builds canonical tree index for currently selected input type.
     *
     * @param columns
     * Source columns.
     *
     * @param idColumn
     * Column ID containing stable row IDs.
     *
     * @param input
     * Normalized input configuration.
     *
     * @returns
     * Canonical tree index.
     */
    private buildIndexFromInput;
    /**
     * Synchronizes expansion state for tree nodes with children.
     *
     * Re-initializes state when expansion seed changes, otherwise prunes
     * entries that are no longer expandable.
     */
    private syncExpandedRowIdsState;
    /**
     * Computes projected row order and per-row tree metadata for visible rows.
     *
     * @param table
     * Queried table after sort/filter and before pagination.
     *
     * @param idColumn
     * Column containing row IDs.
     *
     * @returns
     * Projection state describing visible rows in tree order.
     */
    private projectToVisibleState;
    /**
     * Builds a projected table by reordering all columns to projected indexes.
     *
     * @param table
     * Input queried table.
     *
     * @param projectionState
     * Projection state for table rebuild.
     *
     * @param idColumn
     * Column containing stable row IDs.
     *
     * @returns
     * Cloned table with projected column values and row index references.
     */
    private createProjectedTable;
    /**
     * Resolves column value for an auto-generated tree path row.
     *
     * @param columnId
     * Target column ID.
     *
     * @param rowId
     * Generated row ID.
     *
     * @param idColumn
     * Column containing stable row IDs.
     *
     * @returns
     * Cell value for generated row, or `null` for unsupported columns.
     */
    private getGeneratedCellValue;
    /**
     * Resolves cell value for an injected ancestor row from the source table.
     *
     * @param columnId
     * Target column ID.
     *
     * @param rowId
     * Ancestor row ID.
     *
     * @returns
     * Cell value from the source table, or `null` when unavailable.
     */
    private getSourceTableCellValue;
    /**
     * Checks whether provided row indexes represent identity mapping.
     *
     * @param rowIndexes
     * Row indexes to verify.
     *
     * @param rowCount
     * Expected number of rows in identity mapping.
     *
     * @returns
     * `true` for `[0, 1, 2, ...]`, otherwise `false`.
     */
    private static areRowIndexesIdentity;
    /**
     * Builds a stable key for expansion state seeds from options.
     *
     * @param options
     * Resolved TreeView options.
     *
     * @returns
     * Expansion seed key used to decide whether state should be reinitialized.
     */
    private static getExpansionSeedKey;
    /**
     * Resolves effective tree input configuration for source columns.
     *
     * @param columns
     * Source columns.
     *
     * @param input
     * Normalized input configuration. When omitted, the controller
     * auto-detects the standard `parentId` or `path` columns.
     *
     * @returns
     * Resolved normalized input configuration.
     */
    private static resolveInputOptions;
    /**
     * Runtime type guard for local data provider options.
     *
     * @param dataOptions
     * Data provider options to test.
     *
     * @returns
     * `true` when options belong to the local data provider.
     */
    private static isLocalDataOptions;
}
/**
 * Browser event that triggered a tree row toggle.
 */
export type TreeRowToggleTriggerEvent = KeyboardEvent | MouseEvent;
/**
 * Shared event payload for tree row toggle events.
 */
interface TreeRowToggleEvent {
    /**
     * Browser event that initiated the toggle, when available.
     */
    originalEvent?: TreeRowToggleTriggerEvent;
    /**
     * Row ID for the toggled tree row.
     */
    rowId: RowId;
}
/**
 * Event payload fired before a tree row toggle.
 */
export interface BeforeTreeRowToggleEvent extends TreeRowToggleEvent {
    /**
     * Expanded state requested by the toggle.
     */
    expanded: boolean;
    /**
     * Whether the toggle was canceled.
     */
    defaultPrevented?: boolean;
    /**
     * Prevents the tree row toggle.
     */
    preventDefault: () => void;
}
/**
 * Event payload fired after a tree row toggle.
 */
export interface AfterTreeRowToggleEvent extends TreeRowToggleEvent {
    /**
     * Expanded state after the toggle.
     */
    expanded: boolean;
}
export default TreeProjectionController;
