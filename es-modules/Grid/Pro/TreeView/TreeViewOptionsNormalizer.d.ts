import type { TreeInputPathSeparator, TreeExpandedRowIds, TreeViewOptions } from './TreeViewTypes';
export interface NormalizedTreeInputParentIdOptions {
    type: 'parentId';
    parentIdColumn: string;
}
export interface NormalizedTreeInputPathOptions {
    type: 'path';
    pathColumn: string;
    separator: TreeInputPathSeparator;
    showFullPath: boolean;
}
export type NormalizedTreeInputOptions = (NormalizedTreeInputParentIdOptions | NormalizedTreeInputPathOptions);
export interface NormalizedTreeViewOptions {
    input?: NormalizedTreeInputOptions;
    treeColumn?: string;
    expandedRowIds: TreeExpandedRowIds;
    stickyParents: boolean;
}
export interface ResolvedTreeViewOptions {
    input: NormalizedTreeInputOptions;
    treeColumn?: string;
    expandedRowIds: TreeExpandedRowIds;
    stickyParents: boolean;
}
/**
 * Validates and normalizes TreeView options from Grid config.
 *
 * @param treeView
 * Raw TreeView options.
 *
 * @returns
 * Normalized options or `undefined` when TreeView is disabled.
 */
export declare function normalizeTreeViewOptions(treeView?: TreeViewOptions): NormalizedTreeViewOptions | undefined;
