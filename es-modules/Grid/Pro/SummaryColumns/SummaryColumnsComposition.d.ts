import type { RowId } from '../../Core/Data/DataProvider';
import type Grid from '../../Core/Grid';
import type TableCell from '../../Core/Table/Body/TableCell';
import type { AggregatorOption } from '../Aggregation/AggregationTypes';
import Column from '../../Core/Table/Column.js';
/**
 * Context passed to a column aggregator callback, describing the row cell that
 * is being resolved.
 */
export interface ColumnAggregatorContext {
    /**
     * Ids of the columns the value is aggregated from, after the
     * `aggregatedColumns` option is resolved.
     */
    aggregatedColumnIds: string[];
    /**
     * Id of the aggregating column.
     */
    columnId: string;
    /**
     * Row id of the resolved cell, when the data provider exposes one. With
     * `materialize`, it is only resolved from `data.idColumn`.
     */
    rowId?: RowId;
    /**
     * Index of the resolved row. It addresses the presentation table, or the
     * source table with `materialize`, which runs before sorting and filtering.
     */
    rowIndex: number;
}
/**
 * Aggregator option accepted by an aggregating column.
 *
 * Set it to `false` to skip aggregation, leaving the column's own data in
 * place.
 */
export type ColumnAggregatorOption = AggregatorOption<ColumnAggregatorContext>;
/**
 * Composes Grid Pro with per-row column aggregation, letting a column derive
 * its value from the other columns of the same row.
 *
 * @param GridClass
 * Grid class to extend.
 *
 * @param ColumnClass
 * Column class to extend.
 *
 * @param TableCellClass
 * TableCell class to extend.
 */
export declare function compose(GridClass: typeof Grid, ColumnClass: typeof Column, TableCellClass: typeof TableCell): void;
declare module '../../Core/Options' {
    interface IndividualColumnOptions {
        /**
         * Aggregator deriving the column value from the other columns of the
         * same row, for example a `Total` column summing quarterly columns.
         *
         * When provided as a string, that Formula processor function is applied
         * to every row of the column. When provided as a callback, it is
         * invoked per row and should return a registered function name, or a
         * falsy value to skip aggregation and leave the column's own data in
         * place.
         *
         * The aggregated cells are derived, so they are never editable. Without
         * an explicit `dataType`, the column is assumed numeric. Its header and
         * body cells always carry the `hcg-summary-column` class, so no
         * `className` is needed to style them. By default the values are
         * resolved per rendered cell and therefore stay out of sorting,
         * filtering and exports - set `materialize` to change that.
         * Aggregating the rows of one column instead is what `rowAggregator`
         * and `summaryRows` do.
         *
         * @sample grid-pro/options/summary-columns Summary columns
         * @sample grid-pro/basic/summary-rows-and-columns
         *         Aggregated in both directions
         */
        columnAggregator?: ColumnAggregatorOption;
        /**
         * Ids of the columns that `columnAggregator` reads, ordered as they
         * should be passed to the aggregation function.
         *
         * When omitted, every other numeric column of the table is aggregated,
         * skipping columns that are derived themselves. List the columns
         * explicitly whenever the table holds numeric columns that must stay
         * out of the result, for example an id or a year.
         *
         * @sample grid-pro/options/summary-columns Summary columns
         */
        aggregatedColumns?: string[];
        /**
         * Whether the `columnAggregator` result is written into the queried
         * table, which makes the column sortable, filterable and exportable
         * like a regular data column. The cells stay read-only.
         *
         * It costs a pass over every row on each query, instead of resolving
         * only the rendered cells, and it turns a cell edit into a requery. It
         * requires a local data provider: sorting and filtering of a remote
         * provider run on the server, which does not know the column.
         *
         * Materialization runs before sorting and filtering, so the aggregator
         * callback receives source table row indexes, and `rowId` only when
         * `data.idColumn` is set. Under TreeView or row grouping the column
         * behaves like any other data column: add `rowAggregator` to it for
         * parent rows to aggregate it.
         *
         * @sample grid-pro/options/summary-columns Summary columns
         *
         * @default false
         */
        materialize?: boolean;
    }
}
declare const _default: {
    compose: typeof compose;
};
export default _default;
