/* *
 *
 *  Grid Tree View Options Normalizer
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
import { merge } from '../../../Shared/Utilities.js';
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
 * Validates and normalizes TreeView options from Grid config.
 *
 * @param treeView
 * Raw TreeView options.
 *
 * @returns
 * Normalized options or `undefined` when TreeView is disabled.
 */
export function normalizeTreeViewOptions(treeView) {
    if (!treeView || treeView.enabled === false) {
        return;
    }
    const expandedRowIds = treeView.expandedRowIds ?? [];
    const normalizedInput = (!treeView.input ?
        void 0 :
        treeView.input.type === 'path' ?
            merge(defaultPathInput, treeView.input) :
            merge(defaultParentIdInput, treeView.input));
    return {
        input: normalizedInput,
        treeColumn: treeView.treeColumn,
        expandedRowIds: (expandedRowIds === 'all' ?
            expandedRowIds :
            expandedRowIds.slice()),
        stickyParents: treeView.stickyParents !== false
    };
}
