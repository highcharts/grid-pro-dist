/* *
 *
 *  Column Resizing namespace
 *
 *  (c) 2020-2025 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Dawid Dragula
 *
 * */
'use strict';
import ResizingMode from './ResizingMode.js';
import AdjacentResizingMode from './AdjacentResizingMode.js';
import IndependentResizingMode from './IndependentResizingMode.js';
import DistributedResizingMode from './DistributedResizingMode.js';
/* *
 *
 *  Namespace
 *
 * */
var ColumnResizing;
(function (ColumnResizing) {
    /**
     * Abstract class representing a column resizing mode.
     */
    ColumnResizing.AbstractStrategy = ResizingMode;
    /**
     * Registry of column resizing modes.
     */
    ColumnResizing.types = {
        adjacent: AdjacentResizingMode,
        distributed: DistributedResizingMode,
        independent: IndependentResizingMode
    };
    /**
     * Creates a new column resizing mode instance based on the
     * viewport's options.
     *
     * @param viewport
     * The table that the column resizing mode is applied to.
     *
     * @returns
     * The proper column resizing mode.
     */
    function initMode(viewport) {
        const modeName = viewport.grid.options?.rendering?.columns?.resizing?.mode ||
            'adjacent';
        let ModeConstructor = ColumnResizing.types[modeName];
        if (!ModeConstructor) {
            // eslint-disable-next-line no-console
            console.warn(`Unknown column resizing mode: '${modeName}'. Applied ` +
                'default \'adjacent\' mode.');
            ModeConstructor = ColumnResizing.types.adjacent;
        }
        return new ModeConstructor(viewport);
    }
    ColumnResizing.initMode = initMode;
})(ColumnResizing || (ColumnResizing = {}));
/* *
 *
 *  Default Export
 *
 * */
export default ColumnResizing;
