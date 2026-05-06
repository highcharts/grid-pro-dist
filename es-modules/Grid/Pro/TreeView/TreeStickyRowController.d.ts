import type { RowId } from '../../Core/Data/DataProvider';
import type Table from '../../Core/Table/Table';
import type TableCell from '../../Core/Table/Body/TableCell';
import TableRow from '../../Core/Table/Body/TableRow.js';
declare class TreeStickyRowController {
    /**
     * The viewport table instance that owns the sticky rows.
     */
    private readonly viewport;
    /**
     * Row IDs currently rendered as sticky rows.
     */
    private activeRowIds;
    /**
     * Pending animation frame used to batch sticky row refreshes.
     */
    private animationFrameId?;
    /**
     * Whether sticky rows need reflow during the next refresh.
     */
    private needsRowReflow;
    /**
     * Whether sticky rows need synchronization during the next refresh.
     */
    private needsRowSync;
    /**
     * Refresh token used to discard stale async work.
     */
    private refreshToken;
    /**
     * Currently rendered sticky row instances.
     */
    private stickyRows;
    /**
     * Detached table body used to host sticky rows.
     */
    private stickyBodyElement?;
    /**
     * Whether the controller applied positioning to the table element.
     */
    private ownsTablePosition;
    /**
     * Constructs the sticky row controller.
     *
     * @param viewport
     * The viewport table instance.
     */
    constructor(viewport: Table);
    /**
     * Returns whether sticky parent rows are enabled.
     */
    get enabled(): boolean;
    /**
     * Destroys sticky rows and pending controller state.
     */
    destroy(): void;
    /**
     * Returns the rendered sticky row instances.
     */
    getRenderedStickyRows(): TableRow[];
    /**
     * Returns the total height of the rendered sticky rows.
     */
    getStickyRowsHeight(): number;
    /**
     * Returns the sticky body container element.
     */
    getStickyBodyElement(): HTMLTableSectionElement;
    /**
     * Returns whether an element belongs to the viewport body or sticky body.
     *
     * @param element
     * DOM element to resolve.
     */
    containsElement(element: Element): boolean;
    /**
     * Resolves a cell from either the viewport body or sticky body.
     *
     * @param element
     * Event target that originated within a table cell.
     */
    getCellFromElement(element: EventTarget | null): TableCell | undefined;
    /**
     * Returns a rendered row from either the sticky body or viewport body.
     *
     * @param rowId
     * Target row ID.
     */
    getRenderedRow(rowId: RowId): TableRow | undefined;
    /**
     * Returns a rendered sticky cell for the provided row and column index.
     *
     * @param rowIndex
     * Target row index in the projected row order.
     *
     * @param columnIndex
     * Target column index.
     */
    getRenderedStickyCell(rowIndex: number, columnIndex: number): TableCell | undefined;
    /**
     * Focuses a sticky cell when present, otherwise falls back to the viewport.
     *
     * @param rowIndex
     * Target row index in the projected row order.
     *
     * @param columnIndex
     * Target column index.
     */
    focusCellByRowIndex(rowIndex: number, columnIndex: number): void;
    /**
     * Updates sticky rows in response to viewport scrolling.
     */
    handleScroll(): void;
    /**
     * Schedules sticky row refresh on the next animation frame.
     *
     * @param syncRow
     * Whether sticky rows should be synchronized with source rows.
     *
     * @param reflowRow
     * Whether sticky rows should be reflowed after synchronization.
     */
    scheduleRefresh(syncRow?: boolean, reflowRow?: boolean): void;
    /**
     * Checks whether current sticky rows match the candidate row IDs.
     *
     * @param candidates
     * Sticky row candidates to compare with the current rendered state.
     */
    private areSameActiveRowIds;
    /**
     * Captures current table cell focus shared with the sticky overlay.
     */
    private captureFocusState;
    /**
     * Clears and destroys all rendered sticky rows.
     */
    private clearStickyRows;
    /**
     * Destroys the sticky body container and restores table positioning.
     */
    private destroyStickyBody;
    /**
     * Ensures the sticky body container exists and is attached.
     */
    private ensureStickyBody;
    /**
     * Synchronizes tbody-level classes that affect sticky row layout.
     *
     * @param stickyBodyElement
     * Sticky body hosting overlay rows.
     */
    private syncStickyBodyClasses;
    /**
     * Finds the first rendered row intersecting the given scroll position.
     *
     * @param visibleTop
     * Scroll position within the viewport body.
     *
     * @param projectionState
     * Current projection metadata for visible tree rows.
     */
    private findTopVisibleRow;
    /**
     * Returns the rendered or estimated height for a row.
     *
     * @param rowId
     * ID of the row to measure.
     */
    private getRowHeight;
    /**
     * Returns the height used for a sticky row candidate.
     *
     * @param candidate
     * Sticky row candidate to measure.
     */
    private getCandidateRowHeight;
    /**
     * Returns the rendered or estimated top position for a candidate row.
     *
     * @param candidate
     * Sticky row candidate to position.
     */
    private getCandidateRowTop;
    /**
     * Returns sticky row candidates for the current viewport state.
     */
    private getCurrentCandidates;
    /**
     * Builds the current sticky row stack from the projection state.
     *
     * @param projectionState
     * Current projection metadata for visible tree rows.
     */
    private getStackCandidates;
    /**
     * Returns the projected row index for a row ID.
     *
     * @param rowId
     * ID of the row to resolve.
     *
     * @param projectionState
     * Current projection metadata for visible tree rows.
     *
     * @param topVisibleRow
     * Currently resolved top visible row in the viewport.
     */
    private getProjectedRowIndex;
    /**
     * Returns the rendered top position of a viewport row.
     *
     * @param row
     * Rendered viewport row to position.
     */
    private getRowTop;
    /**
     * Returns the rendered viewport row for a row ID.
     *
     * @param rowId
     * ID of the row to resolve.
     */
    private getRenderedViewportRow;
    /**
     * Returns the rendered or estimated bottom position of a row.
     *
     * @param rowId
     * ID of the row to position.
     *
     * @param rowIndex
     * Projected row index used for virtual estimation.
     *
     * @param rowHeight
     * Optional row height hint used for virtual estimation.
     */
    private getRowBottom;
    /**
     * Checks whether the left candidates match the right candidate prefix.
     *
     * @param left
     * Currently active sticky row candidates.
     *
     * @param right
     * Candidate chain resolved for the current top row.
     */
    private hasMatchingCandidatePrefix;
    /**
     * Returns the expanded ancestor chain eligible for sticky rendering.
     *
     * @param topVisibleRow
     * Currently resolved top visible row in the viewport.
     *
     * @param projectionState
     * Current projection metadata for visible tree rows.
     */
    private getStickyCandidates;
    /**
     * Refreshes sticky rows using the current viewport state.
     */
    private refresh;
    /**
     * Positions rendered sticky rows within the sticky body.
     *
     * @param candidates
     * Sticky row candidates to position.
     */
    private positionStickyRows;
    /**
     * Syncs sticky row parity classes with the visual sticky stack order.
     *
     * @param candidates
     * Sticky row candidates rendered in the overlay.
     */
    private syncStickyRowParity;
    /**
     * Syncs sticky body height to the rendered bottom of the sticky row stack.
     */
    private syncStickyBodyRenderedHeight;
    /**
     * Returns the focused tree cell coordinates when focus is within the body
     * or sticky overlay.
     */
    private getActiveFocusedCellCoordinates;
    /**
     * Restores focus after sticky rows move between the body and overlay.
     *
     * @param focusState
     * Captured focus state from before the sticky row update.
     */
    private restoreFocusState;
    /**
     * Synchronizes rendered sticky rows with the current candidates.
     *
     * @param candidates
     * Sticky row candidates to synchronize.
     *
     * @param syncRow
     * Whether sticky rows should be synchronized with source rows.
     *
     * @param reflowRow
     * Whether sticky rows should be reflowed after synchronization.
     *
     * @param refreshToken
     * Refresh token used to discard stale async work.
     */
    private syncStickyRows;
    /**
     * Synchronizes sticky row DOM order without remounting unchanged rows.
     *
     * @param stickyRows
     * Sticky rows in the desired DOM order.
     *
     * @param stickyBodyElement
     * Sticky body hosting the rows.
     */
    private syncStickyRowOrder;
    /**
     * Returns whether the previously captured focus should be restored.
     *
     * @param focusState
     * Captured focus state from before the sticky row update.
     */
    private shouldRestoreFocusState;
    /**
     * Synchronizes sticky body position and dimensions with the viewport.
     *
     * @param syncDimensions
     * Whether sticky body dimensions should be recalculated.
     */
    private syncStickyBodyPosition;
}
export default TreeStickyRowController;
