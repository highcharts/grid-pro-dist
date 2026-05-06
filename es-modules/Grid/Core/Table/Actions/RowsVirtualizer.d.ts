import type { RowsSettings } from '../../Options';
import Table from '../Table.js';
/**
 * Represents a virtualized rows renderer for the data grid.
 */
declare class RowsVirtualizer {
    /**
     * The default height of a row.
     */
    defaultRowHeight: number;
    /**
     * The index of the first visible row.
     */
    rowCursor: number;
    /**
     * The viewport (table) of the data grid.
     */
    readonly viewport: Table;
    /**
     * Size of the row buffer - how many rows should be rendered outside of the
     * viewport from the top and the bottom.
     */
    readonly buffer: number;
    /**
     * Flag indicating if the rows should have strict heights (no custom or
     * dynamic heights allowed).
     */
    private readonly strictRowHeights;
    /**
     * Flag indicating if the scrolling handler should be prevented to avoid
     * flickering loops when scrolling to the last row.
     */
    private preventScroll;
    /**
     * Rendering row settings.
     */
    rowSettings?: RowsSettings;
    /**
     * Cached max element height in CSS pixels.
     */
    private static maxElementHeight?;
    /**
     * The maximum height of a HTML element in most browsers.
     * Firefox has a lower limit than other browsers.
     */
    private static getMaxElementHeight;
    /**
     * The maximum height of the scrollable element in CSS pixels.
     */
    private maxElementHeight;
    /**
     * The total height of the grid, used when the Grid height
     * exceeds the max element height.
     */
    private totalGridHeight;
    /**
     * The overflow height of the grid, used when the Grid height
     * exceeds the max element height.
     */
    private gridHeightOverflow;
    /**
     * The scroll offset in pixels used to adjust the row positions when
     * the Grid height exceeds the max element height.
     */
    private scrollOffset;
    /**
     * Reuse pool for rows that are currently out of viewport.
     */
    private readonly rowPool;
    /**
     * Maximum number of rows to keep in the reuse pool.
     */
    private static readonly MAX_POOL_SIZE;
    /**
     * Flag indicating if a scroll update is queued for the next animation
     * frame.
     */
    private scrollQueued;
    /**
     * Flag indicating if rows are currently being rendered to prevent
     * concurrent render operations.
     */
    private isRendering;
    /**
     * Pending row cursor to render after current render completes.
     * Used to ensure the final scroll position is rendered.
     */
    private pendingRowCursor;
    /**
     * Constructs an instance of the rows virtualizer.
     *
     * @param viewport
     * The viewport of the data grid to render rows in.
     */
    constructor(viewport: Table);
    /**
     * Renders the rows in the viewport for the first time.
     */
    initialRender(): Promise<void>;
    /**
     * Renders the rows in the viewport. It is called when the rows need to be
     * re-rendered, e.g., after a sort or filter operation.
     */
    rerender(): Promise<void>;
    /**
     * Refreshes the rendered rows without a full teardown.
     * It updates the row range and reuses existing rows when possible.
     */
    refreshRows(): Promise<void>;
    /**
     * Method called on the viewport scroll event, only when the virtualization
     * is enabled.
     */
    scroll(): void;
    /**
     * Applies the scroll logic for virtualized rows.
     */
    private applyScroll;
    /**
     * Adjusts the visible row heights from the bottom of the viewport.
     */
    private adjustBottomRowHeights;
    /**
     * Renders rows in the specified range. Removes rows that are out of the
     * range except the last row.
     *
     * @param rowCursor
     * The index of the first visible row.
     */
    private renderRows;
    /**
     * Adjusts the heights of the rows based on the current scroll position.
     * It handles the possibility of the rows having different heights than
     * the default height.
     */
    adjustRowHeights(): void;
    /**
     * Reflow the rendered rows content dimensions.
     */
    reflowRows(): void;
    /**
     * Estimates the current top offset of a row in the virtualized scroll
     * space, accounting for the active scroll compression offset.
     *
     * @param index
     * The row index in the projected data order.
     *
     * @returns
     * The estimated top offset in pixels.
     */
    getEstimatedRowTop(index: number): number;
    /**
     * Estimates the current bottom offset of a row in the virtualized scroll
     * space.
     *
     * @param index
     * The row index in the projected data order.
     *
     * @param rowHeight
     * The height of the row.
     *
     * @returns
     * The estimated bottom offset in pixels.
     */
    getEstimatedRowBottom(index: number, rowHeight?: number): number;
    /**
     * Measures the height of the first rendered row's first cell.
     *
     * @returns
     * The measured row height or undefined if it cannot be measured.
     */
    measureRenderedRowHeight(): number | undefined;
    /**
     * Applies a newly measured row height and refreshes related metrics.
     *
     * @param measuredHeight
     * The measured row height in pixels.
     *
     * @returns
     * Whether the default row height changed.
     */
    applyMeasuredRowHeight(measuredHeight: number): boolean;
    /**
     * Gets a row from the pool or creates a new one for the given index.
     *
     * @param index
     * The row index in the data table.
     *
     * @returns
     * A TableRow instance ready for use.
     */
    private getOrCreateRow;
    /**
     * Adds a row to the reuse pool, or destroys it if the pool is full.
     *
     * @param row
     * The row to pool.
     */
    private poolRow;
    /**
     * Returns the default height of a row. This method should be called only
     * once on initialization.
     *
     * @returns
     * The default height of a row.
     */
    private getDefaultRowHeight;
    /**
     * Updates cached row count and derived grid height metrics used for
     * overflow-aware scrolling.
     */
    private updateGridMetrics;
    /**
     * Updates row translate offsets based on scroll scaling. When the grid
     * exceeds the max element height, it keeps the bottom rows aligned to the
     * maximum scrollable height.
     */
    private adjustRowOffsets;
}
export default RowsVirtualizer;
