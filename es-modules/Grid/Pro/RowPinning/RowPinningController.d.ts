import type Grid from '../../Core/Grid';
import type { GridEvent } from '../../Core/GridUtils';
import type RowPinningView from './RowPinningView';
import type { RowObject as RowObjectType, CellType as DataTableCellType } from '../../../Data/DataTable';
import type { RowId as DataProviderRowId } from '../../Core/Data/DataProvider';
export type RowId = DataProviderRowId;
export type RowPinningPosition = 'top' | 'bottom';
export type RowPinningChangeAction = 'pin' | 'unpin' | 'toggle';
/**
 * Snapshot of pinned row IDs by section.
 */
export interface RowPinningState {
    /**
     * Row IDs pinned to the top section.
     */
    topIds: RowId[];
    /**
     * Row IDs pinned to the bottom section.
     */
    bottomIds: RowId[];
}
export interface RowPinningChangeEvent {
    rowId: RowId;
    action: RowPinningChangeAction;
    position?: RowPinningPosition;
    index?: number;
    changed: boolean;
    previousTopIds: RowId[];
    previousBottomIds: RowId[];
    topIds: RowId[];
    bottomIds: RowId[];
}
export type RowPinningChangeEventCallback = (this: Grid, e: GridEvent<Grid> & RowPinningChangeEvent) => void;
export interface RowPinningEvents {
    /**
     * Fires before a row pinning change is applied.
     *
     * Call `event.preventDefault()` to cancel the change.
     */
    beforeRowPin?: RowPinningChangeEventCallback;
    /**
     * Fires after a row pinning change has been applied.
     */
    afterRowPin?: RowPinningChangeEventCallback;
}
export interface RowPinningSectionOptions {
    /**
     * Maximum height for this pinned tbody. Enables vertical scrolling in the
     * pinned section when content exceeds this height.
     */
    maxHeight?: number | string;
}
/**
 * Options for pinning rows to dedicated sections above or below the main
 * scrollable body.
 */
export interface RowPinningOptions {
    /**
     * Whether row pinning is enabled.
     *
     * @default true
     */
    enabled?: boolean;
    /**
     * Column ID containing stable unique row IDs used by pinning.
     *
     * When omitted, row pinning uses the provider row IDs resolved by the
     * Grid.
     */
    idColumn?: string;
    /**
     * Row IDs pinned to the top section on initial render.
     */
    topIds?: RowId[];
    /**
     * Row IDs pinned to the bottom section on initial render.
     */
    bottomIds?: RowId[];
    /**
     * Layout options for the top pinned rows section.
     */
    top?: RowPinningSectionOptions;
    /**
     * Layout options for the bottom pinned rows section.
     */
    bottom?: RowPinningSectionOptions;
    /**
     * Event callbacks fired when rows are pinned or unpinned.
     */
    events?: RowPinningEvents;
    /**
     * Callback used to derive the initial pinned position for each row.
     *
     * Return `'top'` or `'bottom'` to pin the row, or `null` / `undefined`
     * to keep it in the regular scrollable body.
     */
    resolve?: (row: RowObjectType) => ('top' | 'bottom' | null | undefined);
}
export type GridRowPinningOptions = RowPinningOptions;
export interface RowPinningLangA11yOptions {
    /**
     * Screen reader announcements for row pinning state changes.
     */
    announcements?: {
        /**
         * Message announced after a row is pinned.
         *
         * Use `{rowId}` and `{position}` placeholders to insert runtime data.
         *
         * @default 'Row {rowId} pinned to {position}.'
         */
        pinned?: string;
        /**
         * Message announced after a row is unpinned.
         *
         * Use `{rowId}` to insert the pinned row identifier.
         *
         * @default 'Row {rowId} unpinned.'
         */
        unpinned?: string;
    };
    /**
     * Additional descriptions exposed for pinned rows.
     */
    descriptions?: {
        /**
         * Description for rows pinned to the top section.
         *
         * @default 'Pinned row in top section.'
         */
        pinnedTop?: string;
        /**
         * Description for rows pinned to the bottom section.
         *
         * @default 'Pinned row in bottom section.'
         */
        pinnedBottom?: string;
        /**
         * Description added when a rendered row also exists in the top pinned
         * section.
         *
         * @default 'This row is also pinned to top section.'
         */
        alsoPinnedTop?: string;
        /**
         * Description added when a rendered row also exists in the bottom
         * pinned section.
         *
         * @default 'This row is also pinned to bottom section.'
         */
        alsoPinnedBottom?: string;
    };
}
declare module '../../Core/Options' {
    interface CellContextMenuBuiltInActionIdRegistry {
        pinRowTop: never;
        pinRowBottom: never;
        unpinRow: never;
    }
    interface LangOptions {
        /**
         * Label used for the built-in "pin row to top" action.
         *
         * @default 'Pin row to top'
         */
        pinRowTop?: string;
        /**
         * Label used for the built-in "pin row to bottom" action.
         *
         * @default 'Pin row to bottom'
         */
        pinRowBottom?: string;
        /**
         * Label used for the built-in "unpin row" action.
         *
         * @default 'Unpin row'
         */
        unpinRow?: string;
    }
    interface RowsSettings {
        /**
         * Row pinning options for rendering dedicated sections above or below
         * the scrollable table body.
         *
         * @sample grid-pro/demo/row-pinning Row pinning
         */
        pinning?: RowPinningOptions;
    }
}
declare module '../../Core/Accessibility/A11yOptions' {
    interface A11yAnnouncementsOptions {
        /**
         * Enable accessibility announcements for row pinning changes.
         *
         * @default true
         */
        rowPinning?: boolean;
    }
    interface LangAccessibilityOptions {
        /**
         * Accessibility language options for row pinning.
         */
        rowPinning?: RowPinningLangA11yOptions;
    }
}
declare module '../../Core/Grid' {
    export default interface Grid {
        rowPinning?: RowPinningController;
    }
}
declare module '../../Core/Table/Table' {
    export default interface Table {
        rowPinningView?: RowPinningView;
    }
}
/**
 * Returns whether row pinning was explicitly configured by the user.
 *
 * @param grid
 * Grid instance options container.
 */
export declare function hasConfiguredGridRowPinningOptions(grid: Pick<Grid, 'userOptions'>): boolean;
/**
 * Returns merged row pinning options from the grid.
 *
 * @param grid
 * Grid instance options container.
 */
export declare function getGridRowPinningOptions(grid: Pick<Grid, 'options'>): (GridRowPinningOptions | undefined);
/**
 * Stores row pinning state from two sources:
 * - explicit pinned ids from config/runtime API
 * - resolved pinned ids produced by `pinning.resolve`
 *
 * The effective pinned state is the normalized combination of both, minus
 * rows explicitly unpinned at runtime.
 */
declare class RowPinningController {
    /**
     * Owning grid instance.
     */
    readonly grid: Grid;
    /**
     * Explicitly pinned top row IDs from config or runtime API calls.
     */
    private topRowIds;
    /**
     * Explicitly pinned bottom row IDs from config or runtime API calls.
     */
    private bottomRowIds;
    /**
     * Top row IDs produced by the `pinning.resolve` callback.
     */
    private resolvedTopRowIds;
    /**
     * Bottom row IDs produced by the `pinning.resolve` callback.
     */
    private resolvedBottomRowIds;
    /**
     * Set of row IDs that were explicitly unpinned at runtime, overriding
     * resolved pins.
     */
    private explicitUnpinned;
    /**
     * Cache of row data objects for all currently pinned rows.
     */
    private pinnedRowObjects;
    /**
     * Whether the explicit pinned IDs need to be reloaded from options.
     */
    private optionsDirty;
    /**
     * Creates a new row pinning controller for the given grid.
     *
     * @param grid
     * Owning grid instance.
     */
    constructor(grid: Grid);
    /**
     * Returns the current row pinning options from the grid.
     */
    getPinningOptions(): ReturnType<typeof getGridRowPinningOptions>;
    /**
     * Reloads explicit pinned IDs from options when they are marked dirty.
     */
    loadOptions(): void;
    /**
     * Marks pinning options as dirty so they are reloaded on the next access.
     */
    markOptionsDirty(): void;
    /**
     * Returns whether row pinning is effectively active (any rows are pinned
     * or a resolve function is configured).
     */
    isEnabled(): boolean;
    /**
     * Returns whether the `enabled` pinning option is not explicitly `false`.
     */
    isOptionEnabled(): boolean;
    /**
     * Pins a row to the given section.
     *
     * @param rowId
     * Row identifier to pin.
     *
     * @param position
     * Target section — `'top'` (default) or `'bottom'`.
     *
     * @param index
     * Zero-based insertion index within the section. Appends when omitted.
     */
    pin(rowId: RowId, position?: RowPinningPosition, index?: number): Promise<void>;
    /**
     * Toggles a row between pinned and unpinned state.
     *
     * @param rowId
     * Row identifier to toggle.
     *
     * @param position
     * Section to pin to when the row is currently unpinned.
     */
    toggle(rowId: RowId, position?: RowPinningPosition): Promise<void>;
    /**
     * Unpins a row from whichever section it currently belongs to.
     *
     * @param rowId
     * Row identifier to unpin.
     */
    unpin(rowId: RowId): Promise<void>;
    /**
     * Returns the pinned row state that would result from applying an action,
     * without mutating any internal state.
     *
     * @param previous
     * Current pinned row state to derive from.
     *
     * @param action
     * Whether to simulate a pin or unpin.
     *
     * @param rowId
     * Row identifier to act on.
     *
     * @param position
     * Target section for a pin action.
     *
     * @param index
     * Insertion index within the section for a pin action.
     */
    previewPinnedRowsChange(previous: RowPinningState, action: 'pin' | 'unpin', rowId: RowId, position?: RowPinningPosition, index?: number): RowPinningState;
    /**
     * Replaces the resolved (callback-derived) pinned row IDs.
     *
     * @param topIds
     * Resolved top-section row IDs.
     *
     * @param bottomIds
     * Resolved bottom-section row IDs.
     */
    setResolvedIds(topIds: RowId[], bottomIds: RowId[]): void;
    /**
     * Removes the given row IDs from the explicit pin lists.
     *
     * @param rowIds
     * Row IDs confirmed to be absent from the data source.
     */
    pruneMissingExplicitIds(rowIds: RowId[]): void;
    /**
     * Returns the effective pinned row state — the union of explicit and
     * resolved IDs, deduplicated and filtered by explicit unpins.
     */
    getPinnedRows(): RowPinningState;
    /**
     * Returns the cached row data object for a pinned row, if available.
     *
     * @param rowId
     * Row identifier to look up.
     */
    getPinnedRowObject(rowId: RowId): RowObjectType | undefined;
    /**
     * Caches the data object of a materialized row if it is currently pinned.
     *
     * @param rowId
     * Row identifier.
     *
     * @param row
     * Row data object to cache.
     */
    rememberMaterializedRow(rowId: RowId | undefined, row: RowObjectType): void;
    /**
     * Attempts to hydrate row data objects for the given pinned row IDs from
     * the materialized viewport rows or the source data table.
     *
     * @param rowIds
     * Pinned row IDs to hydrate.
     */
    ensurePinnedRowsAvailable(rowIds: RowId[]): Promise<{
        hydratedRowIds: RowId[];
        definitiveMissingRowIds: RowId[];
    }>;
    /**
     * Updates a single cell value in the cached row data object of a pinned
     * row.
     *
     * @param rowId
     * Row identifier whose cache entry to update.
     *
     * @param columnId
     * Column identifier of the cell to update.
     *
     * @param value
     * New cell value.
     */
    updatePinnedRowValue(rowId: RowId, columnId: string, value: DataTableCellType): void;
    /**
     * Clears all cached row data objects, forcing re-hydration on next render.
     */
    invalidatePinnedRowObjects(): void;
    /**
     * Re-runs the `pinning.resolve` callback over all rows in the data
     * provider and updates the resolved pinned IDs accordingly.
     */
    recomputeResolvedFromMaterializedRows(): Promise<void>;
    /**
     * Handles missing pinned rows reported after a render cycle by
     * attempting to hydrate them or pruning them from the pin lists.
     *
     * @param result
     * Render result containing IDs of rows that could not be rendered.
     *
     * @param result.missingPinnedRowIds
     * IDs of pinned rows that were not found during the render cycle.
     *
     * @param source
     * Whether the render was triggered by a query cycle or a runtime API call.
     */
    handlePinnedRenderResult(result: {
        missingPinnedRowIds: RowId[];
    }, source: 'query' | 'runtime'): Promise<void>;
    /**
     * Returns the normalized explicit (non-resolved) pinned row state.
     */
    private getExplicitPinnedRows;
    /**
     * Mutates internal state to pin a row without firing events.
     *
     * @param rowId
     * Row identifier to pin.
     *
     * @param position
     * Target section.
     *
     * @param index
     * Insertion index within the section.
     */
    private applyPin;
    /**
     * Mutates internal state to unpin a row without firing events.
     *
     * @param rowId
     * Row identifier to unpin.
     */
    private applyUnpin;
    /**
     * Builds the event payload for a pin/unpin/toggle operation.
     *
     * @param previous
     * Pinned row state before the change.
     *
     * @param action
     * Public action name (`'pin'`, `'unpin'`, or `'toggle'`).
     *
     * @param rowId
     * Row identifier being acted on.
     *
     * @param nextAction
     * Resolved action to apply (`'pin'` or `'unpin'`).
     *
     * @param position
     * Target section for a pin action.
     *
     * @param index
     * Insertion index within the section for a pin action.
     */
    private createChangeEvent;
    /**
     * Fires events, applies a pin/unpin mutation, triggers a render, and
     * announces the change for accessibility.
     *
     * @param eventPayload
     * Pre-built event payload describing the change.
     *
     * @param applyChange
     * Callback that mutates the internal pin state.
     *
     * @param announcementAction
     * Whether to announce a pin or unpin for accessibility.
     *
     * @param announcementPosition
     * Section to include in the pin announcement.
     */
    private runRuntimeChange;
    /**
     * Invokes the user-configured event callback for a pin change event.
     *
     * @param eventName
     * Event name to look up in the pinning options.
     *
     * @param eventPayload
     * Event payload to pass to the callback.
     */
    private callEventCallback;
    /**
     * Sends an accessibility announcement for a completed pin/unpin change.
     *
     * @param action
     * Whether the row was pinned or unpinned.
     *
     * @param rowId
     * Row identifier that was changed.
     *
     * @param position
     * Section the row was pinned to (only relevant for pin actions).
     */
    private announceChange;
    /**
     * Prunes cached pinned row objects for rows that are no longer pinned.
     *
     * @param state
     * Explicit pinned state snapshot. When omitted, the current state is used.
     */
    private syncPinnedRowObjects;
    /**
     * Returns whether a row ID appears in the effective pinned row state.
     *
     * @param rowId
     * Row identifier to check.
     *
     * @param state
     * Pinned row state to check against. Defaults to the current state.
     */
    private isPinnedRowId;
    /**
     * Returns the row data object from a currently rendered viewport row.
     *
     * @param rowId
     * Row identifier to look up.
     */
    private getMaterializedRowObjectById;
    /**
     * Returns the row data object from the source data table by row ID.
     *
     * @param rowId
     * Row identifier to look up.
     *
     * @param dataTable
     * Source data table to search.
     *
     * @param idColumn
     * Column name used as the row identifier.
     *
     * @param sourceRowIndexesMap
     * Pre-built map from row ID to row index for `idColumn` lookups.
     */
    private getSourceRowObjectById;
    /**
     * Returns the numeric row index in the source data table for a given row
     * ID.
     *
     * @param rowId
     * Row identifier to resolve.
     *
     * @param dataTable
     * Source data table.
     *
     * @param idColumn
     * Column name used as the row identifier.
     *
     * @param sourceRowIndexesMap
     * Pre-built map from row ID to row index for `idColumn` lookups.
     */
    private getSourceRowIndexById;
    /**
     * Builds a map from row ID to row index by scanning `idColumn` in the
     * source data table.
     *
     * @param dataTable
     * Source data table to scan.
     *
     * @param idColumn
     * Column name whose values are the row identifiers.
     */
    private getSourceRowIndexesMap;
    /**
     * Returns whether the data source has enough information to confirm that a
     * row ID does not exist (as opposed to simply not being loaded yet).
     *
     * @param rowId
     * Row identifier to verify.
     *
     * @param dataTable
     * Source data table.
     *
     * @param idColumn
     * Column name used as the row identifier.
     *
     * @param sourceRowIndexesMap
     * Pre-built map from row ID to row index for `idColumn` lookups.
     */
    private canDeterminePinnedRowAbsence;
    /**
     * Deduplicates and resolves conflicts between top and bottom ID arrays,
     * giving priority to top.
     *
     * @param topIds
     * Candidate top-section row IDs.
     *
     * @param bottomIds
     * Candidate bottom-section row IDs.
     */
    private static normalizeSections;
    /**
     * Filters an array to unique, valid row IDs (strings and numbers only).
     *
     * @param values
     * Raw values to filter and deduplicate.
     */
    private static uniqueRowIds;
}
export default RowPinningController;
