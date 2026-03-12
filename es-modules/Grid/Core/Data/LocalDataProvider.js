/* *
 *
 *  Local Data Provider class
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
import { DataProvider } from './DataProvider.js';
import DataTable from '../../../Data/DataTable.js';
import ChainModifier from '../../../Data/Modifiers/ChainModifier.js';
import DataConnector from '../../../Data/Connectors/DataConnector.js';
import DataProviderRegistry from './DataProviderRegistry.js';
import { uniqueKey } from '../../../Core/Utilities.js';
import { defined, isNumber, isString } from '../../../Shared/Utilities.js';
/* *
 *
 *  Class
 *
 * */
/**
 * Local data provider for the Grid.
 *
 * Uses a DataTable instances to serve data to the grid, applying query
 * modifiers and persisting edits locally.
 */
export class LocalDataProvider extends DataProvider {
    constructor() {
        super(...arguments);
        /**
         * Unbind callbacks for DataTable events.
         */
        this.dataTableEventDestructors = [];
        /**
         * Unbind callbacks for connector events.
         */
        this.connectorEventDestructors = [];
    }
    /* *
     *
     *  Methods
     *
     * */
    async init() {
        if (this.dataTable) {
            return;
        }
        await this.initDataTable();
    }
    async initDataTable() {
        this.querying.shouldBeUpdated = true;
        this.clearDataTableEvents();
        this.clearConnector();
        if (this.options.connector) {
            await this.initConnector(this.options.connector);
            return;
        }
        let dataTable = this.options.dataTable;
        if (!dataTable) {
            dataTable = new DataTable({
                columns: this.options.columns ?? {}
            });
        }
        this.setDataTable(dataTable);
    }
    setDataTable(table) {
        this.dataTable = table;
        this.presentationTable = table.getModified();
        this.prePaginationRowCount = this.presentationTable?.rowCount ?? 0;
        for (const eventName of LocalDataProvider.tableChangeEventNames) {
            const fn = table.on(eventName, (e) => {
                void this.handleTableChange(e);
            });
            this.dataTableEventDestructors.push(fn);
        }
        const idColId = this.options.idColumn;
        if (idColId) {
            const idColumn = table.getColumn(idColId, true);
            if (!idColumn) {
                throw new Error(`Column "${idColId}" not found in table.`);
            }
            const map = new Map();
            for (let i = 0, len = idColumn.length; i < len; ++i) {
                const value = idColumn[i];
                if (!isString(value) && !isNumber(value)) {
                    throw new Error('idColumn must contain only string or number values.');
                }
                map.set(value, i);
            }
            if (map.size !== idColumn.length) {
                throw new Error('idColumn must contain unique values.');
            }
            this.originalRowIndexesMap = map;
        }
    }
    async handleTableChange(e) {
        this.querying.shouldBeUpdated = true;
        const grid = this.querying.grid;
        if (!grid?.viewport) {
            return;
        }
        if (e.type === 'afterSetCell' && e.detail?.fromGrid) {
            return;
        }
        if (this.options.updateOnChange) {
            await grid.viewport.updateRows();
        }
        // TODO: Handle this when Polling emits proper events.
        // grid.dirtyFlags.add((
        //     eventName === 'afterDeleteColumns' ||
        //     eventName === 'afterSetColumns'
        // ) ? 'grid' : 'rows');
        // await grid.redraw();
    }
    clearDataTableEvents() {
        this.dataTableEventDestructors.forEach((fn) => fn());
        this.dataTableEventDestructors.length = 0;
    }
    clearConnector() {
        this.connectorEventDestructors.forEach((fn) => fn());
        this.connectorEventDestructors.length = 0;
        this.connector?.stopPolling();
        this.connector = void 0;
    }
    async initConnector(connectorInput) {
        let connector;
        if (LocalDataProvider.isConnectorInstance(connectorInput)) {
            connector = connectorInput;
        }
        else {
            const ConnectorClass = DataConnector.types[connectorInput.type];
            if (!ConnectorClass) {
                throw new Error(`Connector type not found. (${connectorInput.type})`);
            }
            if (!connectorInput.id) {
                connectorInput.id = 'connector-' + uniqueKey();
            }
            connector = new ConnectorClass(connectorInput);
        }
        this.connector = connector;
        this.connectorEventDestructors.push(connector.on('afterLoad', () => {
            this.querying.shouldBeUpdated = true;
        }));
        this.setDataTable(connector.getTable());
        if ('enablePolling' in connector.options &&
            connector.options.enablePolling &&
            !connector.polling &&
            'dataRefreshRate' in connector.options) {
            connector.startPolling(Math.max(connector.options.dataRefreshRate || 0, 1) * 1000);
        }
        if (!connector.loaded) {
            try {
                await connector.load();
            }
            catch {
                return;
            }
        }
    }
    getColumnIds() {
        return Promise.resolve(this.presentationTable?.getColumnIds() ?? []);
    }
    /**
     * Returns the row ID for a given local row index. If not found, returns
     * `undefined`.
     *
     * If the `data.idColumn` option is set, the row ID is the value of the
     * row in the column with the given ID. Otherwise, the row ID is the
     * original row index.
     *
     * @param rowIndex
     * The local (presentation table) row index to get the row ID for.
     */
    async getRowId(rowIndex) {
        const originalRowIndex = await this.getOriginalRowIndexFromLocal(rowIndex);
        if (!defined(originalRowIndex) || !this.dataTable) {
            return Promise.resolve(void 0);
        }
        const idColId = this.options.idColumn;
        if (!idColId) {
            return Promise.resolve(originalRowIndex);
        }
        const rawId = this.dataTable.getCell(idColId, originalRowIndex);
        if (isString(rawId) || isNumber(rawId)) {
            return Promise.resolve(rawId);
        }
    }
    /**
     * Returns the local (presentation table) row index for a given row ID. If
     * not found, returns `undefined`.
     *
     * @param rowId
     * The row ID to get the row index for. If the `data.idColumn` option is
     * set, the row ID is the value of the row in the column with the given ID.
     * Otherwise, the row ID is the original row index.
     */
    getRowIndex(rowId) {
        if (!this.originalRowIndexesMap && isNumber(rowId)) {
            return this.getLocalRowIndexFromOriginal(rowId);
        }
        const originalRowIndex = this.originalRowIndexesMap?.get(rowId);
        if (!defined(originalRowIndex)) {
            return Promise.resolve(void 0);
        }
        return this.getLocalRowIndexFromOriginal(originalRowIndex);
    }
    /**
     * Returns the original row index for a given local row index.
     *
     * @param localRowIndex
     * The local row index to get the original row index for.
     */
    getOriginalRowIndexFromLocal(localRowIndex) {
        return Promise.resolve(this.presentationTable?.getOriginalRowIndex(localRowIndex));
    }
    /**
     * Returns the local (presentation table) row index for a given original
     * data table row index.
     *
     * @param originalRowIndex
     * The original data table row index to get the presentation table row index
     * for.
     */
    getLocalRowIndexFromOriginal(originalRowIndex) {
        return Promise.resolve(this.presentationTable?.getLocalRowIndex(originalRowIndex));
    }
    getRowObject(rowIndex) {
        return Promise.resolve(this.presentationTable?.getRowObject(rowIndex));
    }
    getPrePaginationRowCount() {
        return Promise.resolve(this.prePaginationRowCount ?? 0);
    }
    getRowCount() {
        return Promise.resolve(this.presentationTable?.getRowCount() ?? 0);
    }
    getValue(columnId, rowIndex) {
        return Promise.resolve(this.presentationTable?.getCell(columnId, rowIndex));
    }
    async setValue(value, columnId, rowId) {
        const localRowIndex = await this.getRowIndex(rowId);
        if (!defined(localRowIndex)) {
            // eslint-disable-next-line no-console
            console.error('[setValue] Wrong row ID:', rowId);
            return;
        }
        const rowIndex = await this.getOriginalRowIndexFromLocal(localRowIndex);
        if (!defined(rowIndex)) {
            // eslint-disable-next-line no-console
            console.error('[setValue] Wrong local row index:', localRowIndex);
            return;
        }
        this.dataTable?.setCell(columnId, rowIndex, value, { fromGrid: true });
        return;
    }
    /**
     * Applies querying modifiers and updates the presentation table.
     */
    async applyQuery() {
        const controller = this.querying;
        const originalDataTable = this.dataTable;
        if (!originalDataTable) {
            return;
        }
        const groupedModifiers = controller.getGroupedModifiers();
        let interTable;
        // Grouped modifiers
        if (groupedModifiers.length > 0) {
            const chainModifier = new ChainModifier({}, ...groupedModifiers);
            const dataTableCopy = originalDataTable.clone();
            await chainModifier.modify(dataTableCopy.getModified());
            interTable = dataTableCopy.getModified();
        }
        else {
            interTable = originalDataTable.getModified();
        }
        this.prePaginationRowCount = interTable.rowCount;
        // Pagination modifier
        const paginationModifier = controller.pagination.createModifier(interTable.rowCount);
        if (paginationModifier) {
            interTable = interTable.clone();
            await paginationModifier.modify(interTable);
            interTable = interTable.getModified();
        }
        this.presentationTable = interTable;
    }
    destroy() {
        this.clearDataTableEvents();
        this.clearConnector();
    }
    getColumnDataType(columnId) {
        const column = this.dataTable?.getColumn(columnId);
        if (!column) {
            return Promise.resolve('string');
        }
        if (!Array.isArray(column)) {
            // Typed array
            return Promise.resolve('number');
        }
        return Promise.resolve(DataProvider.assumeColumnDataType(column.slice(0, 30), columnId));
    }
    /**
     * Returns the current data table. When `presentation` is `true`, returns
     * the presentation table (after modifiers).
     *
     * @param presentation
     * Whether to return the presentation table (after modifiers).
     *
     * @return
     * The data table.
     */
    getDataTable(presentation = false) {
        return presentation ? this.presentationTable : this.dataTable;
    }
    /**
     * Checks if the object is an instance of DataConnector.
     *
     * @param connector
     * The object to check.
     *
     * @returns `true` if the object is an instance of DataConnector, `false`
     * otherwise.
     */
    static isConnectorInstance(connector) {
        return 'getTable' in connector;
    }
}
LocalDataProvider.tableChangeEventNames = [
    'afterDeleteColumns',
    'afterDeleteRows',
    'afterSetCell',
    'afterSetColumns',
    'afterSetRows'
];
DataProviderRegistry.registerDataProvider('local', LocalDataProvider);
