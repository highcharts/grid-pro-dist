/* *
 *
 *  Grid Tree Sticky Row Controller
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 * */
'use strict';
import TableRow from '../../Core/Table/Body/TableRow.js';
import Globals from '../../Core/Globals.js';
import TreeViewGlobals from './TreeViewGlobals.js';
import { defined } from '../../../Shared/Utilities.js';
const rowsContentNowrapClassName = Globals.getClassName('rowsContentNowrap');
const rowEvenClassName = Globals.getClassName('rowEven');
const rowOddClassName = Globals.getClassName('rowOdd');
const maxStickyRows = 10;
/* *
 *
 *  Class
 *
 * */
class TreeStickyRowController {
    /* *
     *
     *  Constructor
     *
     * */
    /**
     * Constructs the sticky row controller.
     *
     * @param viewport
     * The viewport table instance.
     */
    constructor(viewport) {
        /**
         * Row IDs currently rendered as sticky rows.
         */
        this.activeRowIds = [];
        /**
         * Whether sticky rows need reflow during the next refresh.
         */
        this.needsRowReflow = false;
        /**
         * Whether sticky rows need synchronization during the next refresh.
         */
        this.needsRowSync = false;
        /**
         * Refresh token used to discard stale async work.
         */
        this.refreshToken = 0;
        /**
         * Currently rendered sticky row instances.
         */
        this.stickyRows = [];
        /**
         * Whether the controller applied positioning to the table element.
         */
        this.ownsTablePosition = false;
        this.viewport = viewport;
    }
    /* *
     *
     *  Methods
     *
     * */
    /**
     * Returns whether sticky parent rows are enabled.
     */
    get enabled() {
        return !!this.viewport.grid.treeView?.options?.stickyParents;
    }
    /**
     * Destroys sticky rows and pending controller state.
     */
    destroy() {
        if (typeof this.animationFrameId === 'number') {
            cancelAnimationFrame(this.animationFrameId);
            delete this.animationFrameId;
        }
        this.clearStickyRows();
        this.destroyStickyBody();
    }
    /**
     * Returns the rendered sticky row instances.
     */
    getRenderedStickyRows() {
        if (!this.enabled) {
            return [];
        }
        return this.stickyRows;
    }
    /**
     * Returns the total height of the rendered sticky rows.
     */
    getStickyRowsHeight() {
        if (!this.enabled) {
            return 0;
        }
        return this.stickyRows.reduce((height, row) => height + (row.htmlElement.offsetHeight ||
            this.viewport.rowsVirtualizer.defaultRowHeight), 0);
    }
    /**
     * Returns the sticky body container element.
     */
    getStickyBodyElement() {
        return this.ensureStickyBody();
    }
    /**
     * Returns whether an element belongs to the viewport body or sticky body.
     *
     * @param element
     * DOM element to resolve.
     */
    containsElement(element) {
        return this.viewport.tbodyElement.contains(element) ||
            this.ensureStickyBody().contains(element);
    }
    /**
     * Resolves a cell from either the viewport body or sticky body.
     *
     * @param element
     * Event target that originated within a table cell.
     */
    getCellFromElement(element) {
        if (!(element instanceof Element)) {
            return;
        }
        const td = element.closest('td');
        if (!td) {
            return;
        }
        const tr = td.parentElement;
        if (!tr) {
            return;
        }
        const stickyRow = this.getRenderedStickyRows().find((row) => row.htmlElement === tr);
        if (stickyRow) {
            const cellIndex = Array.prototype.indexOf.call(tr.children, td);
            return stickyRow.cells[cellIndex];
        }
        return this.viewport.getCellFromElement(element);
    }
    /**
     * Returns a rendered row from either the sticky body or viewport body.
     *
     * @param rowId
     * Target row ID.
     */
    getRenderedRow(rowId) {
        return this.getRenderedStickyRows().find((row) => row.id === rowId) || this.viewport.getRow(rowId);
    }
    /**
     * Returns a rendered sticky cell for the provided row and column index.
     *
     * @param rowIndex
     * Target row index in the projected row order.
     *
     * @param columnIndex
     * Target column index.
     */
    getRenderedStickyCell(rowIndex, columnIndex) {
        const stickyRow = this.getRenderedStickyRows().find((row) => row.index === rowIndex);
        return stickyRow?.cells[columnIndex];
    }
    /**
     * Focuses a sticky cell when present, otherwise falls back to the viewport.
     *
     * @param rowIndex
     * Target row index in the projected row order.
     *
     * @param columnIndex
     * Target column index.
     */
    focusCellByRowIndex(rowIndex, columnIndex) {
        if (columnIndex < 0 ||
            columnIndex >= this.viewport.columns.length) {
            return;
        }
        const stickyCell = this.getRenderedStickyCell(rowIndex, columnIndex);
        if (stickyCell) {
            delete this.viewport.pendingFocusCursor;
            stickyCell.htmlElement.focus({
                preventScroll: true
            });
            return;
        }
        this.viewport.focusCellByRowIndex(rowIndex, columnIndex);
    }
    /**
     * Updates sticky rows in response to viewport scrolling.
     */
    handleScroll() {
        const focusState = this.captureFocusState();
        if (!this.enabled) {
            this.clearStickyRows();
            this.restoreFocusState(focusState);
            return;
        }
        const candidates = this.getCurrentCandidates();
        if (!candidates.length) {
            this.clearStickyRows();
            this.restoreFocusState(focusState);
            return;
        }
        if (this.stickyRows.length === candidates.length &&
            this.areSameActiveRowIds(candidates)) {
            this.positionStickyRows(candidates);
            this.restoreFocusState(focusState);
            return;
        }
        this.scheduleRefresh();
    }
    /**
     * Schedules sticky row refresh on the next animation frame.
     *
     * @param syncRow
     * Whether sticky rows should be synchronized with source rows.
     *
     * @param reflowRow
     * Whether sticky rows should be reflowed after synchronization.
     */
    scheduleRefresh(syncRow = false, reflowRow = false) {
        if (!this.enabled) {
            const focusState = this.captureFocusState();
            if (typeof this.animationFrameId === 'number') {
                cancelAnimationFrame(this.animationFrameId);
                delete this.animationFrameId;
            }
            this.needsRowSync = false;
            this.needsRowReflow = false;
            this.clearStickyRows();
            this.restoreFocusState(focusState);
            return;
        }
        this.needsRowSync = this.needsRowSync || syncRow;
        this.needsRowReflow = this.needsRowReflow || reflowRow;
        if (typeof this.animationFrameId === 'number') {
            return;
        }
        this.animationFrameId = requestAnimationFrame(() => {
            delete this.animationFrameId;
            void this.refresh();
        });
    }
    /**
     * Checks whether current sticky rows match the candidate row IDs.
     *
     * @param candidates
     * Sticky row candidates to compare with the current rendered state.
     */
    areSameActiveRowIds(candidates) {
        if (this.activeRowIds.length !== candidates.length) {
            return false;
        }
        for (let i = 0, iEnd = candidates.length; i < iEnd; ++i) {
            if (this.activeRowIds[i] !== candidates[i].rowId) {
                return false;
            }
        }
        return true;
    }
    /**
     * Captures current table cell focus shared with the sticky overlay.
     */
    captureFocusState() {
        const focusCursor = this.viewport.focusCursor;
        const activeElement = document.activeElement;
        if (!focusCursor ||
            focusCursor.bodySectionId ||
            !(activeElement instanceof HTMLTableCellElement)) {
            return;
        }
        const inStickyBody = !!(this.stickyBodyElement?.contains(activeElement));
        if (!inStickyBody &&
            !this.viewport.tbodyElement.contains(activeElement)) {
            return;
        }
        const activeCellCoordinates = this.getActiveFocusedCellCoordinates();
        if (!activeCellCoordinates) {
            return;
        }
        return {
            columnIndex: activeCellCoordinates.columnIndex,
            inStickyBody,
            rowId: focusCursor.rowId,
            rowIndex: activeCellCoordinates.rowIndex,
            sourceElement: activeElement
        };
    }
    /**
     * Clears and destroys all rendered sticky rows.
     */
    clearStickyRows() {
        ++this.refreshToken;
        this.activeRowIds.length = 0;
        if (this.stickyBodyElement) {
            this.stickyBodyElement.style.height = '0';
            this.syncStickyBodyClasses(this.stickyBodyElement);
        }
        if (!this.stickyRows.length) {
            return;
        }
        for (let i = 0, iEnd = this.stickyRows.length; i < iEnd; ++i) {
            this.stickyRows[i].destroy();
        }
        this.stickyRows.length = 0;
    }
    /**
     * Destroys the sticky body container and restores table positioning.
     */
    destroyStickyBody() {
        if (this.stickyBodyElement) {
            this.stickyBodyElement.remove();
            delete this.stickyBodyElement;
        }
        if (this.ownsTablePosition) {
            this.viewport.tableElement.style.position = '';
            this.ownsTablePosition = false;
        }
    }
    /**
     * Ensures the sticky body container exists and is attached.
     */
    ensureStickyBody() {
        let stickyBodyElement = this.stickyBodyElement;
        if (stickyBodyElement?.isConnected) {
            this.syncStickyBodyClasses(stickyBodyElement);
            return stickyBodyElement;
        }
        stickyBodyElement = document.createElement('tbody');
        stickyBodyElement.className = TreeViewGlobals.classNames.tbodySticky;
        this.viewport.tableElement.insertBefore(stickyBodyElement, this.viewport.tbodyElement);
        this.stickyBodyElement = stickyBodyElement;
        if (!this.viewport.tableElement.style.position ||
            this.viewport.tableElement.style.position === 'static') {
            this.viewport.tableElement.style.position = 'relative';
            this.ownsTablePosition = true;
        }
        this.syncStickyBodyClasses(stickyBodyElement);
        return stickyBodyElement;
    }
    /**
     * Synchronizes tbody-level classes that affect sticky row layout.
     *
     * @param stickyBodyElement
     * Sticky body hosting overlay rows.
     */
    syncStickyBodyClasses(stickyBodyElement) {
        stickyBodyElement.classList.toggle(TreeViewGlobals.classNames.tbodyStickyActive, this.activeRowIds.length > 0);
        stickyBodyElement.classList.toggle(rowsContentNowrapClassName, this.viewport.tbodyElement.classList.contains(rowsContentNowrapClassName));
    }
    /**
     * Finds the first rendered row intersecting the given scroll position.
     *
     * @param visibleTop
     * Scroll position within the viewport body.
     *
     * @param projectionState
     * Current projection metadata for visible tree rows.
     */
    findTopVisibleRow(visibleTop, projectionState) {
        const { rows } = this.viewport;
        const rowsLength = rows.length;
        if (!rowsLength) {
            return;
        }
        for (let i = 0; i < rowsLength; ++i) {
            const row = rows[i];
            const rowTop = this.getRowTop(row);
            const rowBottom = rowTop + row.htmlElement.offsetHeight;
            if (rowBottom > visibleTop) {
                return row;
            }
        }
        if (!this.viewport.virtualRows) {
            return rows[rowsLength - 1];
        }
        const firstRow = rows[0];
        const lastRow = rows[rowsLength - 1];
        const firstRowTop = this.getRowTop(firstRow);
        const lastRowBottom = (this.getRowTop(lastRow) +
            lastRow.htmlElement.offsetHeight);
        const rowHeight = this.viewport.rowsVirtualizer.defaultRowHeight;
        let estimatedRowIndex = lastRow.index;
        if (visibleTop < firstRowTop) {
            estimatedRowIndex = firstRow.index - Math.ceil((firstRowTop - visibleTop) / rowHeight);
        }
        else if (visibleTop >= lastRowBottom) {
            estimatedRowIndex = lastRow.index + Math.floor((visibleTop - lastRowBottom) / rowHeight) + 1;
        }
        estimatedRowIndex = Math.max(0, Math.min(estimatedRowIndex, projectionState.rowIds.length - 1));
        return {
            id: projectionState.rowIds[estimatedRowIndex],
            index: estimatedRowIndex
        };
    }
    /**
     * Returns the rendered or estimated height for a row.
     *
     * @param rowId
     * ID of the row to measure.
     */
    getRowHeight(rowId) {
        const renderedRow = this.getRenderedViewportRow(rowId);
        if (renderedRow?.htmlElement.offsetHeight) {
            return renderedRow.htmlElement.offsetHeight;
        }
        for (let i = 0, iEnd = this.stickyRows.length; i < iEnd; ++i) {
            if (this.stickyRows[i].id === rowId) {
                return (this.stickyRows[i].htmlElement.offsetHeight ||
                    this.viewport.rowsVirtualizer.defaultRowHeight);
            }
        }
    }
    /**
     * Returns the height used for a sticky row candidate.
     *
     * @param candidate
     * Sticky row candidate to measure.
     */
    getCandidateRowHeight(candidate) {
        return this.getRowHeight(candidate.rowId) ||
            this.viewport.rowsVirtualizer.defaultRowHeight;
    }
    /**
     * Returns the rendered or estimated top position for a candidate row.
     *
     * @param candidate
     * Sticky row candidate to position.
     */
    getCandidateRowTop(candidate) {
        const renderedRow = this.getRenderedViewportRow(candidate.rowId);
        if (renderedRow) {
            return this.getRowTop(renderedRow);
        }
        if (this.viewport.virtualRows) {
            return this.viewport.rowsVirtualizer.getEstimatedRowTop(candidate.rowIndex);
        }
    }
    /**
     * Returns sticky row candidates for the current viewport state.
     */
    getCurrentCandidates() {
        const projectionState = this.viewport.grid.treeView
            ?.getProjectionState();
        if (!this.enabled ||
            !projectionState ||
            !this.viewport.tbodyElement.isConnected ||
            this.viewport.tbodyElement.clientHeight <= 0) {
            return [];
        }
        return this.getStackCandidates(projectionState);
    }
    /**
     * Builds the current sticky row stack from the projection state.
     *
     * @param projectionState
     * Current projection metadata for visible tree rows.
     */
    getStackCandidates(projectionState) {
        const activeCandidates = [];
        let slotTop = this.viewport.tbodyElement.scrollTop;
        for (let i = 0; i < maxStickyRows; ++i) {
            const topVisibleRow = this.findTopVisibleRow(slotTop, projectionState);
            if (!topVisibleRow ||
                typeof topVisibleRow.id === 'undefined') {
                break;
            }
            const candidatePath = this.getStickyCandidates(topVisibleRow, projectionState);
            if (!this.hasMatchingCandidatePrefix(activeCandidates, candidatePath)) {
                break;
            }
            const candidate = candidatePath[activeCandidates.length];
            if (!candidate) {
                break;
            }
            const rowTop = this.getCandidateRowTop(candidate);
            if (!defined(rowTop) || rowTop >= slotTop) {
                break;
            }
            activeCandidates.push(candidate);
            slotTop += this.getCandidateRowHeight(candidate);
        }
        return activeCandidates;
    }
    /**
     * Returns the projected row index for a row ID.
     *
     * @param rowId
     * ID of the row to resolve.
     *
     * @param projectionState
     * Current projection metadata for visible tree rows.
     *
     * @param topVisibleRow
     * Currently resolved top visible row in the viewport.
     */
    getProjectedRowIndex(rowId, projectionState, topVisibleRow) {
        if (topVisibleRow.id === rowId) {
            return topVisibleRow.index;
        }
        const renderedRow = this.viewport.getRow(rowId);
        if (renderedRow) {
            return renderedRow.index;
        }
        const projectedRowIndex = projectionState.rowIds.indexOf(rowId);
        if (projectedRowIndex > -1) {
            return projectedRowIndex;
        }
    }
    /**
     * Returns the rendered top position of a viewport row.
     *
     * @param row
     * Rendered viewport row to position.
     */
    getRowTop(row) {
        if (this.viewport.virtualRows) {
            return row.translateY;
        }
        const { tbodyElement } = this.viewport;
        const rowRect = row.htmlElement.getBoundingClientRect();
        const tbodyRect = tbodyElement.getBoundingClientRect();
        return rowRect.top - tbodyRect.top + tbodyElement.scrollTop;
    }
    /**
     * Returns the rendered viewport row for a row ID.
     *
     * @param rowId
     * ID of the row to resolve.
     */
    getRenderedViewportRow(rowId) {
        return this.viewport.rows.find((row) => row.id === rowId);
    }
    /**
     * Returns the rendered or estimated bottom position of a row.
     *
     * @param rowId
     * ID of the row to position.
     *
     * @param rowIndex
     * Projected row index used for virtual estimation.
     *
     * @param rowHeight
     * Optional row height hint used for virtual estimation.
     */
    getRowBottom(rowId, rowIndex, rowHeight) {
        const renderedRow = this.getRenderedViewportRow(rowId);
        const resolvedRowHeight = rowHeight ||
            this.getRowHeight(rowId) ||
            this.viewport.rowsVirtualizer.defaultRowHeight;
        if (renderedRow) {
            return this.getRowTop(renderedRow) +
                renderedRow.htmlElement.offsetHeight;
        }
        if (this.viewport.virtualRows) {
            return this.viewport.rowsVirtualizer.getEstimatedRowBottom(rowIndex, resolvedRowHeight);
        }
    }
    /**
     * Checks whether the left candidates match the right candidate prefix.
     *
     * @param left
     * Currently active sticky row candidates.
     *
     * @param right
     * Candidate chain resolved for the current top row.
     */
    hasMatchingCandidatePrefix(left, right) {
        if (left.length > right.length) {
            return false;
        }
        for (let i = 0, iEnd = left.length; i < iEnd; ++i) {
            if (left[i].rowId !== right[i].rowId) {
                return false;
            }
        }
        return true;
    }
    /**
     * Returns the expanded ancestor chain eligible for sticky rendering.
     *
     * @param topVisibleRow
     * Currently resolved top visible row in the viewport.
     *
     * @param projectionState
     * Current projection metadata for visible tree rows.
     */
    getStickyCandidates(topVisibleRow, projectionState) {
        let currentRowId = topVisibleRow.id;
        const candidates = [];
        while (currentRowId !== null && typeof currentRowId !== 'undefined') {
            const rowState = projectionState.rowsById.get(currentRowId);
            if (!rowState) {
                return [];
            }
            if (rowState.hasChildren &&
                rowState.isExpanded) {
                const rowIndex = this.getProjectedRowIndex(currentRowId, projectionState, topVisibleRow);
                if (!defined(rowIndex)) {
                    return [];
                }
                candidates.push({
                    lastDescendantIndex: this.getProjectedRowIndex(rowState.lastVisibleDescendantId || currentRowId, projectionState, topVisibleRow) ?? rowIndex,
                    lastDescendantId: rowState.lastVisibleDescendantId || currentRowId,
                    rowId: currentRowId,
                    rowIndex
                });
            }
            currentRowId = rowState.parentId;
        }
        return candidates.reverse();
    }
    /**
     * Refreshes sticky rows using the current viewport state.
     */
    async refresh() {
        const syncRow = this.needsRowSync;
        const reflowRow = this.needsRowReflow;
        const focusState = this.captureFocusState();
        this.needsRowSync = false;
        this.needsRowReflow = false;
        const candidates = this.getCurrentCandidates();
        if (!candidates.length) {
            this.clearStickyRows();
            this.restoreFocusState(focusState);
            return;
        }
        const refreshToken = ++this.refreshToken;
        const isSynced = await this.syncStickyRows(candidates, syncRow, reflowRow, refreshToken);
        if (!isSynced || refreshToken !== this.refreshToken) {
            return;
        }
        this.positionStickyRows(candidates);
        this.restoreFocusState(focusState);
    }
    /**
     * Positions rendered sticky rows within the sticky body.
     *
     * @param candidates
     * Sticky row candidates to position.
     */
    positionStickyRows(candidates) {
        if (!this.stickyRows.length) {
            return;
        }
        this.syncStickyRowParity(candidates);
        const { tbodyElement, rowsVirtualizer } = this.viewport;
        const scrollTop = tbodyElement.scrollTop;
        let stickyStackHeight = 0;
        let cumulativePushOff = 0;
        this.syncStickyBodyPosition(false);
        for (let i = 0, iEnd = candidates.length; i < iEnd; ++i) {
            const candidate = candidates[i];
            const stickyRow = this.stickyRows[i];
            if (!stickyRow) {
                continue;
            }
            const stickyHeight = (stickyRow.htmlElement.offsetHeight ||
                rowsVirtualizer.defaultRowHeight);
            let pushOff = 0;
            const lastDescendantBottom = this.getRowBottom(candidate.lastDescendantId, candidate.lastDescendantIndex);
            if (typeof lastDescendantBottom === 'number') {
                pushOff = Math.min(0, lastDescendantBottom -
                    scrollTop -
                    stickyStackHeight -
                    cumulativePushOff -
                    stickyHeight);
            }
            cumulativePushOff += pushOff;
            stickyRow.translateY = stickyStackHeight + cumulativePushOff;
            stickyRow.htmlElement.style.zIndex = String(candidates.length - i);
            stickyRow.htmlElement.style.transform = cumulativePushOff ?
                `translateY(${Math.floor(cumulativePushOff)}px)` :
                '';
            stickyRow.htmlElement.style.visibility = '';
            stickyStackHeight += stickyHeight;
        }
        this.syncStickyBodyRenderedHeight();
    }
    /**
     * Syncs sticky row parity classes with the visual sticky stack order.
     *
     * @param candidates
     * Sticky row candidates rendered in the overlay.
     */
    syncStickyRowParity(candidates) {
        const firstCandidate = candidates[0];
        if (!firstCandidate) {
            return;
        }
        const stickyRowsCount = Math.min(candidates.length, this.stickyRows.length);
        let visualRowIndex = firstCandidate.rowIndex;
        for (let i = 0, iEnd = stickyRowsCount; i < iEnd; ++i, ++visualRowIndex) {
            const rowElement = this.stickyRows[i].htmlElement;
            const isEvenRow = !!(visualRowIndex % 2);
            rowElement.classList.toggle(rowEvenClassName, isEvenRow);
            rowElement.classList.toggle(rowOddClassName, !isEvenRow);
        }
    }
    /**
     * Syncs sticky body height to the rendered bottom of the sticky row stack.
     */
    syncStickyBodyRenderedHeight() {
        const stickyBodyElement = this.stickyBodyElement;
        if (!stickyBodyElement || !this.stickyRows.length) {
            return;
        }
        const { defaultRowHeight } = this.viewport.rowsVirtualizer;
        let height = 0;
        for (let i = 0, iEnd = this.stickyRows.length; i < iEnd; ++i) {
            const row = this.stickyRows[i];
            const rowHeight = row.htmlElement.offsetHeight || defaultRowHeight;
            height = Math.max(height, row.translateY + rowHeight);
        }
        stickyBodyElement.style.height = Math.ceil(height) + 'px';
    }
    /**
     * Returns the focused tree cell coordinates when focus is within the body
     * or sticky overlay.
     */
    getActiveFocusedCellCoordinates() {
        const activeElement = document.activeElement;
        if (!(activeElement instanceof HTMLTableCellElement)) {
            return;
        }
        const rowElement = activeElement.parentElement;
        if (!rowElement) {
            return;
        }
        if (this.stickyBodyElement?.contains(activeElement)) {
            const stickyRow = this.stickyRows.find((row) => row.htmlElement === rowElement);
            const columnIndex = Array.prototype.indexOf.call(rowElement.children, activeElement);
            if (!stickyRow ||
                columnIndex < 0) {
                return;
            }
            return {
                columnIndex,
                rowId: stickyRow.id,
                rowIndex: stickyRow.index
            };
        }
        if (!this.viewport.tbodyElement.contains(activeElement)) {
            return;
        }
        const cell = this.viewport.getCellFromElement(activeElement);
        const columnIndex = cell?.column?.index;
        const rowIndex = cell?.row?.index;
        if (!defined(columnIndex) || !defined(rowIndex)) {
            return;
        }
        return {
            columnIndex,
            rowId: cell?.row?.id,
            rowIndex
        };
    }
    /**
     * Restores focus after sticky rows move between the body and overlay.
     *
     * @param focusState
     * Captured focus state from before the sticky row update.
     */
    restoreFocusState(focusState) {
        if (!focusState ||
            !this.shouldRestoreFocusState(focusState)) {
            return;
        }
        const stickyCell = this.stickyRows.find((row) => row.id === focusState.rowId)?.cells[focusState.columnIndex];
        if (stickyCell) {
            if (document.activeElement !== stickyCell.htmlElement) {
                delete this.viewport.pendingFocusCursor;
                stickyCell.htmlElement.focus({
                    preventScroll: true
                });
            }
            return;
        }
        if (!focusState.inStickyBody) {
            return;
        }
        const viewportCell = this.viewport.rows.find((row) => row.id === focusState.rowId)?.cells[focusState.columnIndex];
        if (viewportCell &&
            document.activeElement !== viewportCell.htmlElement) {
            delete this.viewport.pendingFocusCursor;
            viewportCell.htmlElement.focus({
                preventScroll: true
            });
        }
    }
    /**
     * Synchronizes rendered sticky rows with the current candidates.
     *
     * @param candidates
     * Sticky row candidates to synchronize.
     *
     * @param syncRow
     * Whether sticky rows should be synchronized with source rows.
     *
     * @param reflowRow
     * Whether sticky rows should be reflowed after synchronization.
     *
     * @param refreshToken
     * Refresh token used to discard stale async work.
     */
    async syncStickyRows(candidates, syncRow, reflowRow, refreshToken) {
        const currentRowsById = new Map();
        for (let i = 0, iEnd = this.stickyRows.length; i < iEnd; ++i) {
            const row = this.stickyRows[i];
            if (typeof row.id !== 'undefined') {
                currentRowsById.set(row.id, row);
            }
        }
        const nextStickyRows = [];
        for (let i = 0, iEnd = candidates.length; i < iEnd; ++i) {
            const candidate = candidates[i];
            let stickyRow = currentRowsById.get(candidate.rowId);
            if (stickyRow) {
                currentRowsById.delete(candidate.rowId);
            }
            if (!stickyRow) {
                stickyRow = new TableRow(this.viewport, candidate.rowIndex);
                await stickyRow.init();
                if (refreshToken !== this.refreshToken) {
                    stickyRow.destroy();
                    return false;
                }
                await stickyRow.render();
            }
            else if (syncRow ||
                stickyRow.index !== candidate.rowIndex) {
                await stickyRow.reuse(candidate.rowIndex);
            }
            if (refreshToken !== this.refreshToken) {
                return false;
            }
            if (reflowRow) {
                stickyRow.reflow();
            }
            stickyRow.htmlElement.style.position = 'relative';
            stickyRow.htmlElement.style.top = '';
            stickyRow.htmlElement.style.left = '';
            stickyRow.htmlElement.style.right = '';
            nextStickyRows.push(stickyRow);
        }
        currentRowsById.forEach((row) => row.destroy());
        this.stickyRows = nextStickyRows;
        this.activeRowIds = candidates.map((candidate) => candidate.rowId);
        const stickyBodyElement = this.ensureStickyBody();
        this.syncStickyRowOrder(nextStickyRows, stickyBodyElement);
        this.syncStickyBodyClasses(stickyBodyElement);
        this.syncStickyBodyPosition();
        return true;
    }
    /**
     * Synchronizes sticky row DOM order without remounting unchanged rows.
     *
     * @param stickyRows
     * Sticky rows in the desired DOM order.
     *
     * @param stickyBodyElement
     * Sticky body hosting the rows.
     */
    syncStickyRowOrder(stickyRows, stickyBodyElement) {
        let expectedNode = stickyBodyElement.firstChild;
        for (let i = 0, iEnd = stickyRows.length; i < iEnd; ++i) {
            const rowElement = stickyRows[i].htmlElement;
            if (rowElement === expectedNode) {
                expectedNode = expectedNode?.nextSibling || null;
                continue;
            }
            stickyBodyElement.insertBefore(rowElement, expectedNode);
        }
    }
    /**
     * Returns whether the previously captured focus should be restored.
     *
     * @param focusState
     * Captured focus state from before the sticky row update.
     */
    shouldRestoreFocusState(focusState) {
        const activeCellCoordinates = this.getActiveFocusedCellCoordinates();
        if (activeCellCoordinates) {
            return (activeCellCoordinates.columnIndex === focusState.columnIndex &&
                (activeCellCoordinates.rowId === focusState.rowId ||
                    activeCellCoordinates.rowIndex === focusState.rowIndex));
        }
        const activeElement = document.activeElement;
        return (activeElement === focusState.sourceElement ||
            activeElement === document.body);
    }
    /**
     * Synchronizes sticky body position and dimensions with the viewport.
     *
     * @param syncDimensions
     * Whether sticky body dimensions should be recalculated.
     */
    syncStickyBodyPosition(syncDimensions = true) {
        const stickyBodyElement = this.ensureStickyBody();
        const { tbodyElement } = this.viewport;
        if (syncDimensions) {
            const { rowsWidth } = this.viewport;
            const bodyWidth = Math.max(rowsWidth || 0, tbodyElement.scrollWidth, tbodyElement.clientWidth);
            const tableRect = this.viewport.tableElement.getBoundingClientRect();
            const tbodyRect = tbodyElement.getBoundingClientRect();
            const stickyTop = (tbodyRect.top -
                tableRect.top -
                this.viewport.tableElement.clientTop);
            stickyBodyElement.style.top = stickyTop + 'px';
            stickyBodyElement.style.width = bodyWidth + 'px';
            stickyBodyElement.style.height = this.getStickyRowsHeight() + 'px';
        }
        stickyBodyElement.style.transform = tbodyElement.scrollLeft ?
            `translateX(${-tbodyElement.scrollLeft}px)` :
            '';
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default TreeStickyRowController;
