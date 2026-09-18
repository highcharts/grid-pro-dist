/**
 * Result returned by an aggregator callback.
 *
 * Return a registered Formula processor function name (for example `SUM`),
 * or a falsy value to skip aggregation.
 */
export type AggregatorResult = (false | null | string | undefined);
/**
 * Callback deciding which aggregation function should be applied.
 *
 * @param context
 * Feature-specific context describing what is being aggregated.
 */
export interface AggregatorCallback<TContext> {
    (context: TContext): AggregatorResult;
}
/**
 * Aggregator option accepted by an aggregating feature.
 *
 * When provided as a string, that Formula processor function name is always
 * applied. When provided as a callback, it is invoked per aggregation and
 * should return a function name or a falsy value to skip aggregation. Set it
 * to `false` to skip aggregation entirely, resetting an inherited aggregator.
 */
export type AggregatorOption<TContext> = (false | string | AggregatorCallback<TContext>);
export default AggregatorOption;
