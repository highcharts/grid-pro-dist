/* *
 *
 *  Cell Renderer Registry
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
/* *
 *
 *  Constants
 *
 * */
/**
 * Record of cell renderer classes
 */
export const types = {};
/* *
 *
 *  Functions
 *
 * */
/**
 * Method used to register new cell renderer classes.
 *
 * @param key
 * Registry key of the cell renderer class.
 *
 * @param CellRendererClass
 * Cell renderer class (aka class constructor) to register.
 */
export function registerRenderer(key, CellRendererClass) {
    return (!!key &&
        !types[key] &&
        !!(types[key] = CellRendererClass));
}
/* *
 *
 *  Default Export
 *
 * */
export default {
    types,
    registerRenderer
};
