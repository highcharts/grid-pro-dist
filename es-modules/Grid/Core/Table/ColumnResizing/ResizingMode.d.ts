import type { ColumnResizingMode } from './ColumnResizing';
import type Table from '../Table';
import type Column from '../Column.js';
import type ColumnsResizer from '../Actions/ColumnsResizer';
/**
 * Represents a column distribution strategy.
 */
declare abstract class ResizingMode {
    /**
     * The type of the column distribution strategy.
     */
    abstract readonly type: ColumnResizingMode;
    /**
     * The table that the column distribution strategy is applied to.
     */
    readonly viewport: Table;
    /**
     * The current widths values of the columns.
     */
    columnWidths: Record<string, number>;
    /**
     * Array of units for each column width value. Codified as:
     * - `0` - px
     * - `1` - %
     */
    columnWidthUnits: Record<string, number>;
    /**
     * Whether the column distribution strategy is invalidated. This flag is
     * used to determine whether the column distribution strategy metadata
     * should be maintained when the table is destroyed and recreated.
     */
    invalidated?: boolean;
    /**
     * Whether the column distribution strategy is dirty. This flag is used to
     * determine whether the column widths should be re-loaded.
     */
    isDirty?: boolean;
    /**
     * Auto-width metrics reused during a single reflow.
     */
    private autoWidthCache?;
    /**
     * Creates a new column distribution strategy.
     *
     * @param viewport
     * The table that the column distribution strategy is applied to.
     */
    constructor(viewport: Table);
    /**
     * Resizes the column by the given diff of pixels.
     *
     * @param resizer
     * The columns resizer instance that is used to resize the column.
     *
     * @param diff
     * The X position difference in pixels.
     */
    abstract resize(resizer: ColumnsResizer, diff: number): void;
    /**
     * Returns the column's current width in pixels.
     *
     * @param column
     * The column to get the width for.
     *
     * @returns
     * The column's current width in pixels.
     */
    getColumnWidth(column: Column): number;
    /**
     * Performs important calculations when the column is loaded.
     *
     * @param column
     * The column that is loaded.
     */
    loadColumn(column: Column): void;
    /**
     * Loads the column to the distribution strategy. Should be called before
     * the table is rendered.
     */
    loadColumns(): void;
    /**
     * Recalculates the changing dimensions of the table.
     */
    reflow(): void;
    /**
     * Returns the minimum width of the column.
     *
     * @param column
     * The column to get the minimum width for.
     *
     * @returns
     * The minimum width in pixels.
     */
    protected static getMinWidth(column: Column): number;
    /**
     * Returns the configured width option in pixels.
     *
     * @param column
     * The column to resolve the width for.
     *
     * @param width
     * The width option to resolve.
     *
     * @returns
     * The width in pixels.
     */
    protected static getOptionWidth(column: Column, width?: number | string): number | undefined;
    /**
     * Returns the maximum width of the column.
     *
     * @param column
     * The column to get the maximum width for.
     *
     * @returns
     * The maximum width in pixels.
     */
    protected static getMaxWidth(column: Column): number | undefined;
    /**
     * Clamps the width to the column width constraints.
     *
     * @param column
     * The column to clamp the width for.
     *
     * @param width
     * The width in pixels.
     *
     * @returns
     * The clamped width in pixels.
     */
    protected static fitWidth(column: Column, width: number): number;
    /**
     * Calculates auto-width metrics for columns without configured widths.
     *
     * @param columnCount
     * The number of enabled columns.
     *
     * @param definedWidthCount
     * The number of columns with a configured width.
     *
     * @returns The auto-width calculation cache.
     */
    private calculateAutoWidthCache;
    /**
     * Calculates defined (px and %) widths of all columns with non-undefined
     * widths in the grid. Total in px.
     */
    private calculateOccupiedWidth;
}
export default ResizingMode;
