import type { RowObject as RowObjectType, CellType as DataTableCellType, Column as DataTableColumnType } from '../../../Data/DataTable';
import type QueryingController from '../Querying/QueryingController';
import type { ColumnDataType } from '../Table/Column';
/**
 * Base class for Grid data providers.
 *
 * Data providers are responsible for serving data to the grid, applying query
 * modifiers and persisting edits.
 */
export declare abstract class DataProvider {
    /**
     * Querying controller used to build and apply modifiers.
     */
    protected readonly querying: QueryingController;
    /**
     * Provider options as passed via `grid.options.data`.
     */
    protected readonly options: DataProviderOptions;
    constructor(queryingController: QueryingController, options: DataProviderOptions);
    /**
     * Initializes the data provider.
     */
    init(): Promise<void>;
    /**
     * Returns all available column IDs.
     */
    abstract getColumnIds(): Promise<string[]>;
    /**
     * Returns a stable row id for a given row index (as used by the viewport).
     */
    abstract getRowId(rowIndex: number): Promise<RowId | undefined>;
    /**
     * Returns the current row index for a given stable row id.
     */
    abstract getRowIndex(rowId: RowId): Promise<number | undefined>;
    /**
     * Returns a row as an object keyed by column IDs.
     */
    abstract getRowObject(rowIndex: number): Promise<RowObjectType | undefined>;
    /**
     * Returns the current number of rows in the presentation dataset (after
     * applying all query modifiers).
     */
    abstract getRowCount(): Promise<number>;
    /**
     * Returns the assumed / configured data type for a column.
     */
    abstract getColumnDataType(columnId: string): Promise<ColumnDataType>;
    /**
     * Returns a cell value for a given column and row index.
     */
    abstract getValue(columnId: string, rowIndex: number): Promise<DataTableCellType>;
    /**
     * Persists a cell value for a given row id.
     */
    abstract setValue(value: DataTableCellType, columnId: string, rowId: RowId): Promise<void>;
    /**
     * Applies the current query modifiers to update the provider's presentation
     * state.
     */
    abstract applyQuery(): Promise<void>;
    /**
     * Destroys the provider and releases resources.
     */
    abstract destroy(): void;
    /**
     * Returns the number of items before pagination has been applied.
     */
    getPrePaginationRowCount(): Promise<number>;
    /**
     * Helper method to assume the data type of a column based on the sample
     * of the column data.
     *
     * @param columnSample
     * The sample of the column data to determine the data type from.
     *
     * @param columnId
     * The id of the column to determine the data type for.
     */
    protected static assumeColumnDataType(columnSample: DataTableColumnType, columnId: string): ColumnDataType;
}
/**
 * A type for the row ID.
 */
export type RowId = number | string;
/**
 * A base interface for the data provider options (`grid.options.data`).
 */
export interface DataProviderOptions {
    /**
     * The type of the data provider.
     *
     * @default 'local'
     */
    providerType?: string;
}
export default DataProvider;
