/* *
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  Integration of this software requires a license.
 *  - For commercial use, see www.highcharts.com/license
 *  - For non-commercial, see www.highcharts.com/license-eula
 *
 *
 *  Authors:
 *  - Dawid Draguła
 *
 * */
'use strict';
import Globals from '../../Core/Globals.js';
import { addEvent, fireEvent, isObject, pushUnique } from '../../Shared/Utilities.js';
const propagate = {
    'cell_mouseOver': function () {
        fireEvent(this.row.viewport.grid, 'cellMouseOver', {
            target: this
        });
    },
    'cell_mouseOut': function () {
        fireEvent(this.row.viewport.grid, 'cellMouseOut', {
            target: this
        });
    }
};
/* *
 *
 *  Functions
 *
 * */
/**
 * Composition to add events options to the Grid.
 *
 * @param GridClass
 * The class to extend.
 *
 * @param ColumnClass
 * The class to extend.
 *
 * @param HeaderCellClass
 * The class to extend.
 *
 * @param TableCellClass
 * The class to extend.
 *
 * @internal
 */
function compose(GridClass, ColumnClass, HeaderCellClass, TableCellClass) {
    if (!pushUnique(Globals.composed, 'GridEvents')) {
        return;
    }
    [
        'beforeLoad',
        'afterLoad',
        'beforeUpdate',
        'afterUpdate',
        'beforeRedraw',
        'afterRedraw'
    ].forEach((name) => {
        addEvent(GridClass, name, (e) => {
            const grid = e.target;
            grid.options?.events?.[name]?.call(grid, e);
        });
    });
    addEvent(GridClass, 'processUpdateDiff', (e) => {
        stripEventsFromDiff(e.diff);
    });
    [
        'mouseOver',
        'mouseOut',
        'dblClick',
        'click',
        'afterRender'
    ].forEach((name) => {
        addEvent(TableCellClass, name, (e) => {
            const cell = e.target;
            cell.column.options.cells?.events?.[name]?.call(cell);
            propagate['cell_' + name]?.call(cell);
        });
    });
    [
        'afterResize',
        'beforeSort',
        'afterSort',
        'beforeFilter',
        'afterFilter'
    ].forEach((name) => {
        addEvent(ColumnClass, name, (e) => {
            const column = e.target;
            column.options?.events?.[name]?.call(column);
        });
    });
    [
        'click',
        'afterRender'
    ].forEach((name) => {
        addEvent(HeaderCellClass, name, (e) => {
            const { column } = e;
            column?.options?.header?.events?.[name]?.call(column);
        });
    });
}
/**
 * Removes every `events` group from an update diff (in place), pruning
 * containers it empties. Event callbacks are read live, so they need no
 * re-render.
 *
 * @param diff
 * The update diff, stripped in place.
 */
function stripEventsFromDiff(diff) {
    for (const key of Object.keys(diff)) {
        if (key === 'events') {
            delete diff[key];
            continue;
        }
        const value = diff[key];
        // Recurse into plain option objects only, never class instances.
        if (isObject(value, true) && value.constructor === Object) {
            stripEventsFromDiff(value);
            if (Object.keys(value).length === 0) {
                delete diff[key];
            }
        }
    }
}
/* *
 *
 *  Default Export
 *
 * */
/**
 * @internal
 */
export default { compose };
