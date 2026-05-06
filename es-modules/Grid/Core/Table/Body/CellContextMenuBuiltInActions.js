/* *
 *
 *  Grid Cell Context Menu built-in actions
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
 *  Authors:
 *  - Mikkel Espolin Birkeland
 *
 * */
'use strict';
import { isArray, isNumber, isObject, isString } from '../../../../Shared/Utilities.js';
/* *
 *
 *  Constants
 *
 * */
const warnedUnknownActionIds = new Set();
export const defaultBuiltInCellContextMenuActions = [];
const builtInActionDefinitions = {};
/**
 * Registers one built-in context menu action.
 *
 * @param actionId
 * Built-in action identifier.
 *
 * @param definition
 * Action behavior definition.
 *
 * @param useByDefault
 * Whether the action should be added to the default menu set.
 */
export function registerBuiltInAction(actionId, definition, useByDefault = false) {
    builtInActionDefinitions[actionId] = definition;
    if (useByDefault &&
        !defaultBuiltInCellContextMenuActions.includes(actionId)) {
        defaultBuiltInCellContextMenuActions.push(actionId);
    }
}
/* *
 *
 *  Functions
 *
 * */
/**
 * Checks whether a context menu item is a divider item.
 *
 * @param item
 * Context menu item declaration.
 *
 * @return
 * True when the item is a divider.
 */
function isDivider(item) {
    return (typeof item === 'object' &&
        !!item &&
        'separator' in item &&
        item.separator === true);
}
/**
 * Checks whether an item is a built-in override declaration.
 *
 * @param item
 * Context menu item declaration.
 *
 * @return
 * True when the item is a built-in override.
 */
function isBuiltInOverride(item) {
    return (typeof item === 'object' &&
        !!item &&
        'actionId' in item);
}
/**
 * Checks whether an item contains nested submenu items.
 *
 * @param item
 * Context menu item declaration.
 *
 * @return
 * True when submenu items are provided.
 */
function hasNestedItems(item) {
    return (isObject(item, true) &&
        'items' in item &&
        isArray(item.items));
}
/**
 * Logs unknown built-in action ids once per id.
 *
 * @param actionId
 * Unknown action id.
 */
function warnUnknownBuiltInAction(actionId) {
    if (warnedUnknownActionIds.has(actionId)) {
        return;
    }
    warnedUnknownActionIds.add(actionId);
    // eslint-disable-next-line no-console
    console.warn(`Grid cell context menu: Unknown built-in actionId "${actionId}".`);
}
/**
 * Returns the current row id if available.
 *
 * @param cell
 * Table cell for the context menu.
 *
 * @return
 * Row id when available.
 */
function getCurrentRowId(cell) {
    const rowId = cell.row.id;
    if (isString(rowId) || isNumber(rowId)) {
        return rowId;
    }
}
/**
 * Returns the built-in action definition for a given action ID.
 *
 * @param actionId
 * Built-in action id.
 *
 * @return
 * Built-in action definition when known.
 */
function getBuiltInActionDefinition(actionId) {
    const definition = builtInActionDefinitions[actionId];
    if (definition) {
        return definition;
    }
    warnUnknownBuiltInAction(actionId);
}
/**
 * Resolves one built-in action declaration into a regular action item.
 *
 * @param actionId
 * Built-in action id.
 *
 * @param cell
 * Table cell for the context menu.
 *
 * @param override
 * Optional label/icon/disabled overrides.
 *
 * @param isBranch
 * Whether this item should be treated as a branch item.
 *
 * @return
 * Resolved action item or undefined for unknown action ids.
 */
function resolveBuiltInAction(actionId, cell, override, isBranch) {
    const definition = getBuiltInActionDefinition(actionId);
    if (!definition) {
        return;
    }
    const rowId = getCurrentRowId(cell);
    if (definition.isVisible && !definition.isVisible(cell, rowId)) {
        return;
    }
    const disabled = isBranch ?
        !!override?.disabled :
        definition.isDisabled(cell, rowId) || !!override?.disabled;
    return {
        label: override?.label || definition.getLabel(cell),
        icon: override?.icon || definition.icon,
        disabled,
        onClick: isBranch ?
            void 0 :
            () => {
                if (rowId === void 0) {
                    return;
                }
                definition.onClick(cell, rowId);
            }
    };
}
/**
 * Resolves raw item declarations recursively.
 *
 * @param cell
 * Table cell for the context menu.
 *
 * @param rawItems
 * Source item declarations.
 *
 * @param useDefaults
 * Whether omitted items should resolve to top-level defaults.
 *
 * @return
 * Resolved context menu items.
 */
function resolveCellContextMenuItemsAtLevel(cell, rawItems, useDefaults) {
    const sourceItems = rawItems === void 0 ?
        (useDefaults ? defaultBuiltInCellContextMenuActions : []) :
        rawItems;
    if (!sourceItems.length) {
        return [];
    }
    const resolved = [];
    for (const rawItem of sourceItems) {
        if (isDivider(rawItem)) {
            resolved.push(rawItem);
            continue;
        }
        const isBranchCandidate = hasNestedItems(rawItem);
        const childItems = isBranchCandidate ?
            resolveCellContextMenuItemsAtLevel(cell, rawItem.items, false) :
            [];
        const isBranch = childItems.length > 0;
        if (typeof rawItem === 'string') {
            const builtInItem = resolveBuiltInAction(rawItem, cell);
            if (builtInItem) {
                resolved.push(builtInItem);
            }
            continue;
        }
        if (isBuiltInOverride(rawItem)) {
            const builtInItem = resolveBuiltInAction(rawItem.actionId, cell, rawItem, isBranch);
            if (builtInItem) {
                if (isBranch) {
                    builtInItem.items = childItems;
                }
                resolved.push(builtInItem);
            }
            continue;
        }
        const customItem = {
            label: rawItem.label,
            icon: rawItem.icon,
            disabled: rawItem.disabled,
            onClick: isBranch ? void 0 : rawItem.onClick,
            items: isBranch ? childItems : void 0
        };
        resolved.push(customItem);
    }
    return resolved;
}
/**
 * Resolves context menu items, including built-in action declarations.
 *
 * @param cell
 * Table cell for the context menu.
 *
 * @return
 * Resolved context menu items.
 */
export function resolveCellContextMenuItems(cell) {
    const options = cell.column?.options.cells?.contextMenu;
    if (options?.enabled === false) {
        return [];
    }
    const items = resolveCellContextMenuItemsAtLevel(cell, options?.items, true);
    if (!items.length ||
        options?.enabled === true ||
        options?.items !== void 0) {
        return items;
    }
    return items.some((item) => !('separator' in item) && !item.disabled) ? items : [];
}
/* *
 *
 *  Default export
 *
 * */
/**
 * Built-in cell context menu action helpers.
 */
export default {
    defaultBuiltInCellContextMenuActions,
    registerBuiltInAction,
    resolveCellContextMenuItems
};
