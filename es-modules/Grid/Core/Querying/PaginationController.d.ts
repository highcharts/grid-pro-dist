import QueryingController from './QueryingController.js';
import RangeModifier from '../../../Data/Modifiers/RangeModifier.js';
/**
 * Class that manages one of the data grid querying types - pagination.
 */
declare class PaginationController {
    /**
     * The grid instance.
     */
    private querying;
    /**
     * Whether the pagination is enabled.
     */
    enabled: boolean;
    /**
     * The current page (1-based index).
     */
    currentPage: number;
    /**
     * The current page size.
     */
    currentPageSize: number;
    /**
     * The number of rows before pagination.
     */
    private _totalItems?;
    /**
     * Constructs the PaginationController instance.
     *
     * @param querying
     * The querying controller instance.
     */
    constructor(querying: QueryingController);
    /**
     * Total number of items (rows)
     */
    get totalItems(): number;
    /**
     * Gets the total number of pages.
     */
    get totalPages(): number;
    /**
     * Clamps the current page to the total number of pages.
     */
    clampPage(): void;
    /**
     * Sets the page.
     *
     * @param currentPage
     * The current page.
     */
    setPage(currentPage: number): void;
    /**
     * Sets the page size.
     *
     * @param pageSize
     * The page size.
     */
    setPageSize(pageSize: number): void;
    /**
     * Loads range options from the grid options.
     */
    loadOptions(): void;
    /**
     * Returns the range modifier.
     *
     * @param rowsCountBeforePagination
     * The number of rows before pagination. Default is the number of rows in
     * the original data table.
     */
    createModifier(rowsCountBeforePagination?: number): RangeModifier | undefined;
}
export default PaginationController;
