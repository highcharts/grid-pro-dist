import type { DataProviderOptions, RowId } from './DataProvider';
import { DataTableValue } from '../../../Data/DataTableOptions';
import type { ColumnDataType } from '../Table/Column';
import type { RowObject as RowObjectType, CellType as DataTableCellType } from '../../../Data/DataTable';
import type DataConnectorType from '../../../Data/Connectors/DataConnectorType';
import type { DataConnectorTypeOptions } from '../../../Data/Connectors/DataConnectorType';
import type { MakeOptional, TypedArray } from '../../../Shared/Types';
import { DataProvider } from './DataProvider.js';
import DataTable from '../../../Data/DataTable.js';
/**
 * Local data provider for the Grid.
 *
 * Uses a DataTable instances to serve data to the grid, applying query
 * modifiers and persisting edits locally.
 */
export declare class LocalDataProvider extends DataProvider {
    static readonly tableChangeEventNames: readonly ["afterDeleteColumns", "afterDeleteRows", "afterSetCell", "afterSetColumns", "afterSetRows"];
    /**
     * The provider options.
     */
    readonly options: LocalDataProviderOptions;
    /**
     * The original table. Mutations (e.g. setValue) are applied here.
     */
    private dataTable?;
    /**
     * The connector instance used to populate the table.
     */
    private connector?;
    /**
     * The presentation table after applying query modifiers.
     */
    private presentationTable?;
    /**
     * The row count before pagination is applied.
     */
    private prePaginationRowCount?;
    /**
     * Unbind callbacks for DataTable events.
     */
    private dataTableEventDestructors;
    /**
     * Unbind callbacks for connector events.
     */
    private connectorEventDestructors;
    /**
     * Map of row IDs (from `idColumn`) to original data table row indexes.
     * Set only when `options.idColumn` is configured.
     */
    private originalRowIndexesMap?;
    init(): Promise<void>;
    private initDataTable;
    private setDataTable;
    private handleTableChange;
    private clearDataTableEvents;
    private clearConnector;
    private initConnector;
    getColumnIds(): Promise<string[]>;
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
    getRowId(rowIndex: number): Promise<RowId | undefined>;
    /**
     * Returns the local (presentation table) row index for a given row ID. If
     * not found, returns `undefined`.
     *
     * @param rowId
     * The row ID to get the row index for. If the `data.idColumn` option is
     * set, the row ID is the value of the row in the column with the given ID.
     * Otherwise, the row ID is the original row index.
     */
    getRowIndex(rowId: RowId): Promise<number | undefined>;
    /**
     * Returns the original row index for a given local row index.
     *
     * @param localRowIndex
     * The local row index to get the original row index for.
     */
    getOriginalRowIndexFromLocal(localRowIndex: number): Promise<number | undefined>;
    /**
     * Returns the local row index for a given original row index.
     *
     * @param originalRowIndex
     * The original row index to get the local row index for.
     */
    getLocalRowIndexFromOriginal(originalRowIndex: number): Promise<number | undefined>;
    getRowObject(rowIndex: number): Promise<RowObjectType | undefined>;
    getPrePaginationRowCount(): Promise<number>;
    getRowCount(): Promise<number>;
    getValue(columnId: string, rowIndex: number): Promise<DataTableCellType>;
    setValue(value: DataTableCellType, columnId: string, rowId: RowId): Promise<void>;
    /**
     * Applies querying modifiers and updates the presentation table.
     */
    applyQuery(): Promise<void>;
    private createOriginalRowIndexesMap;
    private resolveOriginalRowIndex;
    destroy(): void;
    getColumnDataType(columnId: string): Promise<ColumnDataType>;
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
    getDataTable(presentation?: boolean): DataTable | undefined;
    /**
     * Checks if the object is an instance of DataConnector.
     *
     * @param connector
     * The object to check.
     *
     * @returns `true` if the object is an instance of DataConnector, `false`
     * otherwise.
     */
    private static isConnectorInstance;
}
export type GridDataConnectorTypeOptions = MakeOptional<DataConnectorTypeOptions, 'id'>;
export interface LocalDataProviderOptions extends DataProviderOptions {
    /**
     * The local data provider type.
     *
     * @default 'local'
     */
    providerType?: 'local';
    /**
     * Data table as a source of data for the grid.
     *
     * @sample grid-lite/options/data-table-instance
     *         Data from a DataTable instance
     */
    dataTable?: DataTable;
    /**
     * Connector instance or options used to populate the data table.
     *
     * @sample grid-lite/basic/data-connector
     *         Data from connector
     */
    connector?: GridDataConnectorTypeOptions | DataConnectorType;
    /**
     * Columns data to initialize the Grid with.
     *
     * @sample grid-lite/options/data-columns
     *         Data from column arrays
     */
    columns?: Record<string, Array<DataTableValue> | TypedArray>;
    /**
     * Automatically update the grid when the data table changes. It is disabled
     * by default unles the pagination is enabled.
     *
     * Use this option if you want the polling to update the grid when the data
     * table changes.
     *
     * @default false
     */
    updateOnChange?: boolean;
    /**
     * The column ID that contains the stable, unique row IDs. If not
     * provided, the original row index is used as the row ID.
     */
    idColumn?: string;
}
declare module './DataProviderType' {
    interface DataProviderTypeRegistry {
        local: typeof LocalDataProvider;
    }
}
