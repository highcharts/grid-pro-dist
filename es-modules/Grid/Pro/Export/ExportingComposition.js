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
import Defaults from '../../Core/Defaults.js';
import Exporting from './Exporting.js';
import Globals from '../../Core/Globals.js';
import U from '../../../Core/Utilities.js';
const { addEvent, pushUnique } = U;
/* *
 *
 *  Class Namespace
 *
 * */
var ExportingComposition;
(function (ExportingComposition) {
    /**
     * Extends the grid classes with exporting.
     *
     * @param GridClass
     * The class to extend.
     *
     */
    function compose(GridClass) {
        if (!pushUnique(Globals.composed, 'Exporting')) {
            return;
        }
        Defaults.defaultOptions.exporting = Exporting.defaultOptions;
        addEvent(GridClass, 'beforeLoad', initExporting);
    }
    ExportingComposition.compose = compose;
    /**
     * Init exporting
     */
    function initExporting() {
        this.exporting = new Exporting(this);
    }
})(ExportingComposition || (ExportingComposition = {}));
/* *
 *
 *  Default Export
 *
 * */
export default ExportingComposition;
