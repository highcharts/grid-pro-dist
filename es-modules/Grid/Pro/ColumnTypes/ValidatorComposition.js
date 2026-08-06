/* *
 *
 *  Validator Composition.
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  Integration of this software requires a license.
 *  - For commercial use, see www.highcharts.com/license
 *  - For non-commercial, see www.highcharts.com/license-eula
 *
 *
 *  Authors:
 *  - Sebastian Bochan
 *
 * */
'use strict';
import Validator from './Validator.js';
import Globals from '../../Core/Globals.js';
import { addEvent, pushUnique } from '../../../Shared/Utilities.js';
/* *
 *
 *  Composition
 *
 * */
/**
 * Extends the grid classes with cell editing functionality.
 *
 * @param TableClass
 * The class to extend.
 *
 */
export function compose(TableClass) {
    if (!pushUnique(Globals.composed, 'Validator')) {
        return;
    }
    addEvent(TableClass, 'beforeInit', initValidatorComposition);
    addEvent(TableClass, 'afterDestroy', destroy);
}
/**
 * Callback function called after table initialization.
 */
function initValidatorComposition() {
    this.validator = new Validator(this);
}
/**
 * Callback function called after table destroy.
 */
function destroy() {
    this.validator?.destroy();
}
/* *
 *
 *  Default Export
 *
 * */
export default {
    compose
};
