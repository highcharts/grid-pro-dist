import type { CellType as DataTableCellType } from '../../../Data/DataTable';
import type { AggregatorOption } from './AggregationTypes';
/**
 * Resolves the aggregation function name for an aggregator option.
 *
 * The resolved name is normalized (trimmed and upper-cased) to match the
 * canonical keys of the Formula processor functions registry.
 *
 * @param aggregator
 * Aggregator option, either a function name or a callback returning one.
 *
 * @param context
 * Context passed to the aggregator callback.
 *
 * @return
 * Canonical function name, or `undefined` when aggregation should be skipped.
 */
declare function resolveAggregatorName<TContext>(aggregator: (AggregatorOption<TContext> | undefined), context: TContext): string | undefined;
/**
 * Executes a registered Formula processor function on a set of values.
 *
 * @param functionName
 * Registered Formula processor function name.
 *
 * @param values
 * Values to aggregate.
 *
 * @return
 * Aggregated cell value, or `null` when the function is unknown or fails.
 */
declare function executeAggregate(functionName: string, values: Array<Exclude<DataTableCellType, null | undefined>>): DataTableCellType;
declare const Aggregation: {
    executeAggregate: typeof executeAggregate;
    resolveAggregatorName: typeof resolveAggregatorName;
};
export default Aggregation;
