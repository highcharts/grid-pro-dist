/* *
 *
 *  Grid Tree View Options Normalizer
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
import { isArray, isString, merge } from '../../../Shared/Utilities.js';
const defaultParentIdInput = {
    type: 'parentId',
    parentIdColumn: 'parentId'
};
const defaultPathInput = {
    type: 'path',
    pathColumn: 'path',
    separator: '/',
    showFullPath: false
};
/* *
 *
 *  Functions
 *
 * */
/**
 * Normalizes row grouping column definitions.
 *
 * @param groupBy
 * Raw grouping column or columns.
 *
 * @returns
 * Normalized grouping column IDs.
 */
function normalizeGroupBy(groupBy) {
    if (isArray(groupBy)) {
        return groupBy.slice();
    }
    return isString(groupBy) ? [groupBy] : [];
}
/**
 * Normalizes the tree input definition of the tree view options.
 *
 * @param input
 * Raw tree input options.
 *
 * @returns
 * Normalized input, or `undefined` when the input should be autodetected.
 */
function normalizeTreeInput(input) {
    if (!input) {
        return;
    }
    return merge(input.type === 'path' ? defaultPathInput : defaultParentIdInput, input);
}
/**
 * Normalizes row grouping options into a grouping tree input.
 *
 * @param rowGrouping
 * Raw row grouping options.
 *
 * @returns
 * Normalized grouping input.
 */
function normalizeGroupingInput(rowGrouping) {
    return {
        type: 'grouping',
        groupBy: normalizeGroupBy(rowGrouping.groupBy),
        groupColumnId: rowGrouping.groupColumnId || 'group',
        hideGroupByColumns: rowGrouping.hideGroupByColumns !== false
    };
}
/**
 * Validates and normalizes TreeView options from Grid config.
 *
 * Tree view takes precedence when both tree view and row grouping are enabled.
 *
 * @param options
 * Grid options.
 *
 * @param deprecatedTreeView
 * Tree view options of the local data provider.
 *
 * @returns
 * Normalized options or `undefined` when both features are disabled.
 */
export function normalizeTreeViewOptions(options, 
// TODO: Remove deprecated option before releasing next major
deprecatedTreeView) {
    let treeView;
    if (options?.treeView?.enabled) {
        treeView = options.treeView;
    }
    else if (deprecatedTreeView?.enabled) {
        // TODO: Remove deprecated option before releasing next major
        treeView = deprecatedTreeView;
    }
    const rowGrouping = options?.rowGrouping?.enabled ?
        options.rowGrouping :
        void 0;
    let input;
    if (treeView) {
        input = normalizeTreeInput(treeView.input);
    }
    else if (rowGrouping) {
        input = normalizeGroupingInput(rowGrouping);
    }
    else {
        return;
    }
    const rows = options?.rendering?.rows;
    // TODO: Remove deprecated option before releasing next major
    // Options moved to `rendering.rows` are read from the data provider
    // options only when the deprecated `data.treeView` is the active source.
    const deprecatedRows = treeView === deprecatedTreeView ?
        deprecatedTreeView :
        void 0;
    // TODO: Remove deprecated option before releasing next major
    // The deprecated option accepted `'all'`, which is now expressed by
    // `rendering.rows.expandedLevels`.
    const deprecatedExpandedRowIds = deprecatedRows?.expandedRowIds;
    const deprecatedExpandAll = deprecatedExpandedRowIds === 'all';
    const expandedRowIds = (rows?.expandedRowIds ??
        (deprecatedExpandAll ? void 0 : deprecatedExpandedRowIds) ??
        []);
    return {
        input,
        treeColumn: treeView?.treeColumn,
        expandedLevels: (rows?.expandedLevels ??
            (deprecatedExpandAll ? 'all' : 0)),
        expandedRowIds: expandedRowIds.slice(),
        stickyParents: (rows?.stickyParents ??
            deprecatedRows?.stickyParents ??
            true),
        rowGroupingIgnored: !!(treeView && rowGrouping)
    };
}
