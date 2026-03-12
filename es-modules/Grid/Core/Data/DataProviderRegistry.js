/* *
 *
 *  Data Provider Registry
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
/* *
 *
 *  Constants
 *
 * */
/**
 * Record of data provider classes
 */
export const types = {};
/* *
 *
 *  Functions
 *
 * */
/**
 * Method used to register new data provider classes.
 *
 * @param key
 * Registry key of the data provider class.
 *
 * @param DataProviderClass
 * Data provider class (aka class constructor) to register.
 */
export function registerDataProvider(key, DataProviderClass) {
    return (!!key &&
        !types[key] &&
        !!(types[key] = DataProviderClass));
}
/* *
 *
 * Default Export
 *
 * */
export default {
    registerDataProvider,
    types
};
