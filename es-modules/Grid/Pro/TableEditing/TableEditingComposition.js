/* *
 *
 *  Grid Pro table editing composition
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  Integration of this software requires a license.
 *  - For commercial use, see www.highcharts.com/license
 *  - For non-commercial, see www.highcharts.com/license-eula
 *
 * */
'use strict';
import { defaultOptions as gridDefaultOptions } from '../../Core/Defaults.js';
import Globals from '../../Core/Globals.js';
import { registerBuiltInAction, registerBuiltInGroup } from '../../Core/Table/CellContextMenu/CellContextMenuBuiltInActions.js';
import TableEditingController from './TableEditingController.js';
import { addEvent, merge, pushUnique } from '../../../Shared/Utilities.js';
/* *
 *
 *  Composition
 *
 * */
/**
 * Default options for structural table editing.
 */
export const defaultOptions = {
    lang: {
        tableEditing: {
            rows: 'Rows',
            columns: 'Columns',
            addRowAbove: 'Add row above',
            addRowBelow: 'Add row below',
            deleteRow: 'Delete row',
            addColumnBefore: 'Add column before',
            addColumnAfter: 'Add column after',
            deleteColumn: 'Delete column'
        }
    },
    tableEditing: {
        enabled: false
    }
};
/**
 * Extends Grid Pro with structural table editing.
 *
 * @param GridClass
 * The class to extend.
 */
export function compose(GridClass) {
    if (!pushUnique(Globals.composed, 'TableEditing')) {
        return;
    }
    merge(true, gridDefaultOptions, defaultOptions);
    registerBuiltInActions();
    addEvent(GridClass, 'beforeLoad', initTableEditing);
}
/**
 * Registers table editing built-in context menu actions and groups.
 */
function registerBuiltInActions() {
    registerBuiltInAction('addRowAbove', {
        getLabel: (context) => context.grid.options?.lang?.tableEditing?.addRowAbove || '',
        icon: 'addRowAbove',
        isVisible: isRowActionVisible,
        onClick: (context) => {
            void context.grid.tableEditing?.addRowAbove(context);
        }
    });
    registerBuiltInAction('addRowBelow', {
        getLabel: (context) => context.grid.options?.lang?.tableEditing?.addRowBelow || '',
        icon: 'addRowBelow',
        isVisible: isRowActionVisible,
        onClick: (context) => {
            void context.grid.tableEditing?.addRowBelow(context);
        }
    });
    registerBuiltInAction('deleteRow', {
        getLabel: (context) => context.grid.options?.lang?.tableEditing?.deleteRow || '',
        icon: 'trash',
        isVisible: isRowActionVisible,
        onClick: (context) => {
            void context.grid.tableEditing?.deleteRow(context);
        }
    });
    registerBuiltInAction('addColumnBefore', {
        getLabel: (context) => context.grid.options?.lang?.tableEditing?.addColumnBefore || '',
        icon: 'addColumnLeft',
        isVisible: isColumnActionVisible,
        onClick: (context) => {
            void context.grid.tableEditing?.addColumnBefore(context);
        }
    });
    registerBuiltInAction('addColumnAfter', {
        getLabel: (context) => context.grid.options?.lang?.tableEditing?.addColumnAfter || '',
        icon: 'addColumnRight',
        isVisible: isColumnActionVisible,
        onClick: (context) => {
            void context.grid.tableEditing?.addColumnAfter(context);
        }
    });
    registerBuiltInAction('deleteColumn', {
        getLabel: (context) => context.grid.options?.lang?.tableEditing?.deleteColumn || '',
        icon: 'trash',
        isVisible: isColumnActionVisible,
        isDisabled: (context) => !context.grid.tableEditing?.canDeleteColumn(context),
        onClick: (context) => {
            void context.grid.tableEditing?.deleteColumn(context);
        }
    });
    registerBuiltInGroup('rows', {
        getLabel: (context) => context.grid.options?.lang?.tableEditing?.rows || '',
        icon: 'addRowBelow',
        isVisible: isRowActionVisible,
        items: ['addRowAbove', 'addRowBelow', 'deleteRow']
    }, true);
    registerBuiltInGroup('columns', {
        getLabel: (context) => context.grid.options?.lang?.tableEditing?.columns || '',
        icon: 'addColumnRight',
        isVisible: isColumnActionVisible,
        items: ['addColumnBefore', 'addColumnAfter', 'deleteColumn']
    }, true);
}
/**
 * Creates the table editing controller for a grid instance.
 */
function initTableEditing() {
    this.tableEditing = new TableEditingController(this);
}
/**
 * Returns whether row actions should be visible.
 *
 * @param context
 * Context menu runtime context.
 */
function isRowActionVisible(context) {
    return context.grid.tableEditing?.canEditRows(context) === true;
}
/**
 * Returns whether column actions should be visible.
 *
 * @param context
 * Context menu runtime context.
 */
function isColumnActionVisible(context) {
    return context.grid.tableEditing?.canEditColumns(context) === true;
}
/* *
 *
 *  Default Export
 *
 * */
export default {
    compose,
    defaultOptions
};
