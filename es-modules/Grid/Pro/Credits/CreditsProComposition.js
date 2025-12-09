/* *
 *
 *  Grid Credits class
 *
 *  (c) 2020-2025 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Dawid Dragula
 *  - Sebastian Bochan
 *
 * */
'use strict';
import CreditsPro from './CreditsPro.js';
import Globals from '../../Core/Globals.js';
import U from '../../../Core/Utilities.js';
import { defaultOptions } from '../../Core/Defaults.js';
const { addEvent, merge, pushUnique } = U;
/* *
 *
 *  Composition
 *
 * */
/**
 * Extends the grid classes with customizable credits.
 *
 * @param GridClass
 * The class to extend.
 *
 */
export function compose(GridClass) {
    if (!pushUnique(Globals.composed, 'CreditsPro')) {
        return;
    }
    merge(true, defaultOptions, {
        credits: CreditsPro.defaultOptions
    });
    // TODO: Change to `beforeLoad` after upgrading grid update.
    addEvent(GridClass, 'afterRenderViewport', initCredits);
}
/**
 * Init configurable credits.
 * @param this
 * Reference to Grid.
 */
function initCredits() {
    this.credits = new CreditsPro(this, this.options?.credits);
}
/* *
 *
 *  Default Export
 *
 * */
export default {
    compose
};
