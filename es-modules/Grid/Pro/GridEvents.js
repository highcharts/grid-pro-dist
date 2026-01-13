/* *
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
import U from '../../Core/Utilities.js';
import Globals from '../../Core/Globals.js';
const { addEvent, fireEvent, pushUnique } = U;
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
/* *
 *
 *  Default Export
 *
 * */
/**
 * @internal
 */
export default { compose };
