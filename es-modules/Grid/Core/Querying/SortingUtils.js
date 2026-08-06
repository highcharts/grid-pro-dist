/* *
 *
 *  Grid Sorting helpers
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  A commercial license may be required depending on use.
 *  See www.highcharts.com/license
 *
 * */
'use strict';
/* *
 *
 *  Functions
 *
 * */
/**
 * Default ascending compare used by Grid sorting.
 *
 * @param a
 * First value.
 *
 * @param b
 * Second value.
 */
function ascending(a, b) {
    return ((a || 0) < (b || 0) ? -1 :
        (a || 0) > (b || 0) ? 1 :
            0);
}
/**
 * Default descending compare used by Grid sorting.
 *
 * @param a
 * First value.
 *
 * @param b
 * Second value.
 */
function descending(a, b) {
    return ((b || 0) < (a || 0) ? -1 :
        (b || 0) > (a || 0) ? 1 :
            0);
}
/**
 * Creates a compare function consistent with the standard SortModifier.
 *
 * @param direction
 * Sorting direction.
 *
 * @param customCompare
 * Optional custom column compare override.
 */
export function createGridSortCompare(direction, customCompare) {
    if (customCompare) {
        if (direction === 'desc') {
            return (a, b) => -customCompare(a, b);
        }
        return customCompare;
    }
    return (direction === 'asc' ?
        ascending :
        descending);
}
/**
 * Resolves active grid sorting descriptors to source columns and effective
 * compare functions.
 *
 * @param grid
 * Grid instance providing column policy and defaults.
 *
 * @param currentSortings
 * Current multi-column sorting state.
 *
 * @param currentSorting
 * Current single-column sorting state fallback.
 */
export function resolveActiveGridSortings(grid, currentSortings, currentSorting) {
    const columnPolicy = grid.columnPolicy;
    const defaultCompare = grid.options?.columnDefaults?.sorting?.compare;
    const sortings = (currentSortings ||
        (currentSorting ? [currentSorting] : [])).filter((sorting) => !!(sorting.columnId &&
        sorting.order &&
        !columnPolicy.isColumnUnbound(sorting.columnId)));
    const activeSortings = [];
    for (let i = 0, iEnd = sortings.length; i < iEnd; ++i) {
        const sorting = sortings[i];
        const sourceColumnId = columnPolicy.getColumnSourceId(sorting.columnId);
        if (!sourceColumnId) {
            continue;
        }
        const customCompare = columnPolicy
            .getIndividualColumnOptions(sorting.columnId)
            ?.sorting?.compare || defaultCompare;
        activeSortings.push({
            columnId: sorting.columnId,
            compare: createGridSortCompare(sorting.order, customCompare),
            customCompare,
            order: sorting.order,
            sourceColumnId
        });
    }
    return activeSortings;
}
