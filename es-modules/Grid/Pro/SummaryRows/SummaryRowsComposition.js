/* *
 *
 *  Grid Summary Rows Composition
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
 *  Authors:
 *  - Dawid Dragula
 *
 * */
'use strict';
import { defaultOptions as gridDefaultOptions } from '../../Core/Defaults.js';
import Globals from '../../Core/Globals.js';
import SummaryRowsController from './SummaryRowsController.js';
import SummaryView from './SummaryView.js';
import { addEvent, merge, pushUnique } from '../../../Shared/Utilities.js';
/* *
 *
 *  Constants
 *
 * */
/**
 * Default options contributed by the summary rows feature (accessibility
 * strings). Merged into the shared grid defaults on compose.
 */
export const defaultOptions = {
    lang: {
        accessibility: {
            summaryRows: {
                descriptions: {
                    summary: 'Summary row.'
                }
            }
        }
    }
};
/* *
 *
 *  Composition
 *
 * */
/**
 * Composes Grid Pro with the flat summary rows feature.
 *
 * @param GridClass
 * Grid class to extend.
 *
 * @param TableClass
 * Table (viewport) class to extend.
 *
 * @param TableCellClass
 * TableCell class to extend.
 */
export function compose(GridClass, TableClass, TableCellClass) {
    if (!pushUnique(Globals.composed, 'SummaryRows')) {
        return;
    }
    merge(true, gridDefaultOptions, defaultOptions);
    addEvent(GridClass, 'beforeLoad', onBeforeLoad);
    addEvent(GridClass, 'beforeDestroy', onBeforeDestroy);
    addEvent(GridClass, 'projectPresentationTable', onProjectPresentationTable, { order: 0 } // Run before TreeView and row grouping
    );
    addEvent(TableClass, 'beforeInit', onTableBeforeInit);
    addEvent(TableClass, 'afterReflow', onTableAfterReflow);
    addEvent(TableClass, 'bodyScroll', onTableBodyScroll);
    addEvent(TableClass, 'afterDestroy', onTableAfterDestroy);
    addEvent(TableCellClass, 'afterDataMutation', onCellAfterDataMutation);
}
/**
 * Initializes the summary rows controller before first data querying.
 */
function onBeforeLoad() {
    if (!this.summaryRows) {
        this.summaryRows = new SummaryRowsController(this);
    }
}
/**
 * Cleans up the summary rows controller on Grid destroy.
 *
 * @param e
 * Grid destroy event metadata.
 *
 * @param e.onlyDOM
 * Whether destroy is limited to DOM teardown before a re-render.
 */
function onBeforeDestroy(e) {
    if (e.onlyDOM) {
        return;
    }
    delete this.summaryRows;
}
/**
 * Recomputes the summary row objects from the queried table before pagination.
 *
 * @param e
 * Presentation table event fired after sort/filter and before pagination.
 *
 * @param e.table
 * Queried table after filter/sort and before pagination.
 */
function onProjectPresentationTable(e) {
    this.summaryRows?.updateFromTable(e.table);
}
/**
 * Creates the summary view and wires its re-render into the render cycle.
 */
function onTableBeforeInit() {
    const table = this;
    const view = new SummaryView(table);
    table.summaryView = view;
    const renderSummary = async () => {
        await view.render(table.grid.summaryRows?.getRows() ?? []);
    };
    // Initial render is not covered by afterUpdateRowsHooks; wrap the
    // virtualizer hook (preserving any previously registered handler).
    const virtualizer = table.rowsVirtualizer;
    const previousBeforeInitialRender = virtualizer.beforeInitialRenderRows;
    virtualizer.beforeInitialRenderRows = async () => {
        await previousBeforeInitialRender?.();
        await renderSummary();
    };
    table.afterUpdateRowsHooks.push(renderSummary);
}
/**
 * Re-applies summary cell widths and offset after a table reflow.
 */
function onTableAfterReflow() {
    this.summaryView?.reflow();
}
/**
 * Keeps the summary section aligned with the main body horizontal scroll.
 *
 * @param e
 * Body scroll event payload.
 *
 * @param e.scrollLeft
 * Current horizontal scroll offset.
 */
function onTableBodyScroll(e) {
    this.summaryView?.syncHorizontalScroll(e.scrollLeft || 0);
}
/**
 * Destroys the summary view on table teardown.
 */
function onTableAfterDestroy() {
    this.summaryView?.destroy();
    delete this.summaryView;
}
/**
 * Forces a requery so the totals recompute when an aggregated source column
 * cell is edited.
 *
 * @param e
 * Cell data mutation event payload.
 */
function onCellAfterDataMutation(e) {
    const grid = this.row.viewport.grid;
    if (grid.summaryRows?.hasColumnAggregator(e.sourceColumnId)) {
        grid.querying.shouldBeUpdated = true;
        e.requiresFullRowsUpdate = true;
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default {
    compose
};
