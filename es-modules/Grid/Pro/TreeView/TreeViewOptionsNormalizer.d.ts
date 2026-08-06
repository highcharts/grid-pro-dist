import type { Options } from '../../Core/Options';
import type { RowId } from '../../Core/Data/DataProvider';
import type { DeprecatedTreeViewOptions, TreeInputPathSeparator, TreeExpandedLevels } from './TreeViewTypes';
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
export interface NormalizedTreeInputGroupingOptions {
    type: 'grouping';
    groupBy: string[];
    groupColumnId: string;
    hideGroupByColumns: boolean;
}
export type NormalizedTreeInputOptions = (NormalizedTreeInputGroupingOptions | NormalizedTreeInputParentIdOptions | NormalizedTreeInputPathOptions);
export interface NormalizedTreeViewOptions {
    input?: NormalizedTreeInputOptions;
    treeColumn?: string;
    expandedLevels: TreeExpandedLevels;
    expandedRowIds: RowId[];
    stickyParents: boolean;
}
export interface ResolvedTreeViewOptions extends NormalizedTreeViewOptions {
    input: NormalizedTreeInputOptions;
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
export declare function normalizeTreeViewOptions(options?: Options, deprecatedTreeView?: DeprecatedTreeViewOptions): NormalizedTreeViewOptions | undefined;
