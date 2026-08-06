/* *
 *
 *  Grid Tree View Composition
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  Integration of this software requires a license.
 *  - For commercial use, see www.highcharts.com/license
 *  - For non-commercial, see www.highcharts.com/license-eula
 *
 *  Authors:
 *  - Dawid Dragula
 *
 * */
'use strict';
import FilteringController from '../../Core/Querying/FilteringController.js';
import Globals from '../../Core/Globals.js';
import TableRow from '../../Core/Table/Body/TableRow.js';
import { defaultOptions as gridDefaultOptions } from '../../Core/Defaults.js';
import { setHTMLContent } from '../../Core/GridUtils.js';
import TreeProjectionController from './Projection/TreeProjectionController.js';
import TreeViewValidation from './TreeViewValidation.js';
import { decorateTreeViewCell } from './UI/TreeViewCellDecorator.js';
import { createTreeToggleListeners, removeTreeToggleListeners } from './UI/TreeViewTableInteractions.js';
import { getTreeViewRowId, syncTreeViewRowId } from './TreeViewRowResolver.js';
import { addEvent, merge, pushUnique } from '../../../Shared/Utilities.js';
/**
 * Default options for the tree view and row grouping features.
 */
export const defaultOptions = {
    lang: {
        rowGrouping: {
            columnHeader: 'Group'
        }
    }
};
const treeToggleAttribute = 'data-hcg-tree-toggle';
const treeToggleListeners = new WeakMap();
/**
 * Composes Grid Pro with TreeView projection infrastructure.
 *
 * @param GridClass
 * Grid class to extend.
 *
 * @param TableClass
 * Table class to extend.
 *
 * @param TableCellClass
 * TableCell class to extend.
 *
 * @param HeaderCellClass
 * HeaderCell class to extend.
 */
export function compose(GridClass, TableClass, TableCellClass, HeaderCellClass) {
    if (!pushUnique(Globals.composed, 'TreeView')) {
        return;
    }
    merge(true, gridDefaultOptions, defaultOptions);
    TreeViewValidation.registerTreeViewValidationRules();
    addEvent(GridClass, 'beforeLoad', onBeforeLoad);
    addEvent(GridClass, 'afterLoad', onAfterLoad);
    addEvent(GridClass, 'beforeDestroy', onBeforeDestroy);
    addEvent(GridClass, 'afterRedraw', onAfterRedraw);
    addEvent(GridClass, 'beforeTreeRowToggle', onBeforeTreeRowToggle);
    addEvent(GridClass, 'afterTreeRowToggle', onAfterTreeRowToggle);
    addEvent(GridClass, 'resolveFilterCondition', onResolveFilterCondition);
    addEvent(GridClass, 'projectPresentationTable', onProjectPresentationTable);
    addEvent(TableClass, 'beforeInit', onTableBeforeInit);
    addEvent(TableClass, 'afterInit', onTableAfterInit);
    addEvent(TableClass, 'afterReflow', onTableAfterReflow);
    addEvent(TableClass, 'beforeRestoreCellFocus', onTableBeforeRestoreCellFocus);
    addEvent(TableClass, 'getViewportTopInset', onTableGetViewportTopInset);
    addEvent(TableClass, 'afterDestroy', onTableAfterDestroy);
    addEvent(TableRow, 'afterUpdateAttributes', onRowAfterUpdateAttributes);
    addEvent(TableCellClass, 'getEditability', onCellGetEditability);
    addEvent(TableCellClass, 'afterDataMutation', onCellAfterDataMutation);
    addEvent(TableCellClass, 'afterRender', onAfterCellRender);
    addEvent(HeaderCellClass, 'afterRender', onAfterHeaderCellRender);
}
/**
 * Applies the default header of the generated row grouping column.
 *
 * @param e
 * Header cell render event payload.
 *
 * @param e.column
 * Rendered column, when the header cell is bound to one.
 */
function onAfterHeaderCellRender(e) {
    const column = e.column;
    const headerContent = this.headerContent;
    if (!column || !headerContent) {
        return;
    }
    const grid = column.viewport.grid;
    const sourceColumnId = grid.columnPolicy.getColumnSourceId(column.id) ||
        column.id;
    const headerOptions = column.options.header;
    if (headerOptions?.format ||
        headerOptions?.formatter ||
        !grid.treeView?.isGroupingDisplayColumn(sourceColumnId)) {
        return;
    }
    const columnHeader = grid.options?.lang?.rowGrouping?.columnHeader;
    if (columnHeader) {
        this.value = columnHeader;
        setHTMLContent(headerContent, columnHeader);
    }
}
/**
 * Prevents viewport body focus restoration when the target cell is already
 * focused in the sticky overlay.
 *
 * @param event
 * Focus restoration event emitted by the viewport.
 */
function onTableBeforeRestoreCellFocus(event) {
    const stickyCell = this.treeStickyRowController?.getRenderedStickyCell(event.rowIndex, event.columnIndex);
    if (stickyCell?.htmlElement === document.activeElement) {
        event.preventDefault?.();
    }
}
/**
 * Initializes TreeView projection infrastructure before first data querying.
 */
function onBeforeLoad() {
    if (!this.treeView) {
        this.treeView = new TreeProjectionController(this);
    }
}
/**
 * Schedules sticky parent row refresh after initial render.
 */
function onAfterLoad() {
    this.viewport?.treeStickyRowController?.scheduleRefresh(false, true);
}
/**
 * Cleans up TreeView projection infrastructure on Grid destroy.
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
    this.treeView?.destroy();
    delete this.treeView;
}
/**
 * Runs grid callback before a tree row toggle.
 *
 * @param e
 * Tree row toggle event payload.
 */
function onBeforeTreeRowToggle(e) {
    this.options?.events?.beforeTreeRowToggle?.call(this, e);
}
/**
 * Runs grid callback after a tree row toggle.
 *
 * @param e
 * Tree row toggle event payload.
 */
function onAfterTreeRowToggle(e) {
    this.options?.events?.afterTreeRowToggle?.call(this, e);
}
/**
 * Schedules sticky parent row refresh after grid redraws.
 */
function onAfterRedraw() {
    this.viewport?.treeStickyRowController?.scheduleRefresh(true, true);
}
/**
 * Redirects filtering of the generated row grouping column to the source
 * columns it is built from, since the column itself does not exist in the
 * source table the filter modifier runs on.
 *
 * @param e
 * Filter condition event payload.
 */
function onResolveFilterCondition(e) {
    const input = this.treeView?.options?.input;
    if (!e.condition ||
        input?.type !== 'grouping' ||
        e.sourceColumnId !== input.groupColumnId) {
        return;
    }
    const conditions = [];
    for (let i = 0, iEnd = input.groupBy.length; i < iEnd; ++i) {
        const condition = FilteringController.mapOptionsToFilter(input.groupBy[i], e.options);
        if (condition) {
            conditions.push(condition);
        }
    }
    const first = conditions[0];
    if (conditions.length < 2) {
        e.condition = first;
        return;
    }
    // Group values match on any level, but negated operators, e.g.
    // `doesNotContain`, have to hold on every level.
    const isNegated = typeof first !== 'function' && (first.operator === 'not' ||
        first.operator === '!==' ||
        first.operator === '!=');
    e.condition = {
        operator: isNegated ? 'and' : 'or',
        conditions
    };
}
/**
 * Projects the queried table through TreeView before pagination.
 *
 * @param e
 * Presentation table event fired after sort/filter and before pagination.
 *
 * @param e.table
 * Queried table after filter/sort and before pagination.
 */
function onProjectPresentationTable(e) {
    const controller = this.treeView;
    if (!controller) {
        return;
    }
    try {
        controller.sync();
        this.columnPolicy.setHiddenSourceColumnIds(controller.getHiddenSourceColumnIds());
        TreeViewValidation.syncTreePathValidationRules(this);
        e.table = controller.projectTable(e.table);
        this.columnPolicy.setAvailableSourceColumnIds(e.table.getColumnIds());
    }
    catch (error) {
        this.columnPolicy.setHiddenSourceColumnIds();
        // eslint-disable-next-line no-console
        console.error(error.message || error);
    }
}
/**
 * Vetoes editing for structural TreeView cells and cells currently derived
 * by TreeView aggregation.
 *
 * @param e
 * Editability event fired by the body cell.
 */
function onCellGetEditability(e) {
    const controller = this.row.viewport.grid.treeView;
    const sourceColumnId = this.row.viewport.grid.columnPolicy
        .getColumnSourceId(this.column.id) || this.column.id;
    const input = controller?.options?.input;
    const rowId = getTreeViewRowId(this.row, controller?.getProjectionState());
    const isStructurallyReadonly = !!(controller?.isTreeSpecialColumn(sourceColumnId) &&
        !(input?.type === 'path' &&
            sourceColumnId === input.pathColumn));
    if (isStructurallyReadonly ||
        controller?.isCellDerived(rowId, this.column.id) ||
        controller?.isGeneratedRow(rowId)) {
        e.editable = false;
    }
}
/**
 * Returns whether a mutation of the source column affects TreeView structure.
 *
 * @param input
 * Resolved TreeView input options.
 *
 * @param sourceColumnId
 * Source column ID that has changed.
 */
function isTreeStructureMutation(input, sourceColumnId) {
    if (!input) {
        return false;
    }
    switch (input.type) {
        case 'path':
            return sourceColumnId === input.pathColumn;
        case 'parentId':
            return sourceColumnId === input.parentIdColumn;
        case 'grouping':
            return input.groupBy.indexOf(sourceColumnId) !== -1;
    }
}
/**
 * Requests a full row refresh when a TreeView aggregate source changes.
 *
 * @param e
 * Data mutation event fired after a cell writes to the data provider.
 */
function onCellAfterDataMutation(e) {
    const controller = this.row.viewport.grid.treeView;
    const mutatesTreeStructure = isTreeStructureMutation(controller?.options?.input, e.sourceColumnId);
    if (controller?.hasColumnAggregation(e.sourceColumnId) ||
        mutatesTreeStructure) {
        this.row.viewport.grid.querying.shouldBeUpdated = true;
        e.requiresFullRowsUpdate = true;
    }
}
/**
 * Adds delegated listeners for tree toggle buttons and keyboard shortcuts.
 */
function onTableBeforeInit() {
    treeToggleListeners.set(this, createTreeToggleListeners(this, treeToggleAttribute));
    this.afterUpdateRowsHooks.push(() => {
        const stickyRowController = this.treeStickyRowController;
        if (!stickyRowController) {
            return Promise.resolve();
        }
        return stickyRowController.refreshNow(true, true);
    });
}
/**
 * Adds scroll listener for sticky parent row positioning after the table is
 * fully initialized.
 */
function onTableAfterInit() {
    const listeners = treeToggleListeners.get(this);
    if (!listeners) {
        return;
    }
    const scrollListener = () => {
        this.treeStickyRowController?.handleScroll();
    };
    this.tbodyElement.addEventListener('scroll', scrollListener);
    listeners.scroll = scrollListener;
    this.treeStickyRowController?.scheduleRefresh(false, true);
}
/**
 * Repositions sticky parent rows after table reflow.
 */
function onTableAfterReflow() {
    this.treeStickyRowController?.scheduleRefresh(false, true);
}
/**
 * Extends the visible viewport inset by the current sticky tree stack height.
 *
 * @param e
 * Event payload with the current top inset.
 *
 * @param e.top
 * Current top inset reserved by composed table features.
 */
function onTableGetViewportTopInset(e) {
    e.top = Math.max(e.top, this.treeStickyRowController?.getStickyRowsHeight() || 0);
}
/**
 * Removes delegated tree interaction listeners and sticky row state.
 */
function onTableAfterDestroy() {
    const listeners = treeToggleListeners.get(this);
    if (!listeners) {
        return;
    }
    removeTreeToggleListeners(this, listeners);
    if (listeners.scroll) {
        this.tbodyElement.removeEventListener('scroll', listeners.scroll);
    }
    treeToggleListeners.delete(this);
}
/**
 * Synchronizes rendered row IDs with the active TreeView projection.
 */
function onRowAfterUpdateAttributes() {
    syncTreeViewRowId(this, this.viewport.grid.treeView?.getProjectionState());
}
/**
 * Flags aggregated TreeView cells and decorates tree column cells.
 */
function onAfterCellRender() {
    decorateTreeViewCell(this, treeToggleAttribute);
}
/* *
 *
 *  Default export
 *
 * */
export default {
    compose,
    defaultOptions
};
