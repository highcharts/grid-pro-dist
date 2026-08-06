/* *
 *
 *  Grid Column Layout class
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
 * Stores the horizontal grid layout used by rendering, resizing and
 * virtualization.
 */
class ColumnLayout {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(viewport) {
        /**
         * Column widths in pixels, indexed by the column's global index.
         */
        this.widths = [];
        /**
         * Column left offsets in pixels, indexed by the column's global index.
         */
        this.offsets = [];
        /**
         * Total width of all columns.
         */
        this.totalWidth = 0;
        this.viewport = viewport;
    }
    /* *
     *
     *  Methods
     *
     * */
    /**
     * Recalculates column widths and prefix offsets.
     */
    reflow() {
        const { columns, columnResizing } = this.viewport;
        const widths = this.widths;
        const offsets = this.offsets;
        delete this.cellWidthOverhead;
        if (this.viewport.grid.options?.rendering?.columns?.strictWidths) {
            const width = this.strictColumnWidth =
                this.getStrictColumnWidth();
            widths.length = 0;
            offsets.length = 0;
            this.totalWidth = columns.length * width;
            return;
        }
        delete this.strictColumnWidth;
        if (!columnResizing) {
            return;
        }
        widths.length = columns.length;
        offsets.length = columns.length;
        let left = 0;
        for (let i = 0, iEnd = columns.length; i < iEnd; ++i) {
            const width = columnResizing.getColumnWidth(columns[i]);
            offsets[i] = left;
            widths[i] = width;
            left += width;
        }
        this.totalWidth = left;
    }
    /**
     * Returns the column width in pixels.
     *
     * @param column
     * The column to query.
     */
    getColumnWidth(column) {
        if (defined(this.strictColumnWidth)) {
            return this.strictColumnWidth;
        }
        if (this.viewport.grid.options?.rendering?.columns?.strictWidths) {
            return this.getStrictColumnWidth();
        }
        return this.widths[column.index] ??
            this.viewport.columnResizing?.getColumnWidth(column) ??
            0;
    }
    /**
     * Returns the column left offset in pixels.
     *
     * @param columnIndex
     * The global column index.
     */
    getColumnLeft(columnIndex) {
        if (defined(this.strictColumnWidth)) {
            return columnIndex * this.strictColumnWidth;
        }
        return this.offsets[columnIndex] ?? 0;
    }
    /**
     * Returns the column right offset in pixels.
     *
     * @param columnIndex
     * The global column index.
     */
    getColumnRight(columnIndex) {
        if (defined(this.strictColumnWidth)) {
            return (columnIndex + 1) * this.strictColumnWidth;
        }
        return this.getColumnLeft(columnIndex) +
            (this.widths[columnIndex] || 0);
    }
    /**
     * Returns the visible column range for a horizontal viewport.
     *
     * @param scrollLeft
     * The horizontal scroll position.
     *
     * @param viewportWidth
     * The visible viewport width.
     */
    getVisibleRange(scrollLeft, viewportWidth) {
        const { columns } = this.viewport;
        const columnCount = columns.length;
        if (!columnCount) {
            return [0, -1];
        }
        const visibleLeft = Math.max(scrollLeft, 0);
        const visibleRight = visibleLeft + Math.max(viewportWidth, 0);
        if (defined(this.strictColumnWidth)) {
            const columnWidth = this.strictColumnWidth;
            const from = Math.max(0, Math.min(Math.floor(visibleLeft / columnWidth), columnCount - 1));
            const to = Math.max(from, Math.min(Math.floor(visibleRight / columnWidth), columnCount - 1));
            return [from, to];
        }
        const from = Math.max(0, Math.min(this.findColumnAt(visibleLeft), columnCount - 1));
        const to = Math.max(from, Math.min(this.findColumnAt(visibleRight), columnCount - 1));
        return [from, to];
    }
    /**
     * Returns the fixed strict column width, with no per-column calculations.
     */
    getStrictColumnWidth() {
        const columnDefaults = this.viewport.grid.options?.columnDefaults;
        const width = ColumnLayout.getViewportOptionWidth(this.viewport, columnDefaults?.width) ?? ColumnLayout.STRICT_COLUMN_WIDTH;
        return ColumnLayout.fitStrictWidth(this.viewport, width, columnDefaults?.minWidth, columnDefaults?.maxWidth);
    }
    /**
     * Returns the horizontal paddings and borders of a rendered cell, used as
     * the minimal width of the columns that are not rendered. A cell cannot be
     * rendered narrower than that, so the layout must not assign smaller
     * widths, or the header would drift away from the body.
     *
     * @returns
     * The overhead in pixels, or `0` when no cell is rendered yet.
     */
    getCellWidthOverhead() {
        if (defined(this.cellWidthOverhead)) {
            return this.cellWidthOverhead;
        }
        const column = this.viewport.getRenderedColumns()[0];
        const overhead = Math.max(measureWidthOverhead(column?.cells[0]?.htmlElement), measureWidthOverhead(column?.header?.htmlElement));
        // Do not cache the fallback used before the first cell is rendered.
        if (overhead) {
            this.cellWidthOverhead = overhead;
        }
        return overhead;
    }
    /**
     * Finds the column at the provided horizontal offset.
     *
     * @param position
     * The horizontal offset in pixels.
     */
    findColumnAt(position) {
        const offsets = this.offsets;
        let low = 0;
        let high = offsets.length - 1;
        let result = 0;
        while (low <= high) {
            const mid = (low + high) >> 1;
            if (offsets[mid] <= position) {
                result = mid;
                low = mid + 1;
            }
            else {
                high = mid - 1;
            }
        }
        return result;
    }
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
    static fitStrictWidth(viewport, width, minWidth, maxWidth) {
        const min = Math.max(ColumnLayout.MIN_COLUMN_WIDTH, viewport.columnLayout.getCellWidthOverhead(), ColumnLayout.getViewportOptionWidth(viewport, minWidth) ?? 0);
        const max = ColumnLayout.getViewportOptionWidth(viewport, maxWidth);
        return clamp(width, min, max ?? Number.POSITIVE_INFINITY);
    }
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
    static getViewportOptionWidth(viewport, width) {
        if (!defined(width) || width === 'auto') {
            return;
        }
        if (typeof width === 'number') {
            return width;
        }
        const value = parseFloat(width);
        if (width.endsWith('%')) {
            return viewport.getWidthFromRatio(value / 100);
        }
        return value;
    }
}
/* *
*
*  Static Properties
*
* */
/**
 * The minimum width of a strict column.
 */
ColumnLayout.MIN_COLUMN_WIDTH = 20;
/**
 * The fallback width for strict column sizing.
 */
ColumnLayout.STRICT_COLUMN_WIDTH = 100;
/* *
 *
 *  Default Export
 *
 * */
export default ColumnLayout;
