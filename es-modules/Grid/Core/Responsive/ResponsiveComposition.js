/* *
 *
 *  Grid Responsive composition
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
 *
 *  Authors:
 *  - Dawid Dragula
 *
 * */
'use strict';
import Globals from '../../Core/Globals.js';
import { addEvent, defined, diffObjects, merge, pushUnique } from '../../../Shared/Utilities.js';
import { uniqueKey } from '../../../Core/Utilities.js';
/* *
 *
 *  Composition
 *
 * */
/**
 * Extends the grid classes with responsive options.
 *
 * @param GridClass
 * The class to extend.
 *
 */
export function compose(GridClass) {
    if (!pushUnique(Globals.composed, 'Responsive')) {
        return;
    }
    addEvent(GridClass, 'beforeRenderViewport', initResizeObserver);
    addEvent(GridClass, 'beforeDestroy', destroyResizeObserver);
}
/**
 * Initializes the resize observer.
 *
 * @param this
 * Reference to Grid.
 */
function initResizeObserver() {
    destroyResizeObserver.call(this);
    if (!this.container) {
        return;
    }
    this.activeRules = new Set();
    this.resizeObserver = new ResizeObserver((entries) => {
        onResize.call(this, entries[0]);
    });
    this.resizeObserver.observe(this.container);
}
/**
 * Destroys the resize observer.
 *
 * @param this
 * Reference to Grid.
 */
function destroyResizeObserver() {
    this.resizeObserver?.disconnect();
    delete this.activeRules;
}
/**
 * Checks if the responsive rule matches the current grid size.
 *
 * @param this
 * Reference to Grid.
 *
 * @param rule
 * The responsive rule to check.
 *
 * @param entry
 * The resize observer entry.
 */
function matchResponsiveRule(rule, entry) {
    const { maxWidth, maxHeight, minWidth, minHeight, callback } = rule.condition;
    return ((!defined(callback) || callback?.call(this, this)) &&
        (!defined(maxWidth) || entry.contentRect.width <= maxWidth) &&
        (!defined(maxHeight) || entry.contentRect.height <= maxHeight) &&
        (!defined(minWidth) || entry.contentRect.width >= minWidth) &&
        (!defined(minHeight) || entry.contentRect.height >= minHeight));
}
/**
 * Updates the grid based on the currently active responsive rules.
 *
 * @param this
 * Reference to Grid.
 *
 * @param matchingRules
 * Active responsive rules.
 */
function setResponsive(matchingRules) {
    const ruleIds = matchingRules.map((rule) => rule._id);
    const ruleIdsString = (ruleIds.toString() || void 0);
    const currentRuleIds = this.currentResponsive?.ruleIds;
    if (ruleIdsString === currentRuleIds) {
        return;
    }
    if (this.currentResponsive) {
        const undoOptions = this.currentResponsive.undoOptions;
        this.currentResponsive = void 0;
        this.updatingResponsive = true;
        void this.update(undoOptions, true);
        this.updatingResponsive = false;
    }
    if (ruleIdsString) {
        const mergedOptions = merge(...matchingRules.map((rule) => rule.gridOptions));
        const undoOptions = diffObjects(mergedOptions, this.options || {}, true);
        const columnUndoOptions = getColumnUndoOptions.call(this, mergedOptions);
        if (columnUndoOptions) {
            undoOptions.columns = columnUndoOptions;
        }
        else {
            syncColumnIds(undoOptions, mergedOptions);
        }
        this.currentResponsive = {
            ruleIds: ruleIdsString,
            mergedOptions,
            undoOptions
        };
        if (!this.updatingResponsive) {
            void this.update(mergedOptions, true);
        }
    }
}
/**
 * Builds undo options for columns by matching them by id.
 *
 * @param this
 * Reference to Grid.
 *
 * @param mergedOptions
 * The merged responsive options used to apply updates.
 */
function getColumnUndoOptions(mergedOptions) {
    const mergedColumns = mergedOptions.columns;
    const currentColumns = this.options?.columns;
    if (!mergedColumns || !currentColumns) {
        return;
    }
    const result = [];
    const columnMap = new Map();
    for (let i = 0, iEnd = currentColumns.length; i < iEnd; ++i) {
        const column = currentColumns[i];
        if (typeof column.id === 'string') {
            columnMap.set(column.id, column);
        }
    }
    for (let i = 0, iEnd = mergedColumns.length; i < iEnd; ++i) {
        const mergedColumn = mergedColumns[i];
        const columnId = (typeof mergedColumn?.id === 'string') ?
            mergedColumn.id :
            void 0;
        if (!mergedColumn || !columnId) {
            continue;
        }
        const currentColumn = columnMap.get(columnId);
        if (!currentColumn) {
            continue;
        }
        const columnUndo = diffObjects(mergedColumn, currentColumn, true);
        if (Object.keys(columnUndo).length > 0) {
            columnUndo.id = columnId;
            result.push(columnUndo);
        }
    }
    if (result.length) {
        return result;
    }
}
/**
 * Ensures column options keep their ids when undoing responsive updates.
 *
 * @param undoOptions
 * The undo options to be updated.
 *
 * @param mergedOptions
 * The merged responsive options used to apply updates.
 */
function syncColumnIds(undoOptions, mergedOptions) {
    const mergedColumns = mergedOptions.columns;
    const undoColumns = undoOptions.columns;
    if (!mergedColumns || !undoColumns) {
        return;
    }
    for (let i = 0, iEnd = Math.min(mergedColumns.length, undoColumns.length); i < iEnd; ++i) {
        const mergedColumn = mergedColumns[i];
        const undoColumn = undoColumns[i];
        if (mergedColumn && undoColumn && !('id' in undoColumn)) {
            undoColumn.id = mergedColumn.id;
        }
    }
}
/**
 * Handles the resize event.
 *
 * @param this
 * Reference to Grid.
 *
 * @param entry
 * The resize observer entry.
 */
function onResize(entry) {
    if (!this.activeRules) {
        return;
    }
    const rules = this.options?.responsive?.rules || [];
    const matchingRules = [];
    for (const rule of rules) {
        if (typeof rule._id === 'undefined') {
            rule._id = uniqueKey();
        }
        if (matchResponsiveRule.call(this, rule, entry)) {
            matchingRules.push(rule);
        }
    }
    this.activeRules = new Set(matchingRules);
    setResponsive.call(this, matchingRules);
}
/* *
 *
 *  Default Export
 *
 * */
export default {
    compose
};
