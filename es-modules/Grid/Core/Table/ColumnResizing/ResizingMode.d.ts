import type { ColumnResizingMode } from '../../Options';
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
     * Recaulculates the changing dimentions of the table.
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
     * Calculates defined (px and %) widths of all columns with non-undefined
     * widths in the grid. Total in px.
     */
    private calculateOccupiedWidth;
}
export default ResizingMode;
