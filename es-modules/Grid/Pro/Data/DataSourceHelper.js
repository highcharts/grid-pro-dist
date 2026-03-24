/* *
 *
 *  Remote Data Provider class
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
import T from '../../../Core/Templating.js';
const { format } = T;
/* *
 *
 *  Definitions
 *
 * */
/**
 * Mapping from Grid filter operators to standard API filter conditions.
 */
const filterOperatorMap = {
    '==': 'equals',
    '===': 'equals',
    '!=': 'doesNotEqual',
    '!==': 'doesNotEqual',
    '>': 'greaterThan',
    '>=': 'greaterThanOrEqualTo',
    '<': 'lessThan',
    '<=': 'lessThanOrEqualTo',
    contains: 'contains',
    notContains: 'doesNotContain',
    startsWith: 'beginsWith',
    endsWith: 'endsWith',
    empty: 'empty',
    notEmpty: 'notEmpty'
};
/**
 * Recursively extracts filter conditions from the Grid's FilterCondition
 * structure into a flat array of API filter conditions.
 *
 * @param condition
 * The filter condition from the Grid's filtering modifier.
 *
 * @param filterColumns
 * The array to accumulate filter conditions into.
 *
 * @returns
 * The accumulated filter conditions array.
 */
function extractFilterConditions(condition, filterColumns = []) {
    if (!condition) {
        return filterColumns;
    }
    if (condition.operator === 'and' || condition.operator === 'or') {
        if (condition.conditions) {
            for (const subCondition of condition.conditions) {
                extractFilterConditions(subCondition, filterColumns);
            }
        }
    }
    else if (condition.columnId || condition.condition?.columnId) {
        const conditionToUse = condition.columnId ?
            condition : condition.condition;
        let key = conditionToUse.operator;
        if (condition.operator === 'not') {
            key = condition.operator +
                conditionToUse.operator.charAt(0).toUpperCase() +
                conditionToUse.operator.slice(1);
        }
        const mapped = filterOperatorMap[key] || conditionToUse.operator;
        if (conditionToUse.columnId) {
            filterColumns.push({
                id: conditionToUse.columnId,
                condition: mapped,
                value: conditionToUse.value
            });
        }
    }
    return filterColumns;
}
/**
 * Returns the active sortings from the query state.
 *
 * @param state
 * The query state.
 *
 * @returns
 * The active sortings.
 */
const getActiveSortings = (state) => {
    const { currentSortings, currentSorting } = state.query.sorting;
    return (currentSortings ?? (currentSorting ? [currentSorting] : [])).filter((sorting) => defined(sorting?.columnId) && defined(sorting.order));
};
const defaultTemplateVariables = {
    page: (state) => (Math.floor(state.offset / (state.limit || 1)) + 1).toFixed(),
    pageSize: (state) => state.limit.toFixed(),
    offset: (state) => state.offset.toFixed(),
    limit: (state) => state.limit.toFixed(),
    format: () => 'js',
    filter: (state) => {
        const filterColumns = [];
        const filterCondition = state.query.filtering.modifier?.options?.condition;
        if (filterCondition) {
            extractFilterConditions(filterCondition, filterColumns);
        }
        if (!filterColumns.length) {
            return '';
        }
        return JSON.stringify({ columns: filterColumns });
    },
    sortBy: (state) => {
        const sortings = getActiveSortings(state);
        if (!sortings.length) {
            return '';
        }
        return sortings.map((sorting) => sorting.columnId).join(',');
    },
    sortOrder: (state) => {
        const sortings = getActiveSortings(state);
        if (!sortings.length) {
            return '';
        }
        const sortOrders = sortings.map((sorting) => sorting.order);
        const uniqueOrders = Array.from(new Set(sortOrders));
        return uniqueOrders.length === 1 ?
            uniqueOrders[0] :
            sortOrders.join(',');
    }
};
const defaultParseResponse = async (res) => {
    if (!res.ok) {
        let message = `DataSourceHelper: request failed with status ${res.status} ${res.statusText}`;
        try {
            const body = await res.text();
            if (body) {
                message += ` - ${body}`;
            }
        }
        catch {
            // Ignore response body parsing errors for error responses.
        }
        throw new Error(message);
    }
    const { data, meta } = await res.json();
    return {
        columns: data || {},
        totalRowCount: meta?.totalRowCount || 0,
        rowIds: meta?.rowIds
    };
};
/**
 * Builds a URL with query parameters for fetching data from the remote server.
 *
 * @param options
 * The options for building the URL.
 *
 * @param state
 * The query state containing the query, offset and limit.
 *
 * @returns
 * The complete URL string with all query parameters.
 */
export function buildUrl(options, state) {
    const { urlTemplate, templateVariables, omitEmpty } = options;
    const variables = {
        ...defaultTemplateVariables,
        ...templateVariables
    };
    const context = {};
    // Populate context with template variables in form of getter functions
    // so that only the variables that are actually used in the URL are
    // evaluated.
    Object.keys(variables).forEach((key) => {
        const value = variables[key];
        Object.defineProperty(context, key, {
            enumerable: true,
            get: () => value(state)
        });
    });
    const res = format(urlTemplate, context);
    if (omitEmpty ?? true) {
        return res.replace(/&([^=&]+)=([^&]*)/g, (_, key, value) => (value ? `&${key}=${value}` : ''));
    }
    return res;
}
/**
 * Fetches data from the remote server using the data source options.
 *
 * @param options
 * The options for fetching data from the remote server.
 *
 * @param state
 * The query state containing the query, offset and limit.
 *
 * @returns
 * The fetched data.
 */
export async function dataSourceFetch(options, state) {
    const { parseResponse = defaultParseResponse, fetchTimeout = 30000 } = options;
    try {
        const url = buildUrl(options, state);
        const controller = fetchTimeout > 0 ? new AbortController() : null;
        const externalSignal = state.signal;
        let timeoutId;
        if (controller && externalSignal) {
            if (externalSignal.aborted) {
                controller.abort();
            }
            else {
                externalSignal.addEventListener('abort', () => {
                    controller.abort();
                }, { once: true });
            }
        }
        if (controller) {
            timeoutId = setTimeout(() => {
                controller.abort();
            }, fetchTimeout);
        }
        try {
            const signal = controller?.signal ?? externalSignal;
            const res = signal ?
                await fetch(url, { signal }) :
                await fetch(url);
            const data = await parseResponse(res);
            return data;
        }
        finally {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        }
    }
    catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
            return {
                columns: {},
                totalRowCount: 0,
                rowIds: []
            };
        }
        // eslint-disable-next-line no-console
        console.error('Error fetching data from remote server.\n', err);
        return {
            columns: {},
            totalRowCount: 0,
            rowIds: []
        };
    }
}
