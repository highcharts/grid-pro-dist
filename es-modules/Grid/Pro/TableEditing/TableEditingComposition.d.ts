import type Grid from '../../Core/Grid';
import type { DeepPartial } from '../../../Shared/Types';
import type Options from '../../Core/Options';
import TableEditingController, { type TableEditingOptions } from './TableEditingController.js';
/**
 * Default options for structural table editing.
 */
export declare const defaultOptions: DeepPartial<Options>;
/**
 * Language options for the table editing feature.
 */
export interface TableEditingLangOptions {
    /**
     * Label used for the built-in row editing context menu group.
     *
     * @default 'Rows'
     */
    rows?: string;
    /**
     * Label used for the built-in column editing context menu group.
     *
     * @default 'Columns'
     */
    columns?: string;
    /**
     * Label used for the built-in "add row above" action.
     *
     * @default 'Add row above'
     */
    addRowAbove?: string;
    /**
     * Label used for the built-in "add row below" action.
     *
     * @default 'Add row below'
     */
    addRowBelow?: string;
    /**
     * Label used for the built-in "delete row" action.
     *
     * @default 'Delete row'
     */
    deleteRow?: string;
    /**
     * Label used for the built-in "add column before" action.
     *
     * @default 'Add column before'
     */
    addColumnBefore?: string;
    /**
     * Label used for the built-in "add column after" action.
     *
     * @default 'Add column after'
     */
    addColumnAfter?: string;
    /**
     * Label used for the built-in "delete column" action.
     *
     * @default 'Delete column'
     */
    deleteColumn?: string;
}
/**
 * Extends Grid Pro with structural table editing.
 *
 * @param GridClass
 * The class to extend.
 */
export declare function compose(GridClass: typeof Grid): void;
declare module '../../Core/Grid' {
    export default interface Grid {
        /**
         * Structural table editing controller.
         */
        tableEditing?: TableEditingController;
    }
}
declare module '../../Core/Options' {
    interface Options {
        /**
         * Options for built-in structural table editing.
         *
         * @sample grid-pro/basic/table-editing Table editing
         */
        tableEditing?: TableEditingOptions;
    }
    interface LangOptions {
        /**
         * Language options for the table editing feature.
         */
        tableEditing?: TableEditingLangOptions;
    }
}
declare module '../../Core/Table/CellContextMenu/CellContextMenuOptions' {
    interface CellContextMenuBuiltInActionIdRegistry {
        addRowAbove: never;
        addRowBelow: never;
        deleteRow: never;
        addColumnBefore: never;
        addColumnAfter: never;
        deleteColumn: never;
    }
    interface CellContextMenuBuiltInGroupIdRegistry {
        rows: never;
        columns: never;
    }
}
declare const _default: {
    compose: typeof compose;
    defaultOptions: DeepPartial<Options>;
};
export default _default;
