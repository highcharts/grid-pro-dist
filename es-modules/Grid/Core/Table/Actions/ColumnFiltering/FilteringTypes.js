/* *
 *
 *  Grid Filtering Types and Constants
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
    'greaterThan',
    'greaterThanOrEqualTo',
    'lessThan',
    'lessThanOrEqualTo',
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
 * Legacy datetime operator aliases (`before` → `lessThan`, `after` → `greaterThan`).
 */
// TODO: Remove, deprecated
export const operatorAliases = {
    before: 'lessThan',
    after: 'greaterThan'
};
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
