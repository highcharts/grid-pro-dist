import type { CellValueGetterCallback, IndividualColumnOptions } from '../Options';
import type Cell from './Cell';
import type CellContent from './CellContent/CellContent';
import type HeaderCell from './Header/HeaderCell';
import type { CellType as DataTableCellType, Column as DataTableColumn } from '../../../Data/DataTable';
import Table from './Table.js';
import ColumnSorting from './Actions/ColumnSorting';
import ColumnFiltering from './Actions/ColumnFiltering/ColumnFiltering.js';
import TableCell from './Body/TableCell';
/**
 * Represents a column in the data grid.
 */
export declare class Column {
    /**
     * The viewport (table) the column belongs to.
     */
    readonly viewport: Table;
    /**
     * Type of the data in the column.
     */
    dataType: ColumnDataType;
    /**
     * The cells of the column.
     */
    cells: Cell[];
    /**
     * The id of the column (`name` in the Data Table).
     */
    id: string;
    /**
     * The data of the column. Shouldn't be used directly in all cases, because
     * it's not guaranteed to be defined (e.g. when using the lazy loading,
     * `RemoteDataProvider`).
     */
    data?: DataTableColumn;
    /**
     * The options of the column as a proxy that provides merged access to
     * original options and defaults if not defined in the individual options.
     */
    options: NoIdColumnOptions;
    /**
     * The index of the column in the viewport.
     */
    readonly index: number;
    /**
     * The wrapper for content of head.
     */
    header?: HeaderCell;
    /**
     * Sorting column module.
     */
    sorting?: ColumnSorting;
    /**
     * Class names applied to every element of the column (header, body and
     * filter cells): the ones from the `className` option, plus the ones
     * features contribute.
     */
    readonly classNames: string[];
    /**
     * Cell value resolver installed by a feature that derives the column values
     * from the rest of the row (the Grid Pro `columnAggregator` option). A user
     * `cells.valueGetter` takes precedence over it, and returning nothing falls
     * back to the column's own data.
     */
    valueResolver?: CellValueGetterCallback;
    /**
     * Filtering column module.
     */
    filtering?: ColumnFiltering;
    /**
     * Constructs a column in the data grid.
     *
     * @param viewport
     * The viewport (table) the column belongs to.
     *
     * @param id
     * The id of the column (`name` in the Data Table).
     *
     * @param index
     * The index of the column.
     */
    constructor(viewport: Table, id: string, index: number);
    /**
     * Initializes the column data-related properties.
     */
    init(): Promise<void>;
    /**
     * Loads the data of the column from the viewport's data table.
     */
    loadData(): void;
    /**
     * Resolves the raw value for a table cell.
     *
     * @param cell
     * The cell to resolve the value for.
     */
    getCellValue(cell: TableCell): Promise<DataTableCellType>;
    /**
     * Whether the column derives its cell values from the row instead of
     * reading them from the data, so editing a cell of the row must re-resolve
     * them.
     */
    isDerived(): boolean;
    /**
     * Keeps a value the grid resolves for a cell within the column's declared
     * `dataType`, so cell formatters and renderers written for the column never
     * receive a foreign type. Values derived by the grid are the usual source:
     * a numeric aggregator over a text column resolves to `0`.
     *
     * @param value
     * Resolved cell value.
     */
    conformValue(value: DataTableCellType): DataTableCellType;
    /**
     * Creates a cell content instance.
     *
     * @param cell
     * The cell that is to be edited.
     *
     */
    createCellContent(cell: TableCell): CellContent;
    /**
     * Assumes the data type of the column based on the options or data in the
     * column if not specified.
     */
    private assumeDataType;
    /**
     * Adds the column class names to one of its elements.
     *
     * @param element
     * Element of the column (a header, body or filter cell).
     */
    applyClassNames(element: HTMLElement): void;
    /**
     * Registers a cell in the column.
     *
     * @param cell
     * The cell to register.
     */
    registerCell(cell: Cell): void;
    /**
     * Unregister a cell from the column.
     *
     * @param cell
     * The cell to unregister.
     */
    unregisterCell(cell: Cell): void;
    /**
     * Returns the width of the column in pixels.
     */
    getWidth(): number;
    /**
     * Adds or removes the hovered CSS class to the column element
     * and its cells.
     *
     * @param hovered
     * Whether the column should be hovered.
     */
    setHoveredState(hovered: boolean): void;
    /**
     * Adds or removes the synced CSS class to the column element
     * and its cells.
     *
     * @param synced
     * Whether the column should have synced state.
     */
    setSyncedState(synced: boolean): void;
    /**
     * Returns the formatted string where the templating context is the column.
     *
     * @param template
     * The template string.
     *
     * @return
     * The formatted string.
     */
    format(template: string): string;
    update(options: NoIdColumnOptions, render?: boolean): void;
    update(options: NoIdColumnOptions, render?: true): Promise<void>;
}
export type NoIdColumnOptions = Omit<IndividualColumnOptions, 'id'>;
export type ColumnDataType = 'string' | 'number' | 'boolean' | 'datetime';
export default Column;
