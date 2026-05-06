/* *
 *
 *  Grid Row Pinning composition
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
 *
 *  Author:
 *  - Mikkel Espolin Birkeland
 *
 * */
'use strict';
import { defaultOptions as gridDefaultOptions } from '../../Core/Defaults.js';
import Globals from '../../Core/Globals.js';
import RowPinningController, { hasConfiguredGridRowPinningOptions } from './RowPinningController.js';
import RowPinningView, { classNames } from './RowPinningView.js';
import PinnedTableCell from './PinnedTableCell.js';
import { registerBuiltInAction } from '../../Core/Table/Body/CellContextMenuBuiltInActions.js';
import { addEvent, merge, pushUnique } from '../../../Shared/Utilities.js';
/**
 * Default options for row pinning.
 */
export const defaultOptions = {
    accessibility: {
        announcements: {
            rowPinning: true
        }
    },
    lang: {
        pinRowTop: 'Pin row to top',
        pinRowBottom: 'Pin row to bottom',
        unpinRow: 'Unpin row',
        accessibility: {
            rowPinning: {
                announcements: {
                    pinned: 'Row {rowId} pinned to {position}.',
                    unpinned: 'Row {rowId} unpinned.'
                },
                descriptions: {
                    pinnedTop: 'Pinned row in top section.',
                    pinnedBottom: 'Pinned row in bottom section.',
                    alsoPinnedTop: 'This row is also pinned to top section.',
                    alsoPinnedBottom: 'This row is also pinned to bottom section.'
                }
            }
        }
    },
    rendering: {
        rows: {
            pinning: {
                enabled: true,
                topIds: [],
                bottomIds: [],
                events: {},
                top: {},
                bottom: {}
            }
        }
    }
};
export { classNames };
const defaultPinnedRowsState = {
    topIds: [],
    bottomIds: []
};
/**
 * Compose row pinning APIs into Grid Pro.
 *
 * @param GridClass
 * Grid class to compose into.
 *
 * @param TableClass
 * Table class to compose into.
 *
 * @param ColumnClass
 * Column class to compose into.
 *
 * @param TableRowClass
 * TableRow class to compose into.
 *
 * @param TableCellClass
 * TableCell class to compose into.
 */
export function compose(GridClass, TableClass, ColumnClass, TableRowClass, TableCellClass) {
    void ColumnClass;
    if (!pushUnique(Globals.composed, 'RowPinning')) {
        return;
    }
    merge(true, gridDefaultOptions, defaultOptions);
    registerBuiltInActions();
    addEvent(GridClass, 'beforeLoad', initRowPinning);
    addEvent(GridClass, 'beforeUpdate', onBeforeGridUpdate);
    addEvent(TableClass, 'beforeInit', initRowPinningView);
    addEvent(TableClass, 'afterReflow', onAfterTableReflow);
    addEvent(TableClass, 'bodyScroll', onTableBodyScroll);
    addEvent(TableClass, 'afterDestroy', destroyRowPinningView);
    addEvent(TableRowClass, 'afterLoadData', rememberMaterializedRowData);
    addEvent(TableRowClass, 'afterUpdateAttributes', syncRenderedRowAttrs);
    addEvent(TableCellClass, 'afterEditValue', syncEditedCellMirrors);
}
/**
 * Registers row pinning built-in context menu actions.
 */
function registerBuiltInActions() {
    registerBuiltInAction('pinRowTop', {
        getLabel: (cell) => cell.row.viewport.grid.options?.lang?.pinRowTop || '',
        icon: 'pin',
        isVisible: (cell, rowId) => isRowPinningActionVisible(cell, rowId),
        isDisabled: (cell, rowId) => isRowPinningActionDisabled('pinRowTop', cell, rowId),
        onClick: (cell, rowId) => {
            void cell.row.viewport.grid.rowPinning?.pin(rowId, 'top');
        }
    }, true);
    registerBuiltInAction('pinRowBottom', {
        getLabel: (cell) => cell.row.viewport.grid.options?.lang?.pinRowBottom || '',
        icon: 'pin',
        isVisible: (cell, rowId) => isRowPinningActionVisible(cell, rowId),
        isDisabled: (cell, rowId) => isRowPinningActionDisabled('pinRowBottom', cell, rowId),
        onClick: (cell, rowId) => {
            void cell.row.viewport.grid.rowPinning?.pin(rowId, 'bottom');
        }
    }, true);
    registerBuiltInAction('unpinRow', {
        getLabel: (cell) => cell.row.viewport.grid.options?.lang?.unpinRow || '',
        icon: 'unpin',
        isVisible: (cell, rowId) => isRowPinningActionVisible(cell, rowId),
        isDisabled: (cell, rowId) => isRowPinningActionDisabled('unpinRow', cell, rowId),
        onClick: (cell, rowId) => {
            void cell.row.viewport.grid.rowPinning?.unpin(rowId);
        }
    }, true);
}
/**
 * Initializes row pinning state for a grid instance.
 */
function initRowPinning() {
    syncPinningIdColumnOption(this.userOptions);
    syncPinningIdColumnOption(this.options);
    this.rowPinning = new RowPinningController(this);
    this.rowPinning.loadOptions();
}
/**
 * Creates the row pinning view helper for a table instance.
 */
function initRowPinningView() {
    this.rowPinningView = new RowPinningView(this);
    const previousGetEffectiveRowCount = this.rowsVirtualizer
        .getEffectiveRowCount;
    this.rowsVirtualizer.getEffectiveRowCount = async (providerRowCount) => await this.rowPinningView?.getScrollableRowCount(await previousGetEffectiveRowCount?.(providerRowCount) ??
        providerRowCount) ?? providerRowCount;
    this.rowsVirtualizer.beforeInitialRenderRows = async () => {
        await this.rowPinningView?.refreshFromQueryCycle(true);
    };
    const previousAfterRenderRows = this.rowsVirtualizer.afterRenderRows;
    this.rowsVirtualizer.afterRenderRows = async () => {
        await previousAfterRenderRows?.();
        await this.rowPinningView?.syncPinnedRowsFromMaterializedRows();
    };
    this.afterUpdateRowsHooks.push(async () => {
        await this.rowPinningView?.refreshFromQueryCycle(true);
    });
}
/**
 * Triggers a reflow of the pinned rows view after the table reflowed.
 */
function onAfterTableReflow() {
    this.rowPinningView?.reflow();
}
/**
 * Syncs horizontal scroll position of pinned rows with the table body.
 *
 * @param e
 * Scroll event payload.
 *
 * @param e.scrollLeft
 * Horizontal scroll offset.
 *
 * @param e.scrollTop
 * Vertical scroll offset (unused).
 */
function onTableBodyScroll(e) {
    void e.scrollTop;
    this.rowPinningView?.syncHorizontalScroll(e.scrollLeft || 0);
}
/**
 * Destroys the row pinning view and cleans up its reference on the table.
 */
function destroyRowPinningView() {
    this.rowPinningView?.destroy();
    delete this.rowPinningView;
}
/**
 * Caches the materialized row data in the row pinning controller.
 */
function rememberMaterializedRowData() {
    this.viewport.grid.rowPinning?.rememberMaterializedRow(this.id, this.data);
}
/**
 * Syncs HTML attributes of a rendered row into its pinned mirror rows.
 */
function syncRenderedRowAttrs() {
    this.viewport.rowPinningView?.updateRowAttributes(this);
}
/**
 * Propagates an edited cell value to pinned mirror rows of the same data row.
 */
function syncEditedCellMirrors() {
    if (this instanceof PinnedTableCell) {
        return;
    }
    const rowId = this.row.id;
    if (rowId === void 0) {
        return;
    }
    const sourceColumnId = this.column.viewport.grid.columnPolicy
        .getColumnSourceId(this.column.id);
    if (!sourceColumnId) {
        return;
    }
    this.row.viewport.grid.rowPinning?.updatePinnedRowValue(rowId, this.column.id, this.value);
    if (!this.row.viewport.grid.querying.willNotModify()) {
        return;
    }
    void this.row.viewport.rowPinningView?.syncRenderedMirrors(rowId, this.column.id, this.value, this.row, sourceColumnId);
}
/**
 * Syncs row pinning state before a grid update is applied.
 *
 * @param e
 * Pending update payload.
 *
 * @param e.options
 * Pending update options.
 *
 * @param e.scope
 * Update scope.
 */
function onBeforeGridUpdate(e) {
    const updateOptions = e.options;
    if (!updateOptions || typeof updateOptions !== 'object') {
        return;
    }
    syncPinningIdColumnOption(updateOptions);
    if (hasOwnPath(updateOptions, ['rendering', 'rows', 'pinning'])) {
        this.rowPinning?.markOptionsDirty();
    }
    if (this.rowPinning &&
        hasDataSourceOptionChanges(updateOptions)) {
        this.rowPinning.invalidatePinnedRowObjects();
    }
}
/**
 * Returns whether a row pinning built-in action should be visible.
 *
 * @param cell
 * Context menu cell context.
 *
 * @param cell.row
 * Row context.
 *
 * @param cell.row.viewport
 * Viewport context.
 *
 * @param cell.row.viewport.grid
 * Owning grid instance.
 *
 * @param rowId
 * Current row identifier.
 */
function isRowPinningActionVisible(cell, rowId) {
    const { grid } = cell.row.viewport;
    return (rowId !== void 0 &&
        hasConfiguredGridRowPinningOptions(grid) &&
        grid.rowPinning?.isOptionEnabled() === true);
}
/**
 * Returns whether a row pinning built-in action should be disabled.
 *
 * @param actionId
 * Built-in action identifier.
 *
 * @param cell
 * Context menu cell context.
 *
 * @param cell.row
 * Row context.
 *
 * @param cell.row.id
 * Current row identifier.
 *
 * @param cell.row.viewport
 * Viewport context.
 *
 * @param cell.row.viewport.grid
 * Owning grid instance.
 *
 * @param rowId
 * Current row identifier.
 */
function isRowPinningActionDisabled(actionId, cell, rowId) {
    const { grid } = cell.row.viewport;
    if (rowId === void 0 ||
        !hasConfiguredGridRowPinningOptions(grid) ||
        grid.rowPinning?.isOptionEnabled() !== true) {
        return true;
    }
    const pinned = grid.rowPinning?.getPinnedRows() ||
        defaultPinnedRowsState;
    const inTop = pinned.topIds.includes(rowId);
    const inBottom = pinned.bottomIds.includes(rowId);
    if (actionId === 'pinRowTop') {
        return inTop;
    }
    if (actionId === 'pinRowBottom') {
        return inBottom;
    }
    return !inTop && !inBottom;
}
/**
 * Returns whether an object defines every segment in a nested path.
 *
 * @param obj
 * Object to inspect.
 *
 * @param path
 * Property path to verify.
 */
function hasOwnPath(obj, path) {
    let cursor = obj;
    for (const segment of path) {
        if (!cursor ||
            typeof cursor !== 'object' ||
            !Object.prototype.hasOwnProperty.call(cursor, segment)) {
            return false;
        }
        cursor = cursor[segment];
    }
    return true;
}
/**
 * Mirrors `rendering.rows.pinning.idColumn` into `data.idColumn`.
 *
 * @param options
 * Options object to normalize.
 */
function syncPinningIdColumnOption(options) {
    if (!options || typeof options !== 'object') {
        return;
    }
    const rendering = options.rendering;
    const idColumn = rendering?.rows?.pinning?.idColumn;
    if (!idColumn) {
        return;
    }
    if (!options.data) {
        options.data = {};
    }
    if (options.data?.idColumn === void 0) {
        options.data.idColumn = idColumn;
    }
}
/**
 * Returns whether an update includes a data source change.
 *
 * @param options
 * Update options to inspect.
 */
function hasDataSourceOptionChanges(options) {
    return (Object.prototype.hasOwnProperty.call(options, 'data') ||
        Object.prototype.hasOwnProperty.call(options, 'dataTable'));
}
export default {
    compose
};
