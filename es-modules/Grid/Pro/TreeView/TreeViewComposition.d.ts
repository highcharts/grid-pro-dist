import type Grid from '../../Core/Grid';
import type Table from '../../Core/Table/Table';
import type TableCell from '../../Core/Table/Body/TableCell';
import type { TreeViewOptions } from './TreeViewTypes';
import type { AfterTreeRowToggleEvent, BeforeTreeRowToggleEvent } from './TreeProjectionController';
import TreeProjectionController from './TreeProjectionController.js';
import TreeStickyRowController from './TreeStickyRowController.js';
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
 */
export declare function compose(GridClass: typeof Grid, TableClass: typeof Table, TableCellClass: typeof TableCell): void;
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
         * @sample grid-pro/tree-view/parent-id Parent ID tree input
         * @sample grid-pro/tree-view/input-path Path tree input
         */
        treeView?: TreeViewOptions;
    }
}
declare const _default: {
    readonly compose: typeof compose;
};
export default _default;
