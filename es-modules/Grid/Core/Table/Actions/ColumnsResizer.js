/* *
 *
 *  Grid Columns Resizer class.
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
 *
 *  Authors:
 *  - Dawid Draguła
 *  - Sebastian Bochan
 *
 * */
'use strict';
import GridUtils from '../../GridUtils.js';
import Globals from '../../Globals.js';
import { fireEvent } from '../../../../Shared/Utilities.js';
const { makeHTMLElement } = GridUtils;
/* *
 *
 *  Class
 *
 * */
/**
 * The class that handles the resizing of columns in the data grid.
 */
class ColumnsResizer {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(viewport) {
        /**
         * Any column is being resized. Turned off after slight delay.
         */
        this.isResizing = false;
        /**
         * The handles and their drag event listeners.
         */
        this.handles = [];
        /**
         * Handles the drag move event on the document.
         *
         * @param e
         * The drag event.
         *
         * @internal
         */
        this.onDocumentDragMove = (e) => {
            if (!this.draggedResizeHandle || !this.draggedColumn) {
                return;
            }
            /*
             * In iOS, a touchmove event with e.touches[0].pageX === 0 can fire
             * while holding the finger in place. Ignore it to avoid collapsing the
             * column to its minimum width.
             */
            if ('touches' in e && e.touches[0]?.pageX === 0) {
                return;
            }
            const pageX = ColumnsResizer.getPageX(e);
            if (pageX === void 0) {
                return;
            }
            ColumnsResizer.preventTouchDefault(e);
            const diff = pageX - (this.dragStartX || 0);
            const vp = this.viewport;
            vp.columnResizing.resize(this, diff);
            vp.reflow();
            fireEvent(this.draggedColumn, 'afterResize', {
                target: this.draggedColumn,
                originalEvent: e
            });
        };
        /**
         * Handles the drag end event on the document.
         */
        this.onDocumentDragEnd = () => {
            this.draggedColumn?.header?.htmlElement?.classList.remove(Globals.getClassName('resizedColumn'));
            if (!this.draggedResizeHandle?.matches(':hover')) {
                this.draggedResizeHandle?.classList.remove('hovered');
            }
            this.dragStartX = void 0;
            this.draggedColumn = void 0;
            this.draggedResizeHandle = void 0;
            this.columnStartWidth = void 0;
            this.nextColumnStartWidth = void 0;
            requestAnimationFrame(() => {
                this.isResizing = false;
            });
        };
        this.viewport = viewport;
        document.addEventListener('mousemove', this.onDocumentDragMove);
        document.addEventListener('mouseup', this.onDocumentDragEnd);
        document.addEventListener('touchmove', this.onDocumentDragMove, { passive: false });
        document.addEventListener('touchend', this.onDocumentDragEnd);
        document.addEventListener('touchcancel', this.onDocumentDragEnd);
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Render the drag handle for resizing columns.
     *
     * @param column
     * The reference to rendered column
     *
     * @param cell
     * The reference to rendered cell, where hadles should be added
     */
    renderColumnDragHandles(column, cell) {
        const vp = column.viewport;
        if (vp.columnsResizer) {
            const handle = makeHTMLElement('div', {
                className: Globals.getClassName('resizerHandles')
            }, cell.htmlElement);
            handle.setAttribute('aria-hidden', true);
            vp.columnsResizer?.addHandleListeners(handle, column);
        }
    }
    /**
     * Returns the page X coordinate for a mouse or touch event.
     *
     * @param e
     * The drag event.
     */
    static getPageX(e) {
        if ('touches' in e) {
            return e.touches[0]?.pageX ?? e.changedTouches[0]?.pageX;
        }
        return e.pageX;
    }
    /**
     * Prevents touch scrolling from interrupting column dragging.
     *
     * @param e
     * The drag event.
     */
    static preventTouchDefault(e) {
        if ('touches' in e && e.cancelable) {
            e.preventDefault();
        }
    }
    /**
     * Adds event listeners to the handle.
     *
     * @param handle
     * The handle element.
     *
     * @param column
     * The column the handle belongs to.
     */
    addHandleListeners(handle, column) {
        const onHandleMouseDown = (event) => {
            const e = event;
            const vp = column.viewport;
            const pageX = ColumnsResizer.getPageX(e);
            if (pageX === void 0) {
                return;
            }
            ColumnsResizer.preventTouchDefault(e);
            this.isResizing = true;
            handle.classList.add('hovered');
            vp.reflow();
            this.dragStartX = pageX;
            this.draggedColumn = column;
            this.draggedResizeHandle = handle;
            this.columnStartWidth = column.getWidth();
            this.nextColumnStartWidth =
                vp.columns[column.index + 1]?.getWidth();
            column.header?.htmlElement.classList.add(Globals.getClassName('resizedColumn'));
        };
        const onHandleMouseOver = () => {
            if (this.draggedResizeHandle) {
                return;
            }
            handle.classList.add('hovered');
        };
        const onHandleMouseOut = () => {
            if (this.draggedResizeHandle) {
                return;
            }
            handle.classList.remove('hovered');
        };
        const handleListeners = [{
                eventName: 'mousedown',
                listener: onHandleMouseDown
            }, {
                eventName: 'touchstart',
                listener: onHandleMouseDown
            }, {
                eventName: 'mouseover',
                listener: onHandleMouseOver
            }, {
                eventName: 'mouseout',
                listener: onHandleMouseOut
            }];
        for (const { eventName, listener } of handleListeners) {
            handle.addEventListener(eventName, listener);
        }
        this.handles.push([handle, handleListeners]);
    }
    /**
     * Removes all added event listeners from the document and handles. This
     * should be called on the destroy of the data grid.
     */
    removeEventListeners() {
        document.removeEventListener('mousemove', this.onDocumentDragMove);
        document.removeEventListener('mouseup', this.onDocumentDragEnd);
        document.removeEventListener('touchmove', this.onDocumentDragMove);
        document.removeEventListener('touchend', this.onDocumentDragEnd);
        document.removeEventListener('touchcancel', this.onDocumentDragEnd);
        for (let i = 0, iEnd = this.handles.length; i < iEnd; i++) {
            const [handle, listeners] = this.handles[i];
            for (const { eventName, listener } of listeners) {
                handle.removeEventListener(eventName, listener);
            }
        }
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default ColumnsResizer;
