import type Column from '../Column';
import type Table from '../Table';
/**
 * Stores the horizontal grid layout used by rendering, resizing and
 * virtualization.
 */
declare class ColumnLayout {
    /**
     * The minimum width of a strict column.
     */
    private static readonly MIN_COLUMN_WIDTH;
    /**
     * The fallback width for strict column sizing.
     */
    private static readonly STRICT_COLUMN_WIDTH;
    /**
     * The table that owns the layout.
     */
    readonly viewport: Table;
    /**
     * Column widths in pixels, indexed by the column's global index.
     */
    private widths;
    /**
     * Column left offsets in pixels, indexed by the column's global index.
     */
    private offsets;
    /**
     * Total width of all columns.
     */
    totalWidth: number;
    /**
     * Single column width used when strict column widths are enabled.
     */
    private strictColumnWidth?;
    /**
     * Cached horizontal paddings and borders of a rendered cell.
     */
    private cellWidthOverhead?;
    constructor(viewport: Table);
    /**
     * Recalculates column widths and prefix offsets.
     */
    reflow(): void;
    /**
     * Returns the column width in pixels.
     *
     * @param column
     * The column to query.
     */
    getColumnWidth(column: Column): number;
    /**
     * Returns the column left offset in pixels.
     *
     * @param columnIndex
     * The global column index.
     */
    getColumnLeft(columnIndex: number): number;
    /**
     * Returns the column right offset in pixels.
     *
     * @param columnIndex
     * The global column index.
     */
    getColumnRight(columnIndex: number): number;
    /**
     * Returns the visible column range for a horizontal viewport.
     *
     * @param scrollLeft
     * The horizontal scroll position.
     *
     * @param viewportWidth
     * The visible viewport width.
     */
    getVisibleRange(scrollLeft: number, viewportWidth: number): [number, number];
    /**
     * Returns the fixed strict column width, with no per-column calculations.
     */
    getStrictColumnWidth(): number;
    /**
     * Returns the horizontal paddings and borders of a rendered cell, used as
     * the minimal width of the columns that are not rendered. A cell cannot be
     * rendered narrower than that, so the layout must not assign smaller
     * widths, or the header would drift away from the body.
     *
     * @returns
     * The overhead in pixels, or `0` when no cell is rendered yet.
     */
    getCellWidthOverhead(): number;
    /**
     * Finds the column at the provided horizontal offset.
     *
     * @param position
     * The horizontal offset in pixels.
     */
    private findColumnAt;
    /**
     * Clamps the width to option-based strict column width constraints.
     *
     * @param viewport
     * The table that the column layout is applied to.
     *
     * @param width
     * The width in pixels.
     *
     * @param minWidth
     * The minimum width option to resolve.
     *
     * @param maxWidth
     * The maximum width option to resolve.
     *
     * @returns
     * The clamped width in pixels.
     */
    private static fitStrictWidth;
    /**
     * Returns the configured width option in pixels.
     *
     * @param viewport
     * The table that the column layout is applied to.
     *
     * @param width
     * The width option to resolve.
     *
     * @returns
     * The width in pixels.
     */
    private static getViewportOptionWidth;
}
export default ColumnLayout;
