/* *
 *
 *  Grid Pro Pagination class
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
 *
 *  Authors:
 *  - Sebastian Bochan
 *
 * */
'use strict';
import Utilities from '../../../Core/Utilities.js';
import Globals from '../../../Core/Globals.js';
const { addEvent, pushUnique } = Utilities;
/* *
 *
 *  Composition
 *
 * */
/**
 * Extends the pagination class with events.
 *
 * @param PaginationClass
 * The class to extend.
 *
 * @internal
 */
export function compose(PaginationClass) {
    if (!pushUnique(Globals.composed, 'PaginationPro')) {
        return;
    }
    // Register pagination events
    addEvent(PaginationClass, 'beforePageChange', (e) => {
        const { target, currentPage, nextPage, pageSize } = e;
        target.options?.events?.beforePageChange?.call(target, {
            currentPage: currentPage,
            nextPage: nextPage,
            pageSize: pageSize
        });
    });
    addEvent(PaginationClass, 'afterPageChange', (e) => {
        const { target, currentPage, previousPage, pageSize } = e;
        target.options?.events?.afterPageChange?.call(target, {
            currentPage: currentPage,
            previousPage: previousPage,
            pageSize: pageSize
        });
    });
    addEvent(PaginationClass, 'beforePageSizeChange', (e) => {
        const { target, newPageSize, pageSize } = e;
        target.options?.events?.beforePageSizeChange?.call(target, {
            pageSize: pageSize,
            newPageSize: newPageSize
        });
    });
    addEvent(PaginationClass, 'afterPageSizeChange', (e) => {
        const { target, previousPageSize, pageSize } = e;
        target.options?.events?.afterPageSizeChange?.call(target, {
            pageSize: pageSize,
            previousPageSize: previousPageSize
        });
    });
}
/* *
 *
 *  Default Export
 *
 * */
export default {
    compose
};
