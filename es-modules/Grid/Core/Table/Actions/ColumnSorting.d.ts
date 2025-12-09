import type { ColumnSortingOrder } from '../../Options.js';
import Column from '../Column.js';
/**
 * Class that manages sorting for a dedicated column.
 */
declare class ColumnSorting {
    /**
     * The sorted column of the table.
     */
    column: Column;
    /**
     * The head element of the column.
     */
    headerCellElement: HTMLElement;
    /**
     * Constructs sorting for a dedicated column.
     *
     * @param column
     * The column that be sorted.
     *
     * @param headerCellElement
     * The head element of the column.
     */
    constructor(column: Column, headerCellElement: HTMLElement);
    /**
     * Adds attributes to the column header.
     */
    private addHeaderElementAttributes;
    /**
     * Updates the column options with the new sorting state.
     *
     * @param col
     * The column to update.
     */
    private updateColumnOptions;
    /**
     * Set sorting order for the column. It will modify the presentation data
     * and rerender the rows.
     *
     * @param order
     * The order of sorting. It can be `'asc'`, `'desc'` or `null` if the
     * sorting should be disabled.
     */
    setOrder(order: ColumnSortingOrder): Promise<void>;
    /**
     * Toggle sorting order for the column in the order: asc -> desc -> none
     */
    toggle: () => void;
}
export interface ColumnSortingEvent {
    target: Column;
    order: ColumnSortingOrder;
}
export default ColumnSorting;
