/* *
 *
 *  License Validation Composition for Grid Pro
 *
 *  (c) 2020-2025 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Author:
 *  - Mikkel Espolin Birkeland
 *  - Sebastian Bochan
 *
 * */
'use strict';
import { validate } from './LicenseValidation.js';
import Globals from '../../Core/Globals.js';
import { addEvent, pushUnique } from '../../../Shared/Utilities.js';
/* *
 *
 *  Composition
 *
 * */
/**
 * Extends the grid classes with license validation.
 *
 * @param GridClass
 * The class to extend.
 *
 */
function compose(GridClass) {
    if (!pushUnique(Globals.composed, 'LicenseValidation')) {
        return;
    }
    addEvent(GridClass, 'afterLoad', validateLicense);
    addEvent(GridClass, 'afterUpdate', validateLicense);
}
/**
 * Callback function called after the grid is loaded or updated.
 *
 * @param this Grid instance.
 */
function validateLicense() {
    validate(this);
}
/* *
 *
 *  Default Export
 *
 * */
export default {
    compose
};
