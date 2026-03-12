import type { ColumnSortingOrder, Options, GroupedHeaderOptions } from './Options';
import type { DataProviderType } from './Data/DataProviderType';
import type { NoIdColumnOptions } from './Table/Column';
import type Popup from './UI/Popup.js';
import Accessibility from './Accessibility/Accessibility.js';
import DataTable from '../../Data/DataTable.js';
import Table from './Table/Table.js';
import TimeBase from '../../Shared/TimeBase.js';
import Pagination from './Pagination/Pagination.js';
/**
 * A base class for the Grid.
 */
export declare class Grid {
    /**
     * Creates a new Grid.
     *
     * @param renderTo
     * The render target (html element or id) of the Grid.
     *
     * @param options
     * The options of the Grid.
     *
     * @param async
     * Whether to initialize the dashboard asynchronously. When true, the
     * function returns a promise that resolves with the dashboard instance.
     *
     * @return
     * The new Grid.
     */
    static grid(renderTo: string | HTMLElement, options: Options, async?: boolean): Grid;
    /**
     * Creates a new Grid.
     *
     * @param renderTo
     * The render target (html element or id) of the Grid.
     *
     * @param options
     * The options of the Grid.
     *
     * @param async
     * Whether to initialize the dashboard asynchronously. When true, the
     * function returns a promise that resolves with the dashboard instance.
     *
     * @return
     * Promise that resolves with the new Grid.
     */
    static grid(renderTo: string | HTMLElement, options: Options, async: true): Promise<Grid>;
    /**
     * An array containing the current Grid objects in the page.
     * @private
     */
    static readonly grids: Array<(Grid | undefined)>;
    /**
     * The accessibility controller.
     */
    accessibility?: Accessibility;
    /**
     * The Pagination controller.
     */
    pagination?: Pagination;
    /**
     * The caption element of the Grid.
     */
    captionElement?: HTMLElement;
    /**
     * The container of the grid.
     */
    container?: HTMLElement;
    /**
     * The content container of the Grid.
     */
    contentWrapper?: HTMLElement;
    /**
     * The description element of the Grid.
     */
    descriptionElement?: HTMLElement;
    /**
     * The container element of the loading indicator overlaying the Grid.
     */
    loadingWrapper?: HTMLElement;
    /**
     * The HTML element of the table.
     */
    tableElement?: HTMLTableElement;
    /**
     * The options of the Grid. Contains the options that were declared
     * by the user and some of the default options.
     */
    options?: Options;
    /**
     * The options that were declared by the user when creating the Grid
     * or when updating it.
     */
    userOptions: Partial<Options>;
    /**
     * The table (viewport) element of the Grid.
     */
    viewport?: Table;
    /**
     * The time instance.
     */
    time: TimeBase;
    /**
     * The locale of the Grid.
     */
    locale?: string | string[];
    /**
     * The unique ID of the Grid.
     */
    readonly id: string;
    /**
     * The list of currently shown popups.
     */
    popups: Set<Popup>;
    /**
     * The render target (container) of the Grid.
     */
    private renderTo;
    /**
     * Whether the Grid is rendered.
     */
    private isRendered;
    /**
     * Internal redraw queue used to prevent concurrent `redraw()` calls from
     * interleaving async DOM work and corrupting the state (for example
     * rendering duplicate pagination controls when `update()` is called
     * multiple times without awaiting).
     */
    private redrawQueue;
    dataProvider?: DataProviderType;
    /**
     * Constructs a new Grid.
     *
     * @param renderTo
     * The render target (container) of the Grid.
     *
     * @param options
     * The options of the Grid.
     *
     * @param afterLoadCallback
     * The callback that is called after the Grid is loaded.
     */
    constructor(renderTo: string | HTMLElement, options: Options, afterLoadCallback?: (grid: Grid) => void);
    /**
     * The data source of the Grid. It contains the original data table
     * that was passed to the Grid.
     *
     * @deprecated Use `dataProvider` instead.
     */
    get dataTable(): DataTable | undefined;
    /**
     * The presentation table of the Grid. It contains a modified version
     * of the data table that is used for rendering the Grid content. If
     * not modified, just a reference to the original data table.
     *
     * @deprecated Use `dataProvider` instead.
     */
    get presentationTable(): DataTable | undefined;
    private initAccessibility;
    private initPagination;
    /**
     * Initializes the container of the Grid.
     *
     * @param renderTo
     * The render target (html element or id) of the Grid.
     *
     */
    private initContainer;
    /**
     * Loads the new user options to all the important fields (`userOptions`,
     * `options` and `columnOptionsMap`).
     *
     * @param newOptions
     * The options that were declared by the user.
     *
     * @param oneToOne
     * When `false` (default), the existing column options will be merged with
     * the ones that are currently defined in the user options. When `true`,
     * the columns not defined in the new options will be removed.
     *
     * @returns
     * An object of the changed options.
     */
    private loadUserOptions;
    /**
     * Cleans up and reloads the column options from the `userOptions.columns`.
     * Generates the internal column options map from the options.columns array.
     */
    private reloadColumnOptions;
    /**
     * Loads the new column options to the userOptions field in a one-to-one
     * manner. It means that all the columns that are not defined in the new
     * options will be removed.
     *
     * @param newColumnOptions
     * The new column options that should be loaded.
     *
     * @returns
     * The difference between the previous and the new column options in form
     * of a record of `[column.id]: column.options`.
     */
    private setColumnOptionsOneToOne;
    update(options?: Options, render?: boolean, oneToOne?: boolean): Promise<void>;
    update(options: Options, render: false, oneToOne?: boolean): void;
    /**
     * Loads the column option diffs by updating the dirty flags.
     *
     * @param vp
     * The viewport that the column option diffs should be loaded for.
     *
     * @param columnId
     * The ID of the column that should be updated.
     *
     * @param columnDiff
     * The difference between the previous and the new column options in form
     * of a record of `[column.id]: column.options`. If `null`, assume that
     * it refers to the column defaults.
     */
    private loadColumnOptionDiffs;
    /**
     * Redraws the Grid in more optimized way than the regular render method.
     * It checks what parts of the Grid are marked as dirty and redraws only
     * them minimizing the number of DOM operations.
     */
    redraw(): Promise<void>;
    updateColumn(columnId: string, options: NoIdColumnOptions, render?: boolean, overwrite?: boolean): Promise<void>;
    updateColumn(columnId: string, options: NoIdColumnOptions, render?: false, overwrite?: boolean): void;
    /**
     * Sets the sorting order for one or more columns. Provide the sortings
     * in priority order. Use `null` to clear sorting.
     *
     * @param sortings
     * The sorting definition in priority order.
     */
    setSorting(sortings: Array<{
        columnId: string;
        order: ColumnSortingOrder;
    }> | null): Promise<void>;
    private render;
    /**
     * Hovers the row with the provided index. It removes the hover effect from
     * the previously hovered row.
     *
     * @param rowIndex
     * The index of the row.
     */
    hoverRow(rowIndex?: number): void;
    /**
     * Hovers the column with the provided ID. It removes the hover effect from
     * the previously hovered column.
     *
     * @param columnId
     * The ID of the column.
     */
    hoverColumn(columnId?: string): void;
    /**
     * Sets the sync state to the row with the provided index. It removes the
     * synced effect from the previously synced row.
     *
     * @param rowIndex
     * The index of the row.
     */
    syncRow(rowIndex?: number): void;
    /**
     * Sets the sync state to the column with the provided ID. It removes the
     * synced effect from the previously synced column.
     *
     * @param columnId
     * The ID of the column.
     */
    syncColumn(columnId?: string): void;
    /**
     * Renders the table (viewport) of the Grid.
     *
     * @returns
     * The newly rendered table (viewport) of the Grid.
     */
    private renderTable;
    /**
     * Renders a message that there is no data to display.
     */
    private renderNoData;
    /**
     * Returns the array of IDs of columns that should be displayed in the data
     * grid, in the correct order.
     */
    private getEnabledColumnIDs;
    private loadDataProvider;
    /**
     * Extracts all references to columnIds on all levels below defined level
     * in the settings.header structure.
     *
     * @param columnsTree
     * Structure that we start calculation
     *
     * @param [onlyEnabledColumns=true]
     * Extract all columns from header or columns filtered by enabled param
     * @returns
     */
    getColumnIds(columnsTree: Array<GroupedHeaderOptions | string>, onlyEnabledColumns?: boolean): string[];
    /**
     * Destroys the Grid.
     *
     * @param onlyDOM
     * Whether to destroy the Grid instance completely (`false` - default) or
     * just the DOM elements (`true`). If `true`, the Grid can be re-rendered
     * after destruction by calling the `render` method.
     */
    destroy(onlyDOM?: boolean): void;
    /**
     * Grey out the Grid and show a loading indicator.
     *
     * @param message
     * The message to display in the loading indicator.
     */
    showLoading(message?: string): void;
    /**
     * Removes the loading indicator.
     */
    hideLoading(): void;
    /**
     * Returns the grid data as a JSON string.
     *
     * **Note:** This method only works with `LocalDataProvider`.
     * For other data providers, use your data source directly.
     *
     * @deprecated
     *
     * @param modified
     * Whether to return the modified data table (after filtering/sorting/etc.)
     * or the unmodified, original one. Default value is set to `true`.
     *
     * @return
     * JSON representation of the data
     */
    getData(modified?: boolean): string;
    /**
     * Returns the current Grid options.
     *
     * @param onlyUserOptions
     * Whether to return only the user options or all options (user options
     * merged with the default ones). Default is `true`.
     *
     * @returns
     * Grid options.
     */
    getOptions(onlyUserOptions?: boolean): Partial<Options>;
}
export default Grid;
