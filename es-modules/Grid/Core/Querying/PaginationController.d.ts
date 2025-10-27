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
     * The current page.
     */
    currentPage?: number;
    /**
     * The number of rows before pagination.
     */
    totalItems?: number;
    /**
     * Constructs the PaginationController instance.
     *
     * @param querying
     * The querying controller instance.
     */
    constructor(querying: QueryingController);
    /**
     * Sets the range options.
     *
     * @param currentPage
     * The current page.
     */
    setRange(currentPage: number): void;
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
    /**
     * Reset the pagination controller.
     */
    reset(): void;
}
export default PaginationController;
