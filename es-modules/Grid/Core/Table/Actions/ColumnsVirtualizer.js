/* *
 *
 *  Grid Columns Virtualizer class
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
import Globals from '../../Globals.js';
import { defined } from '../../../../Shared/Utilities.js';
/* *
 *
 *  Class
 *
 * */
/**
 * Handles horizontal column windowing.
 */
class ColumnsVirtualizer {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(viewport) {
        /**
         * First rendered column index.
         */
        this.columnCursor = 0;
        /**
         * Last rendered column index.
         */
        this.columnEnd = -1;
        /**
         * Flag indicating if a scroll update is queued for the next animation
         * frame.
         */
        this.scrollQueued = false;
        /**
         * Flag indicating if rendered columns are currently being updated.
         */
        this.isRendering = false;
        /**
         * Whether another update should run after the current one finishes.
         */
        this.pendingRender = false;
        const columnSettings = viewport.grid.options?.rendering?.columns || {};
        this.viewport = viewport;
        this.columnSettings = columnSettings;
        this.buffer = Math.max(columnSettings.bufferSize || 0, 0);
    }
    /* *
     *
     *  Methods
     *
     * */
    /**
     * Initializes the rendered column range.
     */
    initialize() {
        const viewport = this.viewport;
        viewport.virtualColumns = this.shouldVirtualizeColumns();
        viewport.tableElement.classList.toggle(Globals.getClassName('columnVirtualization'), viewport.virtualColumns);
        this.updateRange(true);
    }
    /**
     * Refreshes the rendered column range after layout changes.
     */
    refresh() {
        if (this.updateRange()) {
            void this.renderColumns();
        }
    }
    /**
     * Schedules horizontal virtualization work.
     */
    scroll() {
        if (this.scrollQueued) {
            return;
        }
        this.scrollQueued = true;
        requestAnimationFrame(() => {
            this.scrollQueued = false;
            if (this.updateRange()) {
                void this.renderColumns();
            }
        });
    }
    /**
     * Checks if columns virtualization should be enabled.
     */
    shouldVirtualizeColumns() {
        const { viewport } = this;
        const columns = viewport.grid.userOptions.rendering?.columns;
        if (defined(columns?.virtualization)) {
            return columns.virtualization;
        }
        const threshold = this.columnSettings.virtualizationThreshold ?? 20;
        return viewport.columns.length >= threshold;
    }
    /**
     * Updates the current rendered range.
     *
     * @param force
     * Whether to force assigning rendered columns.
     */
    updateRange(force = false) {
        const viewport = this.viewport;
        const columns = viewport.columns;
        let from = 0;
        let to = columns.length - 1;
        if (viewport.virtualColumns) {
            const [rangeFrom, rangeTo] = viewport.columnLayout.getVisibleRange(viewport.tbodyElement.scrollLeft, viewport.tbodyElement.clientWidth);
            from = Math.max(0, rangeFrom - this.buffer);
            to = Math.min(columns.length - 1, rangeTo + this.buffer);
        }
        if (!force && from === this.columnCursor && to === this.columnEnd) {
            return false;
        }
        this.columnCursor = from;
        this.columnEnd = to;
        viewport.renderedColumns = to >= from ?
            columns.slice(from, to + 1) :
            [];
        return true;
    }
    /**
     * Updates currently rendered cells and headers.
     */
    async renderColumns() {
        if (this.isRendering) {
            this.pendingRender = true;
            return;
        }
        this.isRendering = true;
        try {
            await this.viewport.updateRenderedColumns();
        }
        finally {
            this.isRendering = false;
            if (this.pendingRender) {
                this.pendingRender = false;
                if (this.updateRange()) {
                    await this.renderColumns();
                }
            }
        }
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default ColumnsVirtualizer;
