/* *
 *
 *  Resizing Mode abstract class
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  Integration of this software requires a license.
 *  - For commercial use, see www.highcharts.com/license
 *  - For non-commercial, see www.highcharts.com/license-eula
 *
 *
 *  Authors:
 *  - Dawid Draguła
 *
 * */
'use strict';
import { measureWidthOverhead } from '../../GridUtils.js';
import { clamp, defined } from '../../../../Shared/Utilities.js';
/* *
 *
 *  Class
 *
 * */
/**
 * Represents a column distribution strategy.
 */
class ResizingMode {
    /* *
    *
    *  Constructor
    *
    * */
    /**
     * Creates a new column distribution strategy.
     *
     * @param viewport
     * The table that the column distribution strategy is applied to.
     */
    constructor(viewport) {
        /**
         * The current widths values of the columns.
         */
        this.columnWidths = {};
        /**
         * Array of units for each column width value. Codified as:
         * - `0` - px
         * - `1` - %
         */
        this.columnWidthUnits = {};
        this.viewport = viewport;
    }
    /**
     * Returns the column's current width in pixels.
     *
     * @param column
     * The column to get the width for.
     *
     * @returns
     * The column's current width in pixels.
     */
    getColumnWidth(column) {
        const vp = this.viewport;
        const widthValue = this.columnWidths[column.id];
        if (!defined(widthValue)) {
            const cache = this.autoWidthCache ||
                this.calculateAutoWidthCache();
            // If undefined width:
            return ResizingMode.fitWidth(column, cache.freeWidth / Math.max(cache.freeColumns, 1));
        }
        if (this.columnWidthUnits[column.id] === 0) {
            // If px:
            return ResizingMode.fitWidth(column, widthValue);
        }
        // If %:
        return ResizingMode.fitWidth(column, vp.getWidthFromRatio(widthValue / 100));
    }
    /**
     * Performs important calculations when the column is loaded.
     *
     * @param column
     * The column that is loaded.
     */
    loadColumn(column) {
        const rawWidth = column.options.width;
        if (!defined(rawWidth) || rawWidth === 'auto') {
            delete this.columnWidths[column.id];
            delete this.columnWidthUnits[column.id];
            return;
        }
        let value;
        let unitCode = 0;
        if (typeof rawWidth === 'number') {
            value = rawWidth;
            unitCode = 0;
        }
        else {
            value = parseFloat(rawWidth);
            unitCode = rawWidth.charAt(rawWidth.length - 1) === '%' ? 1 : 0;
        }
        this.columnWidthUnits[column.id] = unitCode;
        this.columnWidths[column.id] = value;
    }
    /**
     * Loads the column to the distribution strategy. Should be called before
     * the table is rendered.
     */
    loadColumns() {
        const { columns } = this.viewport;
        for (let i = 0, iEnd = columns.length; i < iEnd; ++i) {
            this.loadColumn(columns[i]);
        }
    }
    /**
     * Recalculates the changing dimensions of the table.
     */
    reflow() {
        const vp = this.viewport;
        const columnCount = vp.grid.enabledColumns?.length || 0;
        const definedWidthCount = Object.keys(this.columnWidths).length;
        if (definedWidthCount < columnCount) {
            this.autoWidthCache = this.calculateAutoWidthCache(columnCount, definedWidthCount);
        }
        try {
            vp.columnLayout.reflow();
        }
        finally {
            delete this.autoWidthCache;
        }
        vp.rowsWidth = vp.columnLayout.totalWidth;
    }
    /* *
     *
     * Static Methods
     *
     * */
    /**
     * Returns the minimum width of the column.
     *
     * @param column
     * The column to get the minimum width for.
     *
     * @returns
     * The minimum width in pixels.
     */
    static getMinWidth(column) {
        const tableColumnEl = column.cells[0]?.htmlElement;
        const headerColumnEl = column.header?.htmlElement;
        const minWidth = ResizingMode.getOptionWidth(column, column.options.minWidth);
        // A cell cannot be rendered narrower than its paddings and borders.
        // When the column is outside of the rendered range (column
        // virtualization), they are measured on any rendered cell instead.
        const overhead = tableColumnEl || headerColumnEl ?
            Math.max(measureWidthOverhead(tableColumnEl), measureWidthOverhead(headerColumnEl)) :
            column.viewport.columnLayout.getCellWidthOverhead();
        return Math.max(ResizingMode.MIN_COLUMN_WIDTH, minWidth ?? 0, overhead);
    }
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
    static getOptionWidth(column, width) {
        if (!defined(width)) {
            return;
        }
        if (typeof width === 'number') {
            return width;
        }
        const value = parseFloat(width);
        if (width.endsWith('%')) {
            return column.viewport.getWidthFromRatio(value / 100);
        }
        return value;
    }
    /**
     * Returns the maximum width of the column.
     *
     * @param column
     * The column to get the maximum width for.
     *
     * @returns
     * The maximum width in pixels.
     */
    static getMaxWidth(column) {
        const maxWidth = ResizingMode.getOptionWidth(column, column.options.maxWidth);
        if (!defined(maxWidth)) {
            return;
        }
        return Math.max(maxWidth, ResizingMode.getMinWidth(column));
    }
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
    static fitWidth(column, width) {
        const minWidth = ResizingMode.getMinWidth(column);
        const maxWidth = ResizingMode.getMaxWidth(column);
        return clamp(width, minWidth, maxWidth ?? Number.POSITIVE_INFINITY);
    }
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
    calculateAutoWidthCache(columnCount = this.viewport.grid.enabledColumns?.length || 0, definedWidthCount = Object.keys(this.columnWidths).length) {
        const vp = this.viewport;
        const tbody = vp.tbodyElement;
        const freeWidth = tbody.getBoundingClientRect().width -
            this.calculateOccupiedWidth() -
            tbody.offsetWidth + tbody.clientWidth;
        return {
            freeColumns: columnCount - definedWidthCount,
            freeWidth
        };
    }
    /**
     * Calculates defined (px and %) widths of all columns with non-undefined
     * widths in the grid. Total in px.
     */
    calculateOccupiedWidth() {
        const vp = this.viewport;
        let occupiedWidth = 0;
        let unit, width;
        for (let i = 0, iEnd = vp.columns.length; i < iEnd; ++i) {
            const column = vp.columns[i];
            width = this.columnWidths[column.id];
            if (!defined(width)) {
                continue;
            }
            unit = this.columnWidthUnits[column.id];
            if (unit === 0) {
                occupiedWidth += ResizingMode.fitWidth(column, width);
                continue;
            }
            occupiedWidth += ResizingMode.fitWidth(column, vp.getWidthFromRatio(width / 100));
        }
        return occupiedWidth;
    }
}
/* *
*
*  Static Properties
*
* */
/**
 * The minimum width of a column.
 * @internal
 */
ResizingMode.MIN_COLUMN_WIDTH = 20;
/* *
 *
 *  Default Export
 *
 * */
export default ResizingMode;
