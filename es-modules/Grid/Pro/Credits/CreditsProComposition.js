/* *
 *
 *  Grid Credits class
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
 *  - Sebastian Bochan
 *
 * */
'use strict';
import CreditsPro from './CreditsPro.js';
import Globals from '../../Core/Globals.js';
import { defaultOptions } from '../../Core/Defaults.js';
import { addEvent, merge, pushUnique } from '../../../Shared/Utilities.js';
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
