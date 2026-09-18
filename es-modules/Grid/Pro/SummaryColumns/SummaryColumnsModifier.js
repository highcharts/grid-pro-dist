/* *
 *
 *  Grid Summary Columns Modifier
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
 *  Authors:
 *  - Dawid Dragula
 *
 * */
'use strict';
import DataModifier from '../../../Data/Modifiers/DataModifier.js';
/* *
 *
 *  Class
 *
 * */
/**
 * Materializes aggregating columns (`columnAggregator` with `materialize`) into
 * the queried table, so that sorting, filtering and exporting see their values.
 *
 * It runs before the sorting and filtering modifiers, on a copy of the user
 * data table.
 */
class SummaryColumnsModifier extends DataModifier {
    /* *
     *
     *  Constructor
     *
     * */
    /**
     * Constructs the modifier for a set of aggregating columns.
     *
     * @param specs
     * Columns to materialize.
     */
    constructor(specs) {
        super();
        /* *
         *
         *  Properties
         *
         * */
        // The modifier is created by the Grid, never from user data options, so it
        // is not part of the modifier registry its `type` names.
        this.options = {
            type: 'SummaryColumns'
        };
        this.specs = specs;
    }
    /* *
     *
     *  Methods
     *
     * */
    modifyTable(table, eventDetail) {
        this.emit({ type: 'modify', detail: eventDetail, table });
        const modified = table.getModified();
        const specs = this.specs;
        const rowCount = table.getRowCount();
        for (let i = 0, iEnd = specs.length; i < iEnd; ++i) {
            const spec = specs[i];
            const values = [];
            for (let row = 0; row < rowCount; ++row) {
                values.push(spec.resolve(table, row));
            }
            modified.setColumn(spec.columnId, values);
        }
        this.emit({ type: 'afterModify', detail: eventDetail, table });
        return table;
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default SummaryColumnsModifier;
