/* *
 *
 *  Grid Summary Columns Composition
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
import Aggregation from '../Aggregation/Aggregation.js';
import SummaryColumnsModifier from './SummaryColumnsModifier.js';
import Globals from '../../Core/Globals.js';
import { hasDataTableProvider } from '../../Core/Data/DataProvider.js';
import { addEvent, defined, pushUnique } from '../../../Shared/Utilities.js';
/* *
 *
 *  Constants
 *
 * */
/**
 * Class name added to the header and body cells of an aggregating column, so
 * that summary columns can be styled without a manual `className`.
 */
const summaryColumnClassName = Globals.classNamePrefix + 'summary-column';
/**
 * Grids already told that `materialize` needs a local data provider.
 */
const warnedGrids = new WeakSet();
/* *
 *
 *  Composition
 *
 * */
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
export function compose(GridClass, ColumnClass, TableCellClass) {
    if (!pushUnique(Globals.composed, 'SummaryColumns')) {
        return;
    }
    addEvent(ColumnClass, 'afterInit', onColumnAfterInit);
    addEvent(GridClass, 'refreshSourceColumnIds', onGridRefreshSourceColumnIds);
    addEvent(GridClass, 'getGroupedModifiers', onGridGetGroupedModifiers);
    addEvent(TableCellClass, 'getEditability', onCellGetEditability);
}
/**
 * Installs the summary column class, and the value resolver unless the column
 * is materialized (then its values come from the queried table).
 */
function onColumnAfterInit() {
    const grid = this.viewport.grid;
    const options = grid.columnPolicy.getIndividualColumnOptions(this.id);
    if (!options?.columnAggregator) {
        delete this.valueResolver;
        return;
    }
    pushUnique(this.classNames, summaryColumnClassName);
    if (!isMaterialized(grid, this.id)) {
        this.valueResolver = resolveAggregatedValue;
    }
    // An aggregating column has no source data to infer the type from, while
    // every Formula processor function resolves to a number.
    if (!options.dataType && !grid.options?.columnDefaults?.dataType) {
        this.dataType = 'number';
    }
}
/**
 * Declares the materialized columns as source columns, so that they count as
 * bound and unlock sorting, filtering and exporting.
 *
 * @param e
 * Source column ids resolved from the data provider.
 */
function onGridRefreshSourceColumnIds(e) {
    const columns = getMaterializedColumns(this);
    for (let i = 0, iEnd = columns.length; i < iEnd; ++i) {
        const columnId = columns[i].id;
        if (e.columnIds.indexOf(columnId) === -1) {
            e.columnIds.push(columnId);
        }
    }
}
/**
 * Contributes the modifier materializing the aggregating columns, ahead of the
 * sorting and filtering ones.
 *
 * @param e
 * Modifiers collected for the current query.
 *
 * @param e.modifiers
 * List to contribute to.
 */
function onGridGetGroupedModifiers(e) {
    const grid = this;
    const columns = getMaterializedColumns(grid);
    if (!columns.length) {
        return;
    }
    const specs = [];
    for (let i = 0, iEnd = columns.length; i < iEnd; ++i) {
        const options = columns[i];
        specs.push({
            columnId: options.id,
            resolve: (table, rowIndex) => {
                const aggregatedColumnIds = resolveTableColumnIds(grid, table, options);
                return aggregate(options.id, options, aggregatedColumnIds, collectTableValues(grid, table, aggregatedColumnIds, rowIndex), resolveSourceRowId(grid, table, rowIndex), rowIndex);
            }
        });
    }
    e.modifiers.push(new SummaryColumnsModifier(specs));
}
/**
 * Keeps the derived cells of an aggregating column read-only, also when the
 * column is materialized and therefore no longer unbound.
 *
 * @param e
 * Editability event payload.
 */
function onCellGetEditability(e) {
    const column = this.column;
    const options = column.viewport.grid.columnPolicy
        .getIndividualColumnOptions(column.id);
    if (options?.columnAggregator) {
        e.editable = false;
    }
}
/* *
 *
 *  Functions
 *
 * */
/**
 * Aggregates the row values of the source columns into the cell value. Returns
 * nothing when no aggregation applies, which leaves the column's own data in
 * place.
 *
 * @param cell
 * Cell to resolve the value for.
 */
function resolveAggregatedValue(cell) {
    const column = cell.column;
    const options = column.viewport.grid.columnPolicy
        .getIndividualColumnOptions(column.id);
    if (!options) {
        return;
    }
    const aggregatedColumnIds = resolveColumnIds(column, options);
    return aggregate(column.id, options, aggregatedColumnIds, collectRowValues(cell, aggregatedColumnIds), cell.row.id, cell.row.index);
}
/**
 * Runs the resolved aggregator over the collected values of one row.
 *
 * @param columnId
 * Id of the aggregating column.
 *
 * @param options
 * Options of the aggregating column.
 *
 * @param aggregatedColumnIds
 * Resolved source column ids.
 *
 * @param values
 * Aggregable row values.
 *
 * @param rowId
 * Row id, when resolved.
 *
 * @param rowIndex
 * Index of the resolved row.
 */
function aggregate(columnId, options, aggregatedColumnIds, values, rowId, rowIndex) {
    const functionName = Aggregation.resolveAggregatorName(options.columnAggregator, {
        aggregatedColumnIds,
        columnId,
        rowId,
        rowIndex
    });
    if (!functionName) {
        return;
    }
    return Aggregation.executeAggregate(functionName, values);
}
/**
 * Resolves the columns an aggregating column reads. Without an explicit
 * `aggregatedColumns` list, every other numeric column of the table is
 * aggregated, skipping columns that are derived themselves.
 *
 * @param column
 * Aggregating column.
 *
 * @param options
 * Options of the aggregating column.
 */
function resolveColumnIds(column, options) {
    if (options.aggregatedColumns) {
        return options.aggregatedColumns;
    }
    const columns = column.viewport.columns;
    const columnIds = [];
    for (let i = 0, iEnd = columns.length; i < iEnd; ++i) {
        const candidate = columns[i];
        if (candidate !== column &&
            candidate.dataType === 'number' &&
            !candidate.isDerived()) {
            columnIds.push(candidate.id);
        }
    }
    return columnIds;
}
/**
 * Resolves the source columns of a materialized column. The rendered columns do
 * not exist yet when the query runs, so the implicit set is resolved from the
 * table: every numeric column that no aggregating column produces.
 *
 * @param grid
 * Grid the columns belong to.
 *
 * @param table
 * Table the query runs on.
 *
 * @param options
 * Options of the aggregating column.
 */
function resolveTableColumnIds(grid, table, options) {
    if (options.aggregatedColumns) {
        return options.aggregatedColumns;
    }
    const aggregating = getAggregatingColumns(grid)
        .map((column) => column.id);
    const columnIds = [];
    const candidates = table.getColumnIds();
    for (let i = 0, iEnd = candidates.length; i < iEnd; ++i) {
        const columnId = candidates[i];
        if (aggregating.indexOf(columnId) === -1 &&
            typeof firstDefinedValue(table, columnId) === 'number') {
            columnIds.push(columnId);
        }
    }
    return columnIds;
}
/**
 * Collects the aggregable row values of the source columns from a rendered row.
 *
 * @param cell
 * Cell being resolved, holding the row data.
 *
 * @param columnIds
 * Resolved source column ids.
 */
function collectRowValues(cell, columnIds) {
    const columnPolicy = cell.column.viewport.grid.columnPolicy;
    const data = cell.row.data;
    const values = [];
    for (let i = 0, iEnd = columnIds.length; i < iEnd; ++i) {
        const columnId = columnIds[i];
        const sourceColumnId = columnPolicy.getColumnSourceId(columnId);
        const value = (sourceColumnId && sourceColumnId in data ?
            data[sourceColumnId] :
            data[columnId]);
        if (defined(value)) {
            values.push(value);
        }
    }
    return values;
}
/**
 * Collects the aggregable row values of the source columns from the table.
 *
 * @param grid
 * Grid the columns belong to.
 *
 * @param table
 * Table the query runs on.
 *
 * @param columnIds
 * Resolved source column ids.
 *
 * @param rowIndex
 * Row of the table being resolved.
 */
function collectTableValues(grid, table, columnIds, rowIndex) {
    const columnPolicy = grid.columnPolicy;
    const values = [];
    for (let i = 0, iEnd = columnIds.length; i < iEnd; ++i) {
        const columnId = columnIds[i];
        const value = table.getCell(columnPolicy.getColumnSourceId(columnId) || columnId, rowIndex);
        if (defined(value)) {
            values.push(value);
        }
    }
    return values;
}
/**
 * Resolves the row id of a source table row, which is only known when
 * `data.idColumn` is configured.
 *
 * @param grid
 * Grid the table belongs to.
 *
 * @param table
 * Table the query runs on.
 *
 * @param rowIndex
 * Row of the table being resolved.
 */
function resolveSourceRowId(grid, table, rowIndex) {
    const idColumn = grid.options?.data?.idColumn;
    if (!idColumn) {
        return;
    }
    const value = table.getCell(idColumn, rowIndex);
    return typeof value === 'number' || typeof value === 'string' ?
        value :
        void 0;
}
/**
 * First value a table column holds, used to probe the column type.
 *
 * @param table
 * Table to read.
 *
 * @param columnId
 * Column to probe.
 */
function firstDefinedValue(table, columnId) {
    const column = table.getColumn(columnId);
    if (!column) {
        return;
    }
    for (let i = 0, iEnd = column.length; i < iEnd; ++i) {
        if (defined(column[i])) {
            return column[i];
        }
    }
    return;
}
/**
 * Enabled columns of the grid that aggregate the other columns of their row.
 *
 * They are read from the user options, because the query runs before the
 * rendered columns exist.
 *
 * @param grid
 * Grid to read the options of.
 */
function getAggregatingColumns(grid) {
    const columns = grid.options?.columns;
    if (!columns) {
        return [];
    }
    return columns.filter((column) => !!(column.columnAggregator &&
        column.enabled !== false));
}
/**
 * Aggregating columns that materialize into the queried table. Materialization
 * needs a local data provider, because sorting and filtering of a remote
 * provider run on the server, which does not know the column.
 *
 * @param grid
 * Grid to read the options of.
 */
function getMaterializedColumns(grid) {
    const columns = getAggregatingColumns(grid)
        .filter((column) => column.materialize === true);
    if (!columns.length || hasDataTableProvider(grid.dataProvider)) {
        return columns;
    }
    if (!warnedGrids.has(grid)) {
        warnedGrids.add(grid);
        // eslint-disable-next-line no-console
        console.warn('Summary columns: `materialize` requires a local data ' +
            'provider. The columns are resolved per rendered cell instead, ' +
            'and stay out of sorting, filtering and exports.');
    }
    return [];
}
/**
 * Whether an aggregating column materializes into the queried table.
 *
 * @param grid
 * Grid to read the options of.
 *
 * @param columnId
 * Id of the aggregating column.
 */
function isMaterialized(grid, columnId) {
    return getMaterializedColumns(grid)
        .some((column) => column.id === columnId);
}
/* *
 *
 *  Default Export
 *
 * */
export default {
    compose
};
