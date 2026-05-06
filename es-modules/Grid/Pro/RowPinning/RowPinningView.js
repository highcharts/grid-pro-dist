/* *
 *
 *  Grid Row Pinning viewport helper
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
 *
 *  Author:
 *  - Mikkel Espolin Birkeland
 *  - Dawid Dragula
 *
 * */
'use strict';
import TableCell from '../../Core/Table/Body/TableCell.js';
import GridUtils from '../../Core/GridUtils.js';
import Globals from '../../Core/Globals.js';
import { getGridRowPinningOptions } from './RowPinningController.js';
import PinnedTableRow from './PinnedTableRow.js';
const { makeHTMLElement } = GridUtils;
/**
 * The class names used by the row pinning functionality.
 */
export const classNames = {
    pinnedTbodyElement: Globals.classNamePrefix + 'tbody-pinned',
    pinnedTopTbodyElement: Globals.classNamePrefix + 'tbody-pinned-top',
    pinnedBottomTbodyElement: Globals.classNamePrefix + 'tbody-pinned-bottom',
    rowPinned: Globals.classNamePrefix + 'row-pinned',
    rowPinnedTop: Globals.classNamePrefix + 'row-pinned-top',
    rowPinnedBottom: Globals.classNamePrefix + 'row-pinned-bottom'
};
class RowPinningView {
    constructor(viewport) {
        this.pinnedTopRows = [];
        this.pinnedBottomRows = [];
        this.pinnedTopRowById = new Map();
        this.pinnedBottomRowById = new Map();
        this.scrollbarCompensationQueued = false;
        this.viewport = viewport;
        this.pinnedTopTbodyElement = makeHTMLElement('tbody', {
            className: [
                classNames.pinnedTbodyElement,
                classNames.pinnedTopTbodyElement
            ].join(' ')
        });
        this.pinnedTopTbodyElement.setAttribute('aria-label', 'Pinned top rows');
        this.pinnedBottomTbodyElement = makeHTMLElement('tbody', {
            className: [
                classNames.pinnedTbodyElement,
                classNames.pinnedBottomTbodyElement
            ].join(' ')
        });
        this.pinnedBottomTbodyElement.setAttribute('aria-label', 'Pinned bottom rows');
        viewport.registerBodySection({
            id: 'top',
            position: 'before',
            tbodyElement: this.pinnedTopTbodyElement,
            getRows: () => this.pinnedTopRows,
            getRowByElement: (rowElement) => this.pinnedTopRows.find((row) => row.htmlElement === rowElement),
            getRowById: (rowId) => this.pinnedTopRowById.get(rowId)
        });
        viewport.registerBodySection({
            id: 'bottom',
            position: 'after',
            tbodyElement: this.pinnedBottomTbodyElement,
            getRows: () => this.pinnedBottomRows,
            getRowByElement: (rowElement) => this.pinnedBottomRows.find((row) => row.htmlElement === rowElement),
            getRowById: (rowId) => this.pinnedBottomRowById.get(rowId)
        });
    }
    getRows(section) {
        return section === 'top' ? this.pinnedTopRows : this.pinnedBottomRows;
    }
    getPinnedRowsCount() {
        return this.pinnedTopRows.length + this.pinnedBottomRows.length;
    }
    getRenderedPinnedRowById(rowId, section) {
        return section === 'top' ?
            this.pinnedTopRowById.get(rowId) :
            this.pinnedBottomRowById.get(rowId);
    }
    getBodyForSection(section) {
        return section === 'top' ?
            this.pinnedTopTbodyElement :
            this.pinnedBottomTbodyElement;
    }
    getSectionForBody(tbody) {
        if (tbody === this.pinnedTopTbodyElement) {
            return 'top';
        }
        if (tbody === this.pinnedBottomTbodyElement) {
            return 'bottom';
        }
    }
    getPinnedBodyMaxHeightSignature() {
        return [
            this.normalizeMaxHeight(this.getPinnedBodyMaxHeight('top')),
            this.normalizeMaxHeight(this.getPinnedBodyMaxHeight('bottom'))
        ].join('|');
    }
    async refreshFromQueryCycle(deferLayout = false) {
        await this.viewport.grid.rowPinning
            ?.recomputeResolvedFromMaterializedRows();
        const renderResult = await this.render(deferLayout);
        await this.viewport.grid.rowPinning?.handlePinnedRenderResult(renderResult, 'query');
    }
    async render(deferLayout = false) {
        const { viewport } = this;
        const cellEditing = viewport.cellEditing;
        // Cancel any active cell editing before destroying/moving rows to
        // prevent orphaned inputs and stale cell references.
        if (cellEditing?.editedCell) {
            cellEditing.stopEditing(false);
        }
        const pinnedRows = viewport.grid.rowPinning?.getPinnedRows() || {
            topIds: [],
            bottomIds: []
        };
        const hasPinning = pinnedRows.topIds.length > 0 ||
            pinnedRows.bottomIds.length > 0;
        const pinnedSections = this.getPinnedSections(pinnedRows);
        this.ensurePinnedBodiesRendered(pinnedSections);
        if (!hasPinning) {
            this.clearPinnedRows();
            viewport.tbodyElement.style.display = '';
            if (!deferLayout) {
                this.applyPinnedBodyMaxHeights();
            }
            this.updateScrollableRowAttributes();
            await viewport.syncAriaRowIndexes();
            return { missingPinnedRowIds: [] };
        }
        const missingPinnedRowIds = [];
        for (const section of pinnedSections) {
            missingPinnedRowIds.push(...await this.syncPinnedRowsByIds(section.rows, section.tbody, section.rowIds, section.position));
        }
        this.rebuildPinnedRowLookupMaps();
        this.updateScrollableRowAttributes();
        await viewport.syncAriaRowIndexes();
        viewport.tbodyElement.style.display = '';
        if (!deferLayout) {
            this.applyPinnedBodyMaxHeights();
            this.syncHorizontalScroll(viewport.tbodyElement.scrollLeft);
            this.applyPinnedScrollbarCompensation();
        }
        return { missingPinnedRowIds };
    }
    reflow() {
        for (const row of this.pinnedTopRows.concat(this.pinnedBottomRows)) {
            row.reflow();
        }
        this.applyPinnedBodyMaxHeights();
        this.applyPinnedScrollbarCompensation();
        this.syncHorizontalScroll(this.viewport.tbodyElement.scrollLeft);
    }
    destroy() {
        this.viewport.unregisterBodySection('top');
        this.viewport.unregisterBodySection('bottom');
        for (let i = 0, iEnd = this.pinnedTopRows.length; i < iEnd; ++i) {
            this.pinnedTopRows[i].destroy();
        }
        for (let i = 0, iEnd = this.pinnedBottomRows.length; i < iEnd; ++i) {
            this.pinnedBottomRows[i].destroy();
        }
        this.pinnedTopRows.length = 0;
        this.pinnedBottomRows.length = 0;
        this.pinnedTopRowById.clear();
        this.pinnedBottomRowById.clear();
        this.pinnedTopTbodyElement.remove();
        this.pinnedBottomTbodyElement.remove();
    }
    revealRowInSection(rowId, section) {
        const tbody = this.getBodyForSection(section);
        const row = this.getRenderedPinnedRowById(rowId, section);
        const rowElement = row?.htmlElement;
        if (!rowElement || !tbody.isConnected || tbody.clientHeight <= 0) {
            return;
        }
        const viewportTop = tbody.scrollTop;
        const viewportBottom = viewportTop + tbody.clientHeight;
        const rowTop = rowElement.offsetTop;
        const rowBottom = rowTop + rowElement.offsetHeight;
        if (rowTop < viewportTop) {
            tbody.scrollTop = Math.max(0, rowTop);
            return;
        }
        if (rowBottom > viewportBottom) {
            tbody.scrollTop = Math.max(0, rowBottom - tbody.clientHeight);
        }
    }
    captureViewportCompensation(rowId) {
        const compensationState = {
            pinnedTopHeight: this.pinnedTopTbodyElement.isConnected ?
                this.pinnedTopTbodyElement.offsetHeight :
                0
        };
        const anchorRow = this.viewport.rows.find((row) => row.id === rowId);
        if (!anchorRow?.htmlElement.isConnected) {
            return compensationState;
        }
        const tbodyRect = this.viewport.tbodyElement.getBoundingClientRect();
        const rowRect = anchorRow.htmlElement.getBoundingClientRect();
        if (rowRect.bottom <= tbodyRect.top ||
            rowRect.top >= tbodyRect.bottom) {
            return compensationState;
        }
        compensationState.anchorRowId = rowId;
        compensationState.anchorRowTop = rowRect.top;
        return compensationState;
    }
    restoreViewportCompensation(compensationState) {
        let delta;
        if (compensationState.anchorRowId !== void 0 &&
            compensationState.anchorRowTop !== void 0) {
            const anchorRow = this.viewport.rows.find((row) => row.id === compensationState.anchorRowId);
            const anchorElement = anchorRow?.htmlElement;
            if (anchorElement?.isConnected) {
                delta = (anchorElement.getBoundingClientRect().top -
                    compensationState.anchorRowTop);
            }
        }
        if (delta === void 0) {
            delta = ((this.pinnedTopTbodyElement.isConnected ?
                this.pinnedTopTbodyElement.offsetHeight :
                0) -
                compensationState.pinnedTopHeight);
        }
        if (!delta) {
            return;
        }
        this.viewport.tbodyElement.scrollTop = Math.max(0, this.viewport.tbodyElement.scrollTop + delta);
    }
    syncHorizontalScroll(scrollLeft) {
        const hasPinnedBody = this.getPinnedSections()
            .some((section) => section.tbody.isConnected);
        if (!hasPinnedBody) {
            return;
        }
        const offset = -scrollLeft;
        const transform = offset ? `translateX(${offset}px)` : '';
        for (const section of this.getPinnedSections()) {
            if (!section.tbody.isConnected) {
                continue;
            }
            // Keep pinned rows aligned via transform only. Updating both the
            // tbody scroll position and the row transform shifts content twice.
            section.tbody.scrollLeft = 0;
            for (let i = 0, iEnd = section.rows.length; i < iEnd; ++i) {
                section.rows[i].htmlElement.style.transform = transform;
            }
        }
    }
    updateRowAttributes(row) {
        const vp = this.viewport;
        const el = row.htmlElement;
        const rowPinningDescriptions = vp.grid.options?.lang?.accessibility
            ?.rowPinning?.descriptions;
        el.classList.remove(classNames.rowPinned, classNames.rowPinnedTop, classNames.rowPinnedBottom);
        if (row instanceof PinnedTableRow &&
            row.bodySectionId === 'top') {
            el.classList.add(classNames.rowPinned);
            el.setAttribute('aria-roledescription', rowPinningDescriptions?.pinnedTop ||
                'Pinned row in top section.');
            return;
        }
        if (row instanceof PinnedTableRow &&
            row.bodySectionId === 'bottom') {
            el.classList.add(classNames.rowPinned);
            el.setAttribute('aria-roledescription', rowPinningDescriptions?.pinnedBottom ||
                'Pinned row in bottom section.');
            return;
        }
        if (row.id === void 0) {
            el.removeAttribute('aria-roledescription');
            return;
        }
        const pinnedRows = vp.grid.rowPinning?.getPinnedRows();
        if (pinnedRows?.topIds.includes(row.id)) {
            el.classList.add(classNames.rowPinned);
            el.classList.add(classNames.rowPinnedTop);
            el.setAttribute('aria-roledescription', rowPinningDescriptions?.alsoPinnedTop ||
                'This row is also pinned to top section.');
            return;
        }
        if (pinnedRows?.bottomIds.includes(row.id)) {
            el.classList.add(classNames.rowPinned);
            el.classList.add(classNames.rowPinnedBottom);
            el.setAttribute('aria-roledescription', rowPinningDescriptions?.alsoPinnedBottom ||
                'This row is also pinned to bottom section.');
            return;
        }
        el.removeAttribute('aria-roledescription');
    }
    async syncRenderedMirrors(rowId, columnId, value, sourceRow, sourceColumnId) {
        const renderedRows = new Set();
        const dataProvider = this.viewport.grid.dataProvider;
        const mainRowIndex = await dataProvider?.getRowIndex(rowId);
        const topRow = this.getRenderedPinnedRowById(rowId, 'top');
        if (topRow) {
            renderedRows.add(topRow);
        }
        const bottomRow = this.getRenderedPinnedRowById(rowId, 'bottom');
        if (bottomRow) {
            renderedRows.add(bottomRow);
        }
        if (typeof mainRowIndex === 'number') {
            const scrollRow = this.viewport.getRenderedRowByIndex(mainRowIndex);
            if (scrollRow) {
                renderedRows.add(scrollRow);
            }
        }
        for (const row of renderedRows) {
            if (row === sourceRow) {
                continue;
            }
            row.data[columnId] = value;
            if (sourceColumnId && sourceColumnId !== columnId) {
                row.data[sourceColumnId] = value;
            }
            const cell = row.cells.find((tableCell) => tableCell instanceof TableCell &&
                tableCell.column.id === columnId);
            if (cell) {
                await cell.setValue(value);
            }
        }
    }
    async syncPinnedRowsFromMaterializedRows() {
        const { grid } = this.viewport;
        if (!grid.rowPinning?.isEnabled()) {
            return;
        }
        const pinnedRows = grid.rowPinning.getPinnedRows();
        const pinnedIds = [
            ...pinnedRows.topIds,
            ...pinnedRows.bottomIds
        ];
        const hasPendingRenderedRows = this.hasPendingRenderedPinnedRows(pinnedRows);
        if (!pinnedIds.length) {
            return;
        }
        const { hydratedRowIds, definitiveMissingRowIds } = await grid.rowPinning.ensurePinnedRowsAvailable(pinnedIds);
        if (definitiveMissingRowIds.length) {
            grid.rowPinning.pruneMissingExplicitIds(definitiveMissingRowIds);
        }
        if (hasPendingRenderedRows ||
            hydratedRowIds.length ||
            definitiveMissingRowIds.length) {
            await this.render(true);
        }
    }
    async getScrollableRowCount(providerRowCount) {
        const { grid } = this.viewport;
        if (!grid.querying.pagination.enabled) {
            return providerRowCount;
        }
        const pinnedRows = grid.rowPinning?.getPinnedRows();
        const pinnedSet = new Set([
            ...(pinnedRows?.topIds || []),
            ...(pinnedRows?.bottomIds || [])
        ]);
        let pinnedCount = 0;
        const dataProvider = grid.dataProvider;
        for (let i = 0; i < providerRowCount; ++i) {
            const rowId = await dataProvider?.getRowId(i);
            if (rowId !== void 0 && pinnedSet.has(rowId)) {
                ++pinnedCount;
            }
        }
        return Math.max(providerRowCount - pinnedCount, 0);
    }
    getPinnedBodyMaxHeight(position) {
        const pinningOptions = getGridRowPinningOptions(this.viewport.grid);
        return position === 'top' ?
            pinningOptions?.top?.maxHeight :
            pinningOptions?.bottom?.maxHeight;
    }
    normalizeMaxHeight(value) {
        if (typeof value === 'number' && value >= 0) {
            return value + 'px';
        }
        if (typeof value !== 'string') {
            return '';
        }
        const trimmed = value.trim();
        const percentMatch = trimmed.match(/^(\d+(\.\d+)?)%$/);
        if (percentMatch) {
            const percent = parseFloat(percentMatch[1]);
            const tableHeight = this.viewport.tableElement.clientHeight ||
                this.viewport.tbodyElement.clientHeight;
            const pxHeight = Math.max(0, Math.round(tableHeight * percent / 100));
            return pxHeight + 'px';
        }
        if (/^\d+(\.\d+)?px$/.test(trimmed)) {
            return trimmed;
        }
        return '';
    }
    applyPinnedBodyMaxHeights() {
        const apply = (tbody, value) => {
            const maxHeight = this.normalizeMaxHeight(value);
            tbody.style.maxHeight = maxHeight;
            tbody.style.overflowY = maxHeight ? 'auto' : '';
            tbody.style.overflowX = maxHeight ? 'hidden' : '';
        };
        for (const section of this.getPinnedSections()) {
            apply(section.tbody, this.getPinnedBodyMaxHeight(section.position));
        }
    }
    async syncPinnedRowsByIds(targetRows, tbody, rowIds, section) {
        const missingPinnedRowIds = [];
        const nextRows = [];
        for (let i = 0; i < rowIds.length; ++i) {
            const rowId = rowIds[i];
            const rowData = this.viewport.grid.rowPinning?.getPinnedRowObject(rowId);
            if (!rowData) {
                missingPinnedRowIds.push(rowId);
                continue;
            }
            const nextIndex = nextRows.length;
            let row = targetRows[nextIndex];
            if (!row) {
                row = new PinnedTableRow(this.viewport, section, nextIndex);
                await row.sync(rowId, rowData, nextIndex, false);
                await row.init();
                await row.render();
                tbody.appendChild(row.htmlElement);
            }
            else {
                await row.sync(rowId, rowData, nextIndex, false);
                if (!row.htmlElement.isConnected) {
                    tbody.appendChild(row.htmlElement);
                }
            }
            this.updateRowAttributes(row);
            row.reflow();
            nextRows.push(row);
        }
        for (let i = nextRows.length; i < targetRows.length; ++i) {
            targetRows[i].destroy();
        }
        targetRows.length = 0;
        for (const row of nextRows) {
            targetRows.push(row);
        }
        return missingPinnedRowIds;
    }
    rebuildPinnedRowLookupMaps() {
        for (const section of this.getPinnedSections()) {
            section.rowById.clear();
            for (const row of section.rows) {
                if (row.id !== void 0) {
                    section.rowById.set(row.id, row);
                }
            }
        }
    }
    updateScrollableRowAttributes() {
        for (let i = 0, iEnd = this.viewport.rows.length; i < iEnd; ++i) {
            this.updateRowAttributes(this.viewport.rows[i]);
        }
    }
    /**
     * Keeps pinned sections aligned with the scrollable tbody content width by
     * compensating for the vertical scrollbar gutter.
     */
    applyPinnedScrollbarCompensation() {
        const scrollableBody = this.viewport.tbodyElement;
        const mainGutterWidth = Math.max(0, scrollableBody.offsetWidth - scrollableBody.clientWidth);
        const applyToPinnedBody = (pinnedBody) => {
            if (!pinnedBody.isConnected) {
                pinnedBody.style.width = '';
                return;
            }
            const pinnedGutterWidth = Math.max(0, pinnedBody.offsetWidth - pinnedBody.clientWidth);
            const compensation = Math.max(0, mainGutterWidth - pinnedGutterWidth);
            pinnedBody.style.width = compensation > 0 ?
                `calc(100% - ${compensation}px)` :
                '';
        };
        for (const section of this.getPinnedSections()) {
            applyToPinnedBody(section.tbody);
        }
        if (!this.scrollbarCompensationQueued) {
            this.scrollbarCompensationQueued = true;
            requestAnimationFrame(() => {
                this.scrollbarCompensationQueued = false;
                for (const section of this.getPinnedSections()) {
                    applyToPinnedBody(section.tbody);
                }
            });
        }
    }
    ensurePinnedBodiesRendered(pinnedSections) {
        const tableElement = this.viewport.tableElement;
        for (const section of pinnedSections) {
            if (!section.rowIds.length) {
                if (section.tbody.parentElement === tableElement) {
                    section.tbody.remove();
                }
                continue;
            }
            if (section.tbody.parentElement !== tableElement) {
                if (section.position === 'top') {
                    tableElement.insertBefore(section.tbody, this.viewport.tbodyElement);
                }
                else {
                    tableElement.appendChild(section.tbody);
                }
            }
        }
    }
    hasPendingRenderedPinnedRows(pinnedRows) {
        const { rowPinning } = this.viewport.grid;
        if (!rowPinning) {
            return false;
        }
        for (const section of this.getPinnedSections(pinnedRows)) {
            for (const rowId of section.rowIds) {
                if (rowPinning.getPinnedRowObject(rowId) &&
                    !section.rowById.has(rowId)) {
                    return true;
                }
            }
        }
        return false;
    }
    clearPinnedRows() {
        for (const section of this.getPinnedSections()) {
            section.rows.forEach((row) => row.destroy());
            section.rows.length = 0;
            section.rowById.clear();
        }
    }
    getPinnedSections(pinnedRows = {
        topIds: [],
        bottomIds: []
    }) {
        return [{
                position: 'top',
                rowIds: pinnedRows.topIds,
                rows: this.pinnedTopRows,
                tbody: this.pinnedTopTbodyElement,
                rowById: this.pinnedTopRowById
            }, {
                position: 'bottom',
                rowIds: pinnedRows.bottomIds,
                rows: this.pinnedBottomRows,
                tbody: this.pinnedBottomTbodyElement,
                rowById: this.pinnedBottomRowById
            }];
    }
}
export default RowPinningView;
