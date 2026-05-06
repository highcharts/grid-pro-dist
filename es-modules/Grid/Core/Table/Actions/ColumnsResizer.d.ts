import Table from '../Table.js';
import Column from '../Column.js';
import Cell from '../Cell.js';
/**
 * The class that handles the resizing of columns in the data grid.
 */
declare class ColumnsResizer {
    /**
     * The viewport of the data grid.
     */
    private viewport;
    /**
     * Any column is being resized. Turned off after slight delay.
     */
    isResizing: boolean;
    /**
     * The start X position of the drag.
     */
    private dragStartX?;
    /**
     * The handles and their drag event listeners.
     */
    private handles;
    constructor(viewport: Table);
    /**
     * Render the drag handle for resizing columns.
     *
     * @param column
     * The reference to rendered column
     *
     * @param cell
     * The reference to rendered cell, where hadles should be added
     */
    renderColumnDragHandles(column: Column, cell: Cell): void;
    /**
     * Returns the page X coordinate for a mouse or touch event.
     *
     * @param e
     * The drag event.
     */
    private static getPageX;
    /**
     * Prevents touch scrolling from interrupting column dragging.
     *
     * @param e
     * The drag event.
     */
    private static preventTouchDefault;
    /**
     * Handles the drag end event on the document.
     */
    private onDocumentDragEnd;
    /**
     * Adds event listeners to the handle.
     *
     * @param handle
     * The handle element.
     *
     * @param column
     * The column the handle belongs to.
     */
    addHandleListeners(handle: HTMLElement, column: Column): void;
    /**
     * Removes all added event listeners from the document and handles. This
     * should be called on the destroy of the data grid.
     */
    removeEventListeners(): void;
}
export default ColumnsResizer;
