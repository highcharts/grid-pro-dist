/* *
 *
 *  Grid Tree Aggregation Resolver
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
import Formula from '../../../../Data/Formula/Formula.js';
import { defined } from '../../../../Shared/Utilities.js';
/**
 * Narrows arbitrary processor results to DataTable-compatible cell values.
 *
 * @param value
 * Candidate processor result.
 */
function isDataTableCellValue(value) {
    return (value === null ||
        typeof value === 'undefined' ||
        typeof value === 'boolean' ||
        typeof value === 'number' ||
        typeof value === 'string');
}
/* *
 *
 *  Class
 *
 * */
class TreeAggregationResolver {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(dependencies) {
        this.dependencies = dependencies;
    }
    /* *
     *
     *  Methods
     *
     * */
    /**
     * Returns whether a source column participates in TreeView aggregation.
     *
     * @param columnId
     * Source column id.
     */
    hasColumnAggregation(columnId) {
        return !!this.dependencies.getColumnAggregatorOption(columnId);
    }
    /**
     * Resolves projected values for a single aggregated column.
     *
     * Aggregation is evaluated on the projected tree after filtering/sorting,
     * but before pagination and independently of expand/collapse visibility.
     *
     * @param columnId
     * Aggregated source column id.
     *
     * @param table
     * Queried table after filtering/sorting and before pagination.
     *
     * @param projectionState
     * Current projected tree state.
     *
     * @param derivedCellColumnIdsByRowId
     * Mutable map collecting derived cells for the projected state.
     *
     * @param idColumn
     * Column containing stable row IDs, when configured.
     */
    resolveColumnValues(columnId, table, projectionState, derivedCellColumnIdsByRowId, idColumn) {
        const resolvedValuesByRowId = new Map();
        const resolvingRowIds = new Set();
        const resolveValue = (rowId) => {
            if (resolvedValuesByRowId.has(rowId)) {
                return resolvedValuesByRowId.get(rowId);
            }
            if (resolvingRowIds.has(rowId)) {
                return null;
            }
            resolvingRowIds.add(rowId);
            const rowState = projectionState.rowsById.get(rowId);
            const sourceValue = this.dependencies.resolveProjectedCellValue(columnId, rowId, table, projectionState, idColumn);
            let resolvedValue = sourceValue;
            if (rowState?.childrenIds.length) {
                const aggregateFunctionName = (this.resolveAggregatorFunctionName(columnId, rowState, sourceValue));
                if (aggregateFunctionName) {
                    const childValues = rowState.childrenIds
                        .map(resolveValue)
                        .filter(defined);
                    resolvedValue = this.executeAggregateFunction(aggregateFunctionName, childValues);
                    this.markDerivedCell(derivedCellColumnIdsByRowId, rowId, columnId);
                }
            }
            resolvingRowIds.delete(rowId);
            resolvedValuesByRowId.set(rowId, resolvedValue);
            return resolvedValue;
        };
        for (let i = 0, iEnd = projectionState.rowIds.length; i < iEnd; ++i) {
            const rowId = projectionState.rowIds[i];
            resolveValue(rowId);
        }
        return resolvedValuesByRowId;
    }
    /**
     * Marks a projected cell as derived from TreeView aggregation.
     *
     * @param derivedCellColumnIdsByRowId
     * Mutable map collecting derived cells for the projected state.
     *
     * @param rowId
     * Derived row id.
     *
     * @param columnId
     * Derived source column id.
     */
    markDerivedCell(derivedCellColumnIdsByRowId, rowId, columnId) {
        let derivedColumns = derivedCellColumnIdsByRowId.get(rowId);
        if (!derivedColumns) {
            derivedColumns = new Set();
            derivedCellColumnIdsByRowId.set(rowId, derivedColumns);
        }
        derivedColumns.add(columnId);
    }
    /**
     * Resolves aggregation function name for a row/column combination.
     *
     * @param columnId
     * Aggregated source column id.
     *
     * @param rowState
     * Projected row state for the current row.
     *
     * @param sourceValue
     * Source cell value before aggregation.
     */
    resolveAggregatorFunctionName(columnId, rowState, sourceValue) {
        const aggregator = this.dependencies
            .getColumnAggregatorOption(columnId);
        if (!aggregator || !rowState.childrenIds.length) {
            return;
        }
        const aggregatorResult = (typeof aggregator === 'function' ?
            aggregator({
                childCount: rowState.childrenIds.length,
                childrenIds: rowState.childrenIds.slice(),
                columnId,
                depth: rowState.depth,
                hasChildren: rowState.hasChildren,
                rowId: rowState.id,
                sourceValue
            }) :
            aggregator);
        if (typeof aggregatorResult !== 'string') {
            return;
        }
        const normalizedName = aggregatorResult.trim().toUpperCase();
        return normalizedName || void 0;
    }
    /**
     * Executes a registered Formula processor function on direct child values.
     *
     * @param functionName
     * Registered Formula processor function name.
     *
     * @param childValues
     * Direct child values after their own aggregation has been resolved.
     */
    executeAggregateFunction(functionName, childValues) {
        const processor = Formula.processorFunctions[functionName];
        if (!processor) {
            return null;
        }
        try {
            const result = processor(childValues);
            return isDataTableCellValue(result) ?
                result :
                null;
        }
        catch {
            return null;
        }
    }
}
/* *
 *
 *  Default export
 *
 * */
export default TreeAggregationResolver;
