import type Column from '../Core/Table/Column';
import type TableCell from '../Core/Table/Body/TableCell';
import type Grid from '../Core/Grid';
/**
 * Callback function to be called when a cell event is triggered.
 */
export type CellEventCallback = (this: TableCell) => void;
/**
 * Callback function to be called when a column event is triggered.
 */
export type ColumnEventCallback = (this: Column) => void;
/**
 * Callback function to be called when a grid event is triggered.
 */
export type GridEventCallback = (this: Grid, e: AnyRecord) => void;
/**
 * Events related to the cells.
 */
export interface CellEvents {
    /**
     * Callback function to be called when the cell is clicked.
     */
    click?: CellEventCallback;
    /**
     * Callback function to be called when the cell is double clicked.
     */
    dblClick?: CellEventCallback;
    /**
     * Callback function to be called when the cell is hovered.
     */
    mouseOver?: CellEventCallback;
    /**
     * Callback function to be called when the cell is no longer hovered.
     */
    mouseOut?: CellEventCallback;
    /**
     * Callback function to be called after the cell value is set (on init or
     * after editing).
     */
    afterRender?: CellEventCallback;
}
/**
 * Event callbacks option group related to the column.
 */
export interface ColumnEvents {
    /**
     * Callback function to be called when the column is filtered, after input
     * keypress or select change events, but before the filtering is applied.
     */
    beforeFilter?: ColumnEventCallback;
    /**
     * Callback function to be called when the column is filtered, after input
     * keypress or select change events, and the filtering is applied.
     */
    afterFilter?: ColumnEventCallback;
    /**
     * Callback function to be called when the column is sorted,
     * before clicking on header.
     */
    beforeSort?: ColumnEventCallback;
    /**
     * Callback function to be called when the column is sorted,
     * after clicking on header.
     */
    afterSort?: ColumnEventCallback;
    /**
     * Callback function to be called when the column is resized.
     */
    afterResize?: ColumnEventCallback;
}
export interface HeaderEvents {
    /**
     * Callback function to be called when the header is clicked.
     */
    click?: ColumnEventCallback;
    /**
     * Callback function to be called after the header is initialized.
     */
    afterRender?: ColumnEventCallback;
}
/**
 * Events options.
 */
export interface GridEvents {
    /**
     * Callback function to be called before the grid is loaded.
     */
    beforeLoad?: GridEventCallback;
    /**
     * Callback function to be called after the grid is loaded.
     */
    afterLoad?: GridEventCallback;
    /**
     * Callback function to be called before the grid options are updated.
     */
    beforeUpdate?: GridEventCallback;
    /**
     * Callback function to be called after the grid options are updated.
     */
    afterUpdate?: GridEventCallback;
    /**
     * Callback function to be called before the grid is redrawn after an
     * update.
     */
    beforeRedraw?: GridEventCallback;
    /**
     * Callback function to be called after the grid is redrawn after an
     * update.
     */
    afterRedraw?: GridEventCallback;
}
declare module '../Core/Options' {
    interface Options {
        /**
         * Events options triggered by the grid.
         */
        events?: GridEvents;
    }
    interface ColumnCellOptions {
        /**
         * Events options triggered by the grid elements.
         */
        events?: CellEvents;
    }
    interface ColumnOptions {
        /**
         * Events options triggered by the grid elements.
         */
        events?: ColumnEvents;
    }
    interface ColumnHeaderOptions {
        /**
         * Events options triggered by the grid elements.
         */
        events?: HeaderEvents;
    }
}
