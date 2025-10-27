/* *
 *
 *  (c) 2009-2025 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Sophie Bremer
 *  - Gøran Slettemark
 *  - Jomar Hønsi
 *  - Dawid Dragula
 *
 * */
'use strict';
import DataTableCore from './DataTableCore.js';
import ColumnUtils from './ColumnUtils.js';
const { splice, setLength } = ColumnUtils;
import U from '../Core/Utilities.js';
const { addEvent, defined, extend, fireEvent, isNumber, uniqueKey } = U;
/* *
 *
 *  Class
 *
 * */
/**
 * Class to manage columns and rows in a table structure. It provides methods
 * to add, remove, and manipulate columns and rows, as well as to retrieve data
 * from specific cells.
 *
 * @class
 * @name Highcharts.DataTable
 *
 * @param {Highcharts.DataTableOptions} [options]
 * Options to initialize the new DataTable instance.
 */
class DataTable extends DataTableCore {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(options = {}) {
        super(options);
        this.metadata = options.metadata;
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Returns a clone of this table. The cloned table is completely independent
     * of the original, and any changes made to the clone will not affect
     * the original table.
     *
     * @function Highcharts.DataTable#clone
     *
     * @param {boolean} [skipColumns]
     * Whether to clone columns or not.
     *
     * @param {Highcharts.DataTableEventDetail} [eventDetail]
     * Custom information for pending events.
     *
     * @return {Highcharts.DataTable}
     * Clone of this data table.
     *
     * @emits #cloneTable
     * @emits #afterCloneTable
     */
    clone(skipColumns, eventDetail) {
        const table = this, tableOptions = {};
        table.emit({ type: 'cloneTable', detail: eventDetail });
        if (!skipColumns) {
            tableOptions.columns = table.columns;
        }
        if (!table.autoId) {
            tableOptions.id = table.id;
        }
        const tableClone = new DataTable(tableOptions);
        if (!skipColumns) {
            tableClone.versionTag = table.versionTag;
            tableClone.originalRowIndexes = table.originalRowIndexes;
            tableClone.localRowIndexes = table.localRowIndexes;
        }
        table.emit({
            type: 'afterCloneTable',
            detail: eventDetail,
            tableClone
        });
        return tableClone;
    }
    /**
     * Deletes columns from the table.
     *
     * @function Highcharts.DataTable#deleteColumns
     *
     * @param {Array<string>} [columnIds]
     * Names of columns to delete. If no array is provided, all
     * columns will be deleted.
     *
     * @param {Highcharts.DataTableEventDetail} [eventDetail]
     * Custom information for pending events.
     *
     * @return {Highcharts.DataTableColumnCollection|undefined}
     * Returns the deleted columns, if found.
     *
     * @emits #deleteColumns
     * @emits #afterDeleteColumns
     */
    deleteColumns(columnIds, eventDetail) {
        const table = this, columns = table.columns, deletedColumns = {}, modifiedColumns = {}, modifier = table.modifier, rowCount = table.rowCount;
        columnIds = (columnIds || Object.keys(columns));
        if (columnIds.length) {
            table.emit({
                type: 'deleteColumns',
                columnIds,
                detail: eventDetail
            });
            for (let i = 0, iEnd = columnIds.length, column, columnId; i < iEnd; ++i) {
                columnId = columnIds[i];
                column = columns[columnId];
                if (column) {
                    deletedColumns[columnId] = column;
                    modifiedColumns[columnId] = new Array(rowCount);
                }
                delete columns[columnId];
            }
            if (!Object.keys(columns).length) {
                table.rowCount = 0;
                this.deleteRowIndexReferences();
            }
            if (modifier) {
                modifier.modifyTable(table);
            }
            table.emit({
                type: 'afterDeleteColumns',
                columns: deletedColumns,
                columnIds,
                detail: eventDetail
            });
            return deletedColumns;
        }
    }
    /**
     * Deletes the row index references. This is useful when the original table
     * is deleted, and the references are no longer needed. This table is
     * then considered an original table or a table that has the same rows
     * order as the original table.
     */
    deleteRowIndexReferences() {
        delete this.originalRowIndexes;
        delete this.localRowIndexes;
    }
    /**
     * Deletes rows in this table.
     *
     * @function Highcharts.DataTable#deleteRows
     *
     * @param {number} [rowIndex]
     * Index to start delete of rows. If not specified, all rows will be
     * deleted.
     *
     * @param {number} [rowCount=1]
     * Number of rows to delete.
     *
     * @param {Highcharts.DataTableEventDetail} [eventDetail]
     * Custom information for pending events.
     *
     * @return {Array<Highcharts.DataTableRow>}
     * Returns the deleted rows, if found.
     *
     * @emits #deleteRows
     * @emits #afterDeleteRows
     */
    deleteRows(rowIndex, rowCount = 1, eventDetail) {
        const table = this, deletedRows = [], modifiedRows = [], modifier = table.modifier;
        table.emit({
            type: 'deleteRows',
            detail: eventDetail,
            rowCount,
            rowIndex: (rowIndex || 0)
        });
        if (typeof rowIndex === 'undefined') {
            rowIndex = 0;
            rowCount = table.rowCount;
        }
        if (rowCount > 0 && rowIndex < table.rowCount) {
            const columns = table.columns, columnIds = Object.keys(columns);
            for (let i = 0, iEnd = columnIds.length, column, deletedCells, columnId; i < iEnd; ++i) {
                columnId = columnIds[i];
                column = columns[columnId];
                const result = splice(column, rowIndex, rowCount);
                deletedCells = result.removed;
                columns[columnId] = column = result.array;
                if (!i) {
                    table.rowCount = column.length;
                }
                for (let j = 0, jEnd = deletedCells.length; j < jEnd; ++j) {
                    deletedRows[j] = (deletedRows[j] || []);
                    deletedRows[j][i] = deletedCells[j];
                }
                modifiedRows.push(new Array(iEnd));
            }
        }
        if (modifier) {
            modifier.modifyTable(table);
        }
        table.emit({
            type: 'afterDeleteRows',
            detail: eventDetail,
            rowCount,
            rowIndex: (rowIndex || 0),
            rows: deletedRows
        });
        return deletedRows;
    }
    /**
     * Emits an event on this table to all registered callbacks of the given
     * event.
     * @private
     *
     * @param {DataTable.Event} e
     * Event object with event information.
     */
    emit(e) {
        if ([
            'afterDeleteColumns',
            'afterDeleteRows',
            'afterSetCell',
            'afterSetColumns',
            'afterSetRows'
        ].includes(e.type)) {
            this.versionTag = uniqueKey();
        }
        fireEvent(this, e.type, e);
    }
    /**
     * Fetches a single cell value.
     *
     * @function Highcharts.DataTable#getCell
     *
     * @param {string} columnId
     * Column name of the cell to retrieve.
     *
     * @param {number} rowIndex
     * Row index of the cell to retrieve.
     *
     * @return {Highcharts.DataTableCellType|undefined}
     * Returns the cell value or `undefined`.
     */
    getCell(columnId, rowIndex) {
        const table = this;
        const column = table.columns[columnId];
        if (column) {
            return column[rowIndex];
        }
    }
    /**
     * Fetches the given column by the canonical column name.
     * This function is a simplified wrap of {@link getColumns}.
     *
     * @function Highcharts.DataTable#getColumn
     *
     * @param {string} columnId
     * Name of the column to get.
     *
     * @param {boolean} [asReference]
     * Whether to return the column as a readonly reference.
     *
     * @return {Highcharts.DataTableColumn|undefined}
     * A copy of the column, or `undefined` if not found.
     */
    getColumn(columnId, asReference) {
        return this.getColumns([columnId], asReference)[columnId];
    }
    /**
     * Fetches all column IDs.
     *
     * @function Highcharts.DataTable#getColumnIds
     *
     * @return {Array<string>}
     * Returns all column IDs.
     */
    getColumnIds() {
        return Object.keys(this.columns);
    }
    /**
     * Retrieves all or the given columns.
     *
     * @function Highcharts.DataTable#getColumns
     *
     * @param {Array<string>} [columnIds]
     * Column names to retrieve.
     *
     * @param {boolean} [asReference]
     * Whether to return columns as a readonly reference.
     *
     * @param {boolean} [asBasicColumns]
     * Whether to transform all typed array columns to normal arrays.
     *
     * @return {Highcharts.DataTableColumnCollection}
     * Collection of columns. If a requested column was not found, it is
     * `undefined`.
     */
    getColumns(columnIds, asReference, asBasicColumns) {
        const table = this, tableColumns = table.columns, columns = {};
        columnIds = (columnIds || Object.keys(tableColumns));
        for (let i = 0, iEnd = columnIds.length, column, columnId; i < iEnd; ++i) {
            columnId = columnIds[i];
            column = tableColumns[columnId];
            if (column) {
                if (asReference) {
                    columns[columnId] = column;
                }
                else if (asBasicColumns && !Array.isArray(column)) {
                    columns[columnId] = Array.from(column);
                }
                else {
                    columns[columnId] = column.slice();
                }
            }
        }
        return columns;
    }
    /**
     * Takes the original row index and returns the local row index in the
     * modified table for which this function is called.
     *
     * @param {number} originalRowIndex
     * Original row index to get the local row index for.
     *
     * @return {number|undefined}
     * Returns the local row index or `undefined` if not found.
     */
    getLocalRowIndex(originalRowIndex) {
        const { localRowIndexes } = this;
        if (localRowIndexes) {
            return localRowIndexes[originalRowIndex];
        }
        return originalRowIndex;
    }
    /**
     * Returns the modifier associated with this table, if any.
     *
     * @return {Highcharts.DataModifier|undefined}
     * Returns the modifier or `undefined`.
     *
     * @private
     */
    getModifier() {
        return this.modifier;
    }
    /**
     * Takes the local row index and returns the index of the corresponding row
     * in the original table.
     *
     * @param {number} rowIndex
     * Local row index to get the original row index for.
     *
     * @return {number|undefined}
     * Returns the original row index or `undefined` if not found.
     */
    getOriginalRowIndex(rowIndex) {
        const { originalRowIndexes } = this;
        if (originalRowIndexes) {
            return originalRowIndexes[rowIndex];
        }
        return rowIndex;
    }
    /**
     * Retrieves the row at a given index. This function is a simplified wrap of
     * {@link getRows}.
     *
     * @function Highcharts.DataTable#getRow
     *
     * @param {number} rowIndex
     * Row index to retrieve. First row has index 0.
     *
     * @param {Array<string>} [columnIds]
     * Column names in order to retrieve.
     *
     * @return {Highcharts.DataTableRow}
     * Returns the row values, or `undefined` if not found.
     */
    getRow(rowIndex, columnIds) {
        return this.getRows(rowIndex, 1, columnIds)[0];
    }
    /**
     * Returns the number of rows in this table.
     *
     * @function Highcharts.DataTable#getRowCount
     *
     * @return {number}
     * Number of rows in this table.
     */
    getRowCount() {
        // @todo Implement via property getter `.length` browsers supported
        return this.rowCount;
    }
    /**
     * Retrieves the index of the first row matching a specific cell value.
     *
     * @function Highcharts.DataTable#getRowIndexBy
     *
     * @param {string} columnId
     * Column to search in.
     *
     * @param {Highcharts.DataTableCellType} cellValue
     * Cell value to search for. `NaN` and `undefined` are not supported.
     *
     * @param {number} [rowIndexOffset]
     * Index offset to start searching.
     *
     * @return {number|undefined}
     * Index of the first row matching the cell value.
     */
    getRowIndexBy(columnId, cellValue, rowIndexOffset) {
        const table = this;
        const column = table.columns[columnId];
        if (column) {
            let rowIndex = -1;
            if (Array.isArray(column)) {
                // Normal array
                rowIndex = column.indexOf(cellValue, rowIndexOffset);
            }
            else if (isNumber(cellValue)) {
                // Typed array
                rowIndex = column.indexOf(cellValue, rowIndexOffset);
            }
            if (rowIndex !== -1) {
                return rowIndex;
            }
        }
    }
    /**
     * Retrieves the row at a given index. This function is a simplified wrap of
     * {@link getRowObjects}.
     *
     * @function Highcharts.DataTable#getRowObject
     *
     * @param {number} rowIndex
     * Row index.
     *
     * @param {Array<string>} [columnIds]
     * Column names and their order to retrieve.
     *
     * @return {Highcharts.DataTableRowObject}
     * Returns the row values, or `undefined` if not found.
     */
    getRowObject(rowIndex, columnIds) {
        return this.getRowObjects(rowIndex, 1, columnIds)[0];
    }
    /**
     * Fetches all or a number of rows as an object.
     *
     * @function Highcharts.DataTable#getRowObjects
     *
     * @param {number} [rowIndex]
     * Index of the first row to fetch. Defaults to first row at index `0`.
     *
     * @param {number} [rowCount]
     * Number of rows to fetch. Defaults to maximal number of rows.
     *
     * @param {Array<string>} [columnIds]
     * Column names and their order to retrieve.
     *
     * @return {Highcharts.DataTableRowObject}
     * Returns retrieved rows.
     */
    getRowObjects(rowIndex = 0, rowCount = (this.rowCount - rowIndex), columnIds) {
        const table = this, columns = table.columns, rows = new Array(rowCount);
        columnIds = (columnIds || Object.keys(columns));
        for (let i = rowIndex, i2 = 0, iEnd = Math.min(table.rowCount, (rowIndex + rowCount)), column, row; i < iEnd; ++i, ++i2) {
            row = rows[i2] = {};
            for (const columnId of columnIds) {
                column = columns[columnId];
                row[columnId] = (column ? column[i] : void 0);
            }
        }
        return rows;
    }
    /**
     * Fetches all or a number of rows as an array.
     *
     * @function Highcharts.DataTable#getRows
     *
     * @param {number} [rowIndex]
     * Index of the first row to fetch. Defaults to first row at index `0`.
     *
     * @param {number} [rowCount]
     * Number of rows to fetch. Defaults to maximal number of rows.
     *
     * @param {Array<string>} [columnIds]
     * Column names and their order to retrieve.
     *
     * @return {Highcharts.DataTableRow}
     * Returns retrieved rows.
     */
    getRows(rowIndex = 0, rowCount = (this.rowCount - rowIndex), columnIds) {
        const table = this, columns = table.columns, rows = new Array(rowCount);
        columnIds = (columnIds || Object.keys(columns));
        for (let i = rowIndex, i2 = 0, iEnd = Math.min(table.rowCount, (rowIndex + rowCount)), column, row; i < iEnd; ++i, ++i2) {
            row = rows[i2] = [];
            for (const columnId of columnIds) {
                column = columns[columnId];
                row.push(column ? column[i] : void 0);
            }
        }
        return rows;
    }
    /**
     * Returns the unique version tag of the current state of the table.
     *
     * @function Highcharts.DataTable#getVersionTag
     *
     * @return {string}
     * Unique version tag.
     */
    getVersionTag() {
        return this.versionTag;
    }
    /**
     * Determines whether all specified column names exist in the table.
     *
     * @function Highcharts.DataTable#hasColumns
     *
     * @param {Array<string>} columnIds
     * Column names to check.
     *
     * @return {boolean}
     * Returns `true` if all columns have been found, otherwise `false`.
     */
    hasColumns(columnIds) {
        const table = this, columns = table.columns;
        for (let i = 0, iEnd = columnIds.length, columnId; i < iEnd; ++i) {
            columnId = columnIds[i];
            if (!columns[columnId]) {
                return false;
            }
        }
        return true;
    }
    /**
     * Checks if any row in the specified column contains the given cell value.
     *
     * @function Highcharts.DataTable#hasRowWith
     *
     * @param {string} columnId
     * Column to search in.
     *
     * @param {Highcharts.DataTableCellType} cellValue
     * Cell value to search for. `NaN` and `undefined` are not supported.
     *
     * @return {boolean}
     * True, if a row has been found, otherwise false.
     */
    hasRowWith(columnId, cellValue) {
        const table = this;
        const column = table.columns[columnId];
        // Normal array
        if (Array.isArray(column)) {
            return (column.indexOf(cellValue) !== -1);
        }
        // Typed array
        if (defined(cellValue) && Number.isFinite(cellValue)) {
            return (column.indexOf(+cellValue) !== -1);
        }
        return false;
    }
    /**
     * Registers a callback function to be executed when a specific event is
     * emitted. To stop listening to the event, call the function returned by
     * this method.
     *
     * @function Highcharts.DataTable#on
     *
     * @param {string} type
     * Event type as a string.
     *
     * @param {Highcharts.EventCallbackFunction<Highcharts.DataTable>} callback
     * Function to register for an event callback.
     *
     * @return {Function}
     * Function to unregister callback from the event.
     */
    on(type, callback) {
        return addEvent(this, type, callback);
    }
    /**
     * Changes the ID of an existing column to a new ID, effectively renaming
     * the column.
     *
     * @function Highcharts.DataTable#changeColumnId
     *
     * @param {string} columnId
     * Id of the column to be changed.
     *
     * @param {string} newColumnId
     * New id of the column.
     *
     * @return {boolean}
     * Returns `true` if successful, `false` if the column was not found.
     */
    changeColumnId(columnId, newColumnId) {
        const table = this, columns = table.columns;
        if (columns[columnId]) {
            if (columnId !== newColumnId) {
                columns[newColumnId] = columns[columnId];
                delete columns[columnId];
            }
            return true;
        }
        return false;
    }
    /**
     * Sets the value of a specific cell identified by column ID and row index.
     * If the column does not exist, it will be created. If the row index is
     * beyond the current row count, the table will be expanded to accommodate
     * the new cell.
     *
     * @function Highcharts.DataTable#setCell
     *
     * @param {string} columnId
     * Column name to set.
     *
     * @param {number|undefined} rowIndex
     * Row index to set.
     *
     * @param {Highcharts.DataTableCellType} cellValue
     * Cell value to set.
     *
     * @param {Highcharts.DataTableEventDetail} [eventDetail]
     * Custom information for pending events.
     *
     * @emits #setCell
     * @emits #afterSetCell
     */
    setCell(columnId, rowIndex, cellValue, eventDetail) {
        const table = this, columns = table.columns, modifier = table.modifier;
        let column = columns[columnId];
        if (column && column[rowIndex] === cellValue) {
            return;
        }
        table.emit({
            type: 'setCell',
            cellValue,
            columnId: columnId,
            detail: eventDetail,
            rowIndex
        });
        if (!column) {
            column = columns[columnId] = new Array(table.rowCount);
        }
        if (rowIndex >= table.rowCount) {
            table.rowCount = (rowIndex + 1);
        }
        column[rowIndex] = cellValue;
        if (modifier) {
            modifier.modifyTable(table);
        }
        table.emit({
            type: 'afterSetCell',
            cellValue,
            columnId: columnId,
            detail: eventDetail,
            rowIndex
        });
    }
    /**
     * Replaces or updates multiple columns in the table with new data. If a
     * column does not exist, it will be created and added to the table.
     *
     * @function Highcharts.DataTable#setColumns
     *
     * @param {Highcharts.DataTableColumnCollection} columns
     * Columns as a collection, where the keys are the column names.
     *
     * @param {number} [rowIndex]
     * Index of the first row to change. Keep undefined to reset.
     *
     * @param {Highcharts.DataTableEventDetail} [eventDetail]
     * Custom information for pending events.
     *
     * @param {boolean} [typeAsOriginal=false]
     * Determines whether the original column retains its type when data
     * replaced. If `true`, the original column keeps its type. If not
     * (default), the original column will adopt the type of the replacement
     * column.
     *
     * @emits #setColumns
     * @emits #afterSetColumns
     */
    setColumns(columns, rowIndex, eventDetail, typeAsOriginal) {
        const table = this, tableColumns = table.columns, tableModifier = table.modifier, columnIds = Object.keys(columns);
        let rowCount = table.rowCount;
        table.emit({
            type: 'setColumns',
            columns,
            columnIds,
            detail: eventDetail,
            rowIndex
        });
        if (!defined(rowIndex) && !typeAsOriginal) {
            super.setColumns(columns, rowIndex, extend(eventDetail, { silent: true }));
        }
        else {
            for (let i = 0, iEnd = columnIds.length, column, tableColumn, columnId, ArrayConstructor; i < iEnd; ++i) {
                columnId = columnIds[i];
                column = columns[columnId];
                tableColumn = tableColumns[columnId];
                ArrayConstructor = Object.getPrototypeOf((tableColumn && typeAsOriginal) ? tableColumn : column).constructor;
                if (!tableColumn) {
                    tableColumn = new ArrayConstructor(rowCount);
                }
                else if (ArrayConstructor === Array) {
                    if (!Array.isArray(tableColumn)) {
                        tableColumn = Array.from(tableColumn);
                    }
                }
                else if (tableColumn.length < rowCount) {
                    tableColumn =
                        new ArrayConstructor(rowCount);
                    tableColumn.set(tableColumns[columnId]);
                }
                tableColumns[columnId] = tableColumn;
                for (let i = (rowIndex || 0), iEnd = column.length; i < iEnd; ++i) {
                    tableColumn[i] = column[i];
                }
                rowCount = Math.max(rowCount, column.length);
            }
            this.applyRowCount(rowCount);
        }
        if (tableModifier) {
            tableModifier.modifyTable(table);
        }
        table.emit({
            type: 'afterSetColumns',
            columns,
            columnIds,
            detail: eventDetail,
            rowIndex
        });
    }
    /**
     * Assigns a new data modifier to the table.
     *
     * This method does not modify the table directly. Instead, it sets the
     * `.modified` property of the table with a modified copy of this table,
     * as produced by the modifier.
     *
     * @param {Highcharts.DataModifier} [modifier]
     * Modifier to set, or `undefined` to unset.
     *
     * @param {Highcharts.DataTableEventDetail} [eventDetail]
     * Custom information for pending events.
     *
     * @return {Promise<Highcharts.DataTable>}
     * Resolves to this table if successful, or rejects on failure.
     *
     * @emits #setModifier
     * @emits #afterSetModifier
     */
    setModifier(modifier, eventDetail) {
        const table = this;
        let promise;
        table.emit({
            type: 'setModifier',
            detail: eventDetail,
            modifier,
            modified: table.getModified()
        });
        table.modifier = modifier;
        if (modifier) {
            promise = modifier.modify(table);
        }
        else {
            promise = Promise.resolve(table);
        }
        return promise
            .then((table) => {
            table.emit({
                type: 'afterSetModifier',
                detail: eventDetail,
                modifier,
                modified: table.getModified()
            });
            return table;
        })['catch']((error) => {
            table.emit({
                type: 'setModifierError',
                error,
                modifier,
                modified: table.getModified()
            });
            throw error;
        });
    }
    /**
     * Sets the original row indexes for the table. It is used to keep the
     * reference to the original rows when modifying the table.
     *
     * @param {Array<number|undefined>} originalRowIndexes
     * Original row indexes array.
     *
     * @param {boolean} omitLocalRowIndexes
     * Whether to omit the local row indexes calculation. Defaults to `false`.
     */
    setOriginalRowIndexes(originalRowIndexes, omitLocalRowIndexes = false) {
        this.originalRowIndexes = originalRowIndexes;
        if (omitLocalRowIndexes) {
            return;
        }
        const modifiedIndexes = this.localRowIndexes = [];
        for (let i = 0, iEnd = originalRowIndexes.length, originalIndex; i < iEnd; ++i) {
            originalIndex = originalRowIndexes[i];
            if (defined(originalIndex)) {
                modifiedIndexes[originalIndex] = i;
            }
        }
    }
    /**
     * Sets cell values of a row. Will insert a new row, if no index was
     * provided, or if the index is higher than the total number of table rows.
     *
     * Note: This function is just a simplified wrap of
     * {@link Highcharts.DataTable#setRows}.
     *
     * @function Highcharts.DataTable#setRow
     *
     * @param {Highcharts.DataTableRow|Highcharts.DataTableRowObject} row
     * Cell values to set.
     *
     * @param {number} [rowIndex]
     * Index of the row to set. Leave `undefind` to add as a new row.
     *
     * @param {boolean} [insert]
     * Whether to insert the row at the given index, or to overwrite the row.
     *
     * @param {Highcharts.DataTableEventDetail} [eventDetail]
     * Custom information for pending events.
     *
     * @emits #setRows
     * @emits #afterSetRows
     */
    setRow(row, rowIndex, insert, eventDetail) {
        this.setRows([row], rowIndex, insert, eventDetail);
    }
    /**
     * Sets cell values for multiple rows. Will insert new rows, if no index was
     * was provided, or if the index is higher than the total number of table
     * rows.
     *
     * @function Highcharts.DataTable#setRows
     *
     * @param {Array<(Highcharts.DataTableRow|Highcharts.DataTableRowObject)>} rows
     * Row values to set.
     *
     * @param {number} [rowIndex]
     * Index of the first row to set. Leave `undefined` to add as new rows.
     *
     * @param {boolean} [insert]
     * Whether to insert the row at the given index, or to overwrite the row.
     *
     * @param {Highcharts.DataTableEventDetail} [eventDetail]
     * Custom information for pending events.
     *
     * @emits #setRows
     * @emits #afterSetRows
     */
    setRows(rows, rowIndex = this.rowCount, insert, eventDetail) {
        const table = this, columns = table.columns, columnIds = Object.keys(columns), modifier = table.modifier, rowCount = rows.length;
        table.emit({
            type: 'setRows',
            detail: eventDetail,
            rowCount,
            rowIndex,
            rows
        });
        for (let i = 0, i2 = rowIndex, row; i < rowCount; ++i, ++i2) {
            row = rows[i];
            if (Object.keys(row).length === 0) { // Is empty Object
                for (let j = 0, jEnd = columnIds.length; j < jEnd; ++j) {
                    const column = columns[columnIds[j]];
                    if (insert) {
                        columns[columnIds[j]] = splice(column, i2, 0, true, [null]).array;
                    }
                    else {
                        column[i2] = null;
                    }
                }
            }
            else if (Array.isArray(row)) {
                for (let j = 0, jEnd = columnIds.length; j < jEnd; ++j) {
                    columns[columnIds[j]][i2] = row[j];
                }
            }
            else {
                super.setRow(row, i2, void 0, { silent: true });
            }
        }
        const indexRowCount = insert ?
            rowCount + rows.length :
            rowIndex + rowCount;
        if (indexRowCount > table.rowCount) {
            table.rowCount = indexRowCount;
            for (let i = 0, iEnd = columnIds.length; i < iEnd; ++i) {
                const columnId = columnIds[i];
                columns[columnId] = setLength(columns[columnId], indexRowCount);
            }
        }
        if (modifier) {
            modifier.modifyTable(table);
        }
        table.emit({
            type: 'afterSetRows',
            detail: eventDetail,
            rowCount,
            rowIndex,
            rows
        });
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default DataTable;
