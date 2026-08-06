import type Grid from '../../Core/Grid';
import type HeaderCell from '../../Core/Table/Header/HeaderCell';
import type Options from '../../Core/Options';
import type Table from '../../Core/Table/Table';
import type { DeepPartial } from '../../../Shared/Types';
import type TableCell from '../../Core/Table/Body/TableCell';
import type { RowId } from '../../Core/Data/DataProvider';
import type { DeprecatedTreeViewOptions, RowGroupingOptions, TreeExpandedLevels, TreeViewColumnAggregatorOption, TreeViewColumnOptions, TreeViewOptions } from './TreeViewTypes';
import type { AfterTreeRowToggleEvent, BeforeTreeRowToggleEvent } from './Projection/TreeProjectionController';
import type TreeStickyRowController from './UI/TreeStickyRowController';
import TreeProjectionController from './Projection/TreeProjectionController.js';
/**
 * Language options for the row grouping feature.
 */
export interface RowGroupingLangOptions {
    /**
     * Header of the generated group column, used when the column has no header
     * options configured.
     *
     * @default 'Group'
     */
    columnHeader?: string;
}
/**
 * Default options for the tree view and row grouping features.
 */
export declare const defaultOptions: DeepPartial<Options>;
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
export declare function compose(GridClass: typeof Grid, TableClass: typeof Table, TableCellClass: typeof TableCell, HeaderCellClass: typeof HeaderCell): void;
declare module '../../Core/Grid' {
    export default interface Grid {
        treeView?: TreeProjectionController;
    }
    interface RowMetaRecord {
        /**
         * Explicit expansion state override for the row.
         */
        expanded?: boolean;
    }
}
declare module '../../Core/Table/Table' {
    export default interface Table {
        treeStickyRowController?: TreeStickyRowController;
    }
}
declare module '../GridEvents' {
    interface GridEvents {
        /**
         * Callback function to be called before a tree row is toggled.
         *
         * Call `event.preventDefault()` to cancel the toggle.
         */
        beforeTreeRowToggle?: (e: BeforeTreeRowToggleEvent) => void;
        /**
         * Callback function to be called after a tree row is toggled.
         */
        afterTreeRowToggle?: (e: AfterTreeRowToggleEvent) => void;
    }
}
declare module '../../Core/Data/LocalDataProvider' {
    interface LocalDataProviderOptions {
        /**
         * Tree view options for local provider (Grid Pro module).
         *
         * @deprecated 3.1.0
         * @deprnote Use the root level `treeView` and `rowGrouping` instead.
         */
        treeView?: DeprecatedTreeViewOptions;
    }
}
declare module '../../Core/Options' {
    interface Options {
        /**
         * Tree view options, turning hierarchical data into expandable parent
         * and child rows.
         *
         * @sample grid-pro/tree-view/parent-id Parent ID tree input
         * @sample grid-pro/tree-view/input-path Path tree input
         */
        treeView?: TreeViewOptions;
        /**
         * Row grouping options, turning repeated values of the selected
         * columns into expandable group rows.
         *
         * @sample grid-pro/options/row-grouping Row grouping
         */
        rowGrouping?: RowGroupingOptions;
    }
    interface RowsSettings {
        /**
         * Number of tree levels expanded initially, or `'all'` to expand every
         * level. A row is initially expanded when its depth is lower than the
         * configured number of levels, or when its ID is listed in
         * `expandedRowIds`.
         *
         * Applies to `treeView` and `rowGrouping`.
         *
         * @default 0
         */
        expandedLevels?: TreeExpandedLevels;
        /**
         * Explicit set of row IDs expanded initially, in addition to the rows
         * expanded by `expandedLevels`.
         *
         * Applies to `treeView` and `rowGrouping`.
         *
         * @default []
         */
        expandedRowIds?: RowId[];
        /**
         * Enables sticky parent rows.
         *
         * Applies to `treeView` and `rowGrouping`.
         *
         * @sample grid-pro/tree-view/sticky-parents Sticky parents
         * @default true
         */
        stickyParents?: boolean;
    }
    interface ColumnOptions {
        /**
         * Aggregator used for parent rows of the projected tree, in the
         * `treeView` and `rowGrouping` features.
         *
         * When provided as a string, the function is applied to every row that
         * has children in the projected tree, overriding the row's source
         * value. Structural columns such as `data.idColumn`,
         * `treeView.input.pathColumn`, `treeView.input.parentIdColumn`, and
         * `rowGrouping.groupBy` columns never aggregate, even if configured.
         *
         * When provided as a callback, it is invoked for matching parent rows
         * and should return a registered Formula processor function name, or a
         * falsy value to skip aggregation for the current row.
         *
         * Set it in `columnDefaults` to aggregate every column the same way,
         * and to `false` in a single column to reset that default.
         *
         * @sample grid-pro/tree-view/data-aggregation TreeView data aggregation
         * @sample grid-pro/options/row-grouping Row grouping
         */
        rowAggregator?: TreeViewColumnAggregatorOption;
        /**
         * TreeView options for a single column.
         *
         * @deprecated 3.1.0
         * @deprnote Use the column level `rowAggregator` option instead.
         */
        treeView?: TreeViewColumnOptions;
    }
    interface LangOptions {
        /**
         * Language options for the row grouping feature.
         */
        rowGrouping?: RowGroupingLangOptions;
    }
}
declare const _default: {
    readonly compose: typeof compose;
    readonly defaultOptions: DeepPartial<Options>;
};
export default _default;
