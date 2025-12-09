/* *
 *
 *  Grid Exporting composition
 *
 *  (c) 2020-2025 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
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
