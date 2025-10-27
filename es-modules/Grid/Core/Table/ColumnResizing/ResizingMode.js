/* *
 *
 *  Resizing Mode abstract class
 *
 *  (c) 2020-2025 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Dawid Dragula
 *
 * */
'use strict';
import U from '../../../../Core/Utilities.js';
const { getStyle, defined } = U;
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
        const minWidth = ResizingMode.getMinWidth(column);
        if (!defined(widthValue)) {
            const tbody = vp.tbodyElement;
            const freeWidth = tbody.getBoundingClientRect().width -
                this.calculateOccupiedWidth() -
                tbody.offsetWidth + tbody.clientWidth;
            const freeColumns = (vp.grid.enabledColumns?.length || 0) -
                Object.keys(this.columnWidths).length;
            // If undefined width:
            return Math.max(freeWidth / freeColumns, minWidth);
        }
        if (this.columnWidthUnits[column.id] === 0) {
            // If px:
            return widthValue;
        }
        // If %:
        return Math.max(vp.getWidthFromRatio(widthValue / 100), minWidth);
    }
    /**
     * Performs important calculations when the column is loaded.
     *
     * @param column
     * The column that is loaded.
     */
    loadColumn(column) {
        const rawWidth = column.options.width;
        if (!rawWidth) {
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
     * Recaulculates the changing dimentions of the table.
     */
    reflow() {
        const vp = this.viewport;
        let rowsWidth = 0;
        for (let i = 0, iEnd = vp.columns.length; i < iEnd; ++i) {
            rowsWidth += this.getColumnWidth(vp.columns[i]);
        }
        vp.rowsWidth = rowsWidth;
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
        const getElPaddings = (el) => ((getStyle(el, 'padding-left', true) || 0) +
            (getStyle(el, 'padding-right', true) || 0) +
            (getStyle(el, 'border-left', true) || 0) +
            (getStyle(el, 'border-right', true) || 0));
        let result = ResizingMode.MIN_COLUMN_WIDTH;
        if (tableColumnEl) {
            result = Math.max(result, getElPaddings(tableColumnEl));
        }
        if (headerColumnEl) {
            result = Math.max(result, getElPaddings(headerColumnEl));
        }
        return result;
    }
    /**
     * Calculates defined (px and %) widths of all columns with non-undefined
     * widths in the grid. Total in px.
     */
    calculateOccupiedWidth() {
        const vp = this.viewport;
        let occupiedWidth = 0;
        let unit, width;
        const columnIds = Object.keys(this.columnWidths);
        let columnId;
        for (let i = 0, iEnd = columnIds.length; i < iEnd; ++i) {
            columnId = columnIds[i];
            unit = this.columnWidthUnits[columnId];
            if (unit === 0) {
                occupiedWidth += this.columnWidths[columnId];
                continue;
            }
            width = this.columnWidths[columnId];
            occupiedWidth += vp.getWidthFromRatio(width / 100);
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
