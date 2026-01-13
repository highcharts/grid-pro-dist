/* *
 *
 *  Grid Exporting composition
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
 *
 *  Authors:
 *  - Karol Kolodziej
 *
 * */
'use strict';
import { defaultOptions } from '../../Core/Defaults.js';
import Exporting from './Exporting.js';
import Globals from '../../Core/Globals.js';
import U from '../../../Core/Utilities.js';
const { addEvent, pushUnique } = U;
/* *
 *
 *  Composition
 *
 * */
/**
 * Extends the grid classes with exporting.
 *
 * @param GridClass
 * The class to extend.
 *
 */
export function compose(GridClass) {
    if (!pushUnique(Globals.composed, 'Exporting')) {
        return;
    }
    defaultOptions.exporting = Exporting.defaultOptions;
    addEvent(GridClass, 'beforeLoad', initExporting);
}
/**
 * Init exporting
 */
function initExporting() {
    this.exporting = new Exporting(this);
}
/* *
 *
 *  Default Export
 *
 * */
export default {
    compose
};
