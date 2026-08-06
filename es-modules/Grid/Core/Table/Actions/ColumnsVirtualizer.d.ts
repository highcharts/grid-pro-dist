import type Table from '../Table';
/**
 * Handles horizontal column windowing.
 */
declare class ColumnsVirtualizer {
    /**
     * The viewport of the data grid.
     */
    readonly viewport: Table;
    /**
     * Size of the column buffer in columns.
     */
    readonly buffer: number;
    /**
     * First rendered column index.
     */
    columnCursor: number;
    /**
     * Last rendered column index.
     */
    columnEnd: number;
    /**
     * Flag indicating if a scroll update is queued for the next animation
     * frame.
     */
    private scrollQueued;
    /**
     * Flag indicating if rendered columns are currently being updated.
     */
    private isRendering;
    /**
     * Whether another update should run after the current one finishes.
     */
    private pendingRender;
    /**
     * Rendering column settings.
     */
    private readonly columnSettings;
    constructor(viewport: Table);
    /**
     * Initializes the rendered column range.
     */
    initialize(): void;
    /**
     * Refreshes the rendered column range after layout changes.
     */
    refresh(): void;
    /**
     * Schedules horizontal virtualization work.
     */
    scroll(): void;
    /**
     * Checks if columns virtualization should be enabled.
     */
    private shouldVirtualizeColumns;
    /**
     * Updates the current rendered range.
     *
     * @param force
     * Whether to force assigning rendered columns.
     */
    private updateRange;
    /**
     * Updates currently rendered cells and headers.
     */
    private renderColumns;
}
export default ColumnsVirtualizer;
