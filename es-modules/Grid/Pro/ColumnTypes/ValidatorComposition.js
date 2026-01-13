/* *
 *
 *  Validator Composition.
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
import Validator from './Validator.js';
import Globals from '../../Core/Globals.js';
import U from '../../../Core/Utilities.js';
const { addEvent, pushUnique } = U;
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
    addEvent(TableClass, 'afterInit', initValidatorComposition);
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
    this.validator.destroy();
}
/* *
 *
 *  Default Export
 *
 * */
export default {
    compose
};
