import type DataTable from '../../../Data/DataTable';
import type { RowObject as DataTableRowObject } from '../../../Data/DataTable';
import type Grid from '../../Core/Grid';
import type { SummaryRenderRow } from './SummaryRowsTypes';
/**
 * Computes the flat summary (total) row objects for the current table. The
 * objects are rendered in a dedicated frozen section by `SummaryView`.
 */
declare class SummaryRowsController {
    private readonly grid;
    /**
     * Summary rows computed for the current queried table (values + formats).
     */
    private rows;
    /**
     * Whether an unsupported scope was already reported.
     */
    private warnedScope;
    /**
     * Rollup rows resolved per table within one recompute, so that several
     * summary rows over the same table resolve them once.
     */
    private rollupCache?;
    constructor(grid: Grid);
    /**
     * Returns the resolved summary rows (values + per-cell formats).
     */
    getRows(): SummaryRenderRow[];
    /**
     * Returns the computed summary row value objects.
     */
    getRowObjects(): DataTableRowObject[];
    /**
     * Returns whether a source column is aggregated by any summary row, so
     * editing it must recompute the totals.
     *
     * @param columnId
     * Source column id.
     */
    hasColumnAggregator(columnId: string): boolean;
    /**
     * Recomputes the summary row objects from the queried table.
     *
     * Each row aggregates the pipeline stage its `scope` selects, defaulting to
     * the queried table, after filtering/sorting and before pagination.
     *
     * @param table
     * Queried table after filtering/sorting and before pagination.
     */
    updateFromTable(table: DataTable): void;
    /**
     * Builds a single summary row object. Columns that neither aggregate nor
     * carry a static value render empty.
     *
     * @param source
     * Rows the aggregation runs over, resolved from the row `scope`.
     *
     * @param columnIds
     * Column ids of the queried table.
     *
     * @param options
     * Options of the summary row.
     *
     * @param summaryRowIndex
     * Zero-based index of the summary row.
     */
    private buildSummaryRow;
    /**
     * Resolves the rows a `scope` selects, falling back to the queried table.
     *
     * @param table
     * Queried table, after filtering/sorting and before pagination.
     *
     * @param options
     * Options of the summary row.
     */
    private getScopedSource;
    /**
     * Resolves the rows of a scoped source that roll up other rows of it, so
     * that pre-calculated parent values are not counted next to the rows below
     * them.
     *
     * @param source
     * Resolved scoped source.
     *
     * @param options
     * Options of the summary row.
     */
    private withRollups;
    /**
     * Resolves the row range of the current page within the queried table, or
     * nothing when the page scope does not apply.
     *
     * The queried table is the one the pagination modifier slices, so the page
     * is a plain range of it. A projecting feature (TreeView, row grouping)
     * replaces that table with the projected rows before pagination, and the
     * range then addresses rows the aggregation never sees.
     */
    private getPageRange;
    /**
     * Number of rows the scoped source holds, surfaced in the aggregator
     * context so that it matches the aggregated values.
     *
     * @param source
     * Resolved scoped source.
     *
     * @param skipParents
     * Whether rows rolling up other rows are left out.
     */
    private getScopedRowCount;
    /**
     * Collects the values a column contributes to the totals.
     *
     * @param source
     * Resolved scoped source.
     *
     * @param columnId
     * Aggregated column id.
     *
     * @param skipParents
     * Whether rows rolling up other rows are left out.
     */
    private getAggregableValues;
    /**
     * Reports an unsupported scope once, so that a per-query recompute does not
     * repeat it.
     *
     * @param reason
     * What is unsupported.
     */
    private warnScope;
    /**
     * Resolves the effective aggregator option for a summary column.
     *
     * @param options
     * Summary row options.
     *
     * @param column
     * Column options for the resolved column, when present.
     */
    private getColumnAggregator;
    /**
     * Resolves whether a summary column leaves out rows that roll up other
     * rows, falling back to the summary row default.
     *
     * @param options
     * Summary row options.
     *
     * @param column
     * Column options for the resolved column, when present.
     */
    private getColumnSkipParents;
    /**
     * Whether anything in the summary row leaves rollup rows out, so that
     * resolving them is worth the pass over the tree.
     *
     * @param options
     * Summary row options.
     */
    private excludesRollups;
    /**
     * Indexes a summary row's column options by column id.
     *
     * @param options
     * Summary row options.
     */
    private getColumnsById;
    /**
     * Returns the enabled summary rows, normalizing the object-or-array option.
     */
    private getSummaryRowOptions;
}
export default SummaryRowsController;
