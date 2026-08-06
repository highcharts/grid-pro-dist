/* *
 *
 *  Grid Pro table editing controller
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  Integration of this software requires a license.
 *  - For commercial use, see www.highcharts.com/license
 *  - For non-commercial, see www.highcharts.com/license-eula
 *
 * */
'use strict';
import { hasDataTableProvider } from '../../Core/Data/DataProvider.js';
/* *
 *
 *  Class
 *
 * */
/**
 * Handles structural row and column editing for Grid Pro.
 */
class TableEditingController {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(grid) {
        this.grid = grid;
    }
    /* *
     *
     *  Methods
     *
     * */
    /**
     * Returns whether table editing UI is explicitly enabled.
     */
    isEnabled() {
        return this.grid.options?.tableEditing?.enabled === true;
    }
    /**
     * Returns whether row actions can be used for the current context.
     *
     * @param context
     * Context menu runtime context.
     */
    canEditRows(context) {
        return (this.isEnabled() &&
            context.rowId !== void 0 &&
            !!this.getDataTable());
    }
    /**
     * Returns whether column actions can be used for the current context.
     *
     * @param context
     * Context menu runtime context.
     */
    canEditColumns(context) {
        return (this.isEnabled() &&
            !!context.sourceColumnId &&
            context.columnId === context.sourceColumnId &&
            !context.grid.columnPolicy.isColumnUnbound(context.columnId) &&
            !!this.getDataTable());
    }
    /**
     * Returns whether a column can be deleted.
     *
     * @param context
     * Context menu runtime context.
     */
    canDeleteColumn(context) {
        const table = this.getDataTable();
        const sourceColumnId = context.sourceColumnId;
        return (this.canEditColumns(context) &&
            !!table &&
            !!sourceColumnId &&
            table.getColumnIds().length > 1 &&
            !this.isIdColumn(sourceColumnId));
    }
    /**
     * Adds an empty row above the context row.
     *
     * @param context
     * Context menu runtime context.
     */
    async addRowAbove(context) {
        await this.addRow(context, 0);
    }
    /**
     * Adds an empty row below the context row.
     *
     * @param context
     * Context menu runtime context.
     */
    async addRowBelow(context) {
        await this.addRow(context, 1);
    }
    /**
     * Deletes the context row.
     *
     * @param context
     * Context menu runtime context.
     */
    async deleteRow(context) {
        const table = this.getDataTable();
        const rowIndex = await this.getOriginalRowIndex(context.rowId);
        if (!table || rowIndex === void 0) {
            return;
        }
        table.deleteRows(rowIndex, 1, { fromGrid: true });
        await this.updateRowsFromTable(table);
    }
    /**
     * Adds an empty column before the context column.
     *
     * @param context
     * Context menu runtime context.
     */
    async addColumnBefore(context) {
        await this.addColumn(context, 0);
    }
    /**
     * Adds an empty column after the context column.
     *
     * @param context
     * Context menu runtime context.
     */
    async addColumnAfter(context) {
        await this.addColumn(context, 1);
    }
    /**
     * Deletes the context column.
     *
     * @param context
     * Context menu runtime context.
     */
    async deleteColumn(context) {
        const table = this.getDataTable();
        const sourceColumnId = context.sourceColumnId;
        if (!table || !sourceColumnId || !this.canDeleteColumn(context)) {
            return;
        }
        table.deleteColumns([sourceColumnId], { fromGrid: true });
        await this.updateColumnsFromTable(table);
    }
    async addRow(context, offset) {
        const table = this.getDataTable();
        const rowIndex = await this.getOriginalRowIndex(context.rowId);
        if (!table || rowIndex === void 0) {
            return;
        }
        table.setRows([this.getEmptyRow(table)], rowIndex + offset, true, { fromGrid: true });
        await this.updateRowsFromTable(table);
    }
    async addColumn(context, offset) {
        const table = this.getDataTable();
        const sourceColumnId = context.sourceColumnId;
        if (!table || !sourceColumnId || !this.canEditColumns(context)) {
            return;
        }
        const nextColumnId = this.getNewColumnId(table);
        const columnIds = table.getColumnIds();
        const targetIndex = columnIds.indexOf(sourceColumnId);
        if (targetIndex === -1) {
            return;
        }
        const insertIndex = targetIndex + offset;
        const columns = table.getColumns(void 0, true);
        const nextColumns = {};
        for (let i = 0, iEnd = columnIds.length; i < iEnd; ++i) {
            if (i === insertIndex) {
                nextColumns[nextColumnId] = this.getEmptyColumn(table);
            }
            nextColumns[columnIds[i]] = columns[columnIds[i]];
        }
        if (insertIndex === columnIds.length) {
            nextColumns[nextColumnId] = this.getEmptyColumn(table);
        }
        table.deleteColumns(void 0, { fromGrid: true });
        table.setColumns(nextColumns, void 0, { fromGrid: true });
        await this.updateColumnsFromTable(table);
    }
    getDataTable() {
        const provider = this.grid.dataProvider;
        const dataOptions = this.grid.options?.data;
        if (dataOptions?.connector) {
            return;
        }
        return hasDataTableProvider(provider) ?
            provider.getDataTable() :
            void 0;
    }
    async getOriginalRowIndex(rowId) {
        const provider = this.grid.dataProvider;
        if (!provider || rowId === void 0) {
            return;
        }
        const rowIndex = await provider.getRowIndex(rowId);
        if (rowIndex === void 0) {
            return;
        }
        return hasRowIndexMapping(provider) ?
            await provider.getOriginalRowIndexFromLocal(rowIndex) :
            rowIndex;
    }
    getNewColumnId(table) {
        const columnIds = new Set(table.getColumnIds());
        const prefix = 'column';
        let index = columnIds.size + 1;
        let columnId = prefix + index;
        while (columnIds.has(columnId)) {
            columnId = prefix + (++index);
        }
        return columnId;
    }
    getEmptyColumn(table) {
        return new Array(table.getRowCount()).fill(null);
    }
    getEmptyRow(table) {
        const idColumn = this.getIdColumn();
        const row = {};
        const columnIds = table.getColumnIds();
        for (let i = 0, iEnd = columnIds.length; i < iEnd; ++i) {
            row[columnIds[i]] = null;
        }
        if (idColumn) {
            row[idColumn] = this.getNewRowId(table, idColumn);
        }
        return row;
    }
    getNewRowId(table, idColumn) {
        const ids = new Set(table.getColumn(idColumn, true));
        const prefix = 'row';
        let index = table.getRowCount() + 1;
        let rowId = prefix + index;
        while (ids.has(rowId)) {
            rowId = prefix + (++index);
        }
        return rowId;
    }
    async updateColumnsFromTable(table) {
        const { grid } = this;
        const columns = table.getColumns(void 0, false, true);
        const columnOptions = this.getColumnOptions(table.getColumnIds());
        grid.update({
            data: {
                dataTable: table,
                columns
            }
        }, false);
        grid.userOptions.columns = [];
        grid.columnPolicy.clearColumnOptions();
        grid.setColumnOptions(columnOptions, true, true);
        if (grid.options) {
            grid.options.columns = grid.userOptions.columns;
        }
        await this.redrawGrid();
    }
    async updateRowsFromTable(table) {
        this.grid.update({
            data: {
                dataTable: table
            }
        }, false);
        await this.redrawGrid();
    }
    async redrawGrid() {
        this.grid.dirtyFlags.add('grid');
        await this.grid.redraw();
    }
    getColumnOptions(columnIds) {
        const { grid } = this;
        const sourceColumnIds = new Set(columnIds);
        const includedColumnIds = new Set(columnIds);
        const options = columnIds.map((columnId) => ({
            ...(grid.columnPolicy.getIndividualColumnOptions(columnId) || {}),
            id: columnId
        }));
        for (const columnOptions of grid.userOptions.columns || []) {
            const columnId = columnOptions.id;
            const sourceColumnId = grid.columnPolicy.getColumnSourceId(columnId);
            if (includedColumnIds.has(columnId) ||
                (sourceColumnId &&
                    !sourceColumnIds.has(sourceColumnId))) {
                continue;
            }
            options.push(columnOptions);
            includedColumnIds.add(columnId);
        }
        return options;
    }
    isIdColumn(sourceColumnId) {
        return this.getIdColumn() === sourceColumnId;
    }
    getIdColumn() {
        return this.grid.options?.data
            ?.idColumn;
    }
}
/* *
 *
 *  Functions
 *
 * */
/**
 * Returns whether a provider can map presentation rows to source rows.
 *
 * @param provider
 * Data provider instance to test.
 */
function hasRowIndexMapping(provider) {
    return !!(provider &&
        typeof provider.getOriginalRowIndexFromLocal === 'function');
}
/* *
 *
 *  Default Export
 *
 * */
export default TableEditingController;
