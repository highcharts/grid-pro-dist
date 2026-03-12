/* *
 *
 *  Data Provider abstract class
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
import { defined } from '../../../Shared/Utilities.js';
/**
 * Base class for Grid data providers.
 *
 * Data providers are responsible for serving data to the grid, applying query
 * modifiers and persisting edits.
 */
export class DataProvider {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(queryingController, options) {
        this.querying = queryingController;
        this.options = options;
    }
    /* *
     *
     *  Methods
     *
     * */
    /**
     * Initializes the data provider.
     */
    init() {
        return Promise.resolve();
    }
    /**
     * Returns the number of items before pagination has been applied.
     */
    async getPrePaginationRowCount() {
        return await this.getRowCount();
    }
    /**
     * Helper method to assume the data type of a column based on the sample
     * of the column data.
     *
     * @param columnSample
     * The sample of the column data to determine the data type from.
     *
     * @param columnId
     * The id of the column to determine the data type for.
     */
    static assumeColumnDataType(columnSample, columnId) {
        for (let i = 0, iEnd = columnSample.length; i < iEnd; ++i) {
            if (!defined(columnSample[i])) {
                // If the data is null or undefined, we should look
                // at the next value to determine the type.
                continue;
            }
            switch (typeof columnSample[i]) {
                case 'number':
                    return 'number';
                case 'boolean':
                    return 'boolean';
                default:
                    return 'string';
            }
        }
        // eslint-disable-next-line no-console
        console.warn(`Column "${columnId}" sample does not contain any defined ` +
            'values; defaulting dataType to "string". Set `dataType` option ' +
            'for the column to determine the data type and avoid unnecessary ' +
            'column scanning.');
        return 'string';
    }
}
/* *
 *
 * Default Export
 *
 * */
export default DataProvider;
