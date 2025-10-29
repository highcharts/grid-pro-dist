/* *
 *
 *  Grid Filtering Types and Constants
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
 *  - Kamil Kubik
 *
 * */
'use strict';
/**
 * String conditions values for the condition select options.
 */
export const stringConditions = [
    'contains',
    'doesNotContain',
    'equals',
    'doesNotEqual',
    'beginsWith',
    'endsWith',
    'empty',
    'notEmpty'
];
/**
 * Number conditions values for the condition select options.
 */
export const numberConditions = [
    'equals',
    'doesNotEqual',
    'greaterThan',
    'greaterThanOrEqualTo',
    'lessThan',
    'lessThanOrEqualTo',
    'empty',
    'notEmpty'
];
/**
 * DateTime conditions values for the condition select options.
 */
export const dateTimeConditions = [
    'equals',
    'doesNotEqual',
    'before',
    'after',
    'empty',
    'notEmpty'
];
/**
 * Boolean conditions values for the condition select options.
 */
export const booleanConditions = [
    'all',
    'true',
    'false',
    'empty'
];
/**
 * Corresponding values for the boolean select options.
 */
export const booleanValueMap = {
    'all': 'all',
    'true': true,
    'false': false,
    'empty': null
};
/**
 * Conditions map for the condition select options.
 */
export const conditionsMap = {
    string: stringConditions,
    number: numberConditions,
    datetime: dateTimeConditions,
    'boolean': booleanConditions
};
