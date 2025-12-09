import type Grid from '../Grid';
import type { PaginationOptions, PaginationLangOptions } from './PaginationOptions';
/**
 *  Representing the pagination functionalities for the Grid.
 */
declare class Pagination {
    /**
     * Default options of the pagination.
     */
    static defaultOptions: PaginationOptions;
    /**
     * The pagination container element (div for top/bottom,
     * tfoot cell for footer, or custom element).
     */
    private paginationContainer?;
    /**
     * The pagination controller instance.
     */
    private readonly controller;
    /**
     * The Grid Table instance which the pagination belongs to.
     */
    grid: Grid;
    /**
     * The content container of the Pagination.
     */
    contentWrapper?: HTMLElement;
    /**
     * Navigation first button
     */
    firstButton?: HTMLElement;
    /**
     * Navigation previous button
     */
    prevButton?: HTMLElement;
    /**
     * Navigation next button
     */
    nextButton?: HTMLElement;
    /**
     * Navigation last button
     */
    lastButton?: HTMLElement;
    /**
     * Page number buttons container
     */
    pageNumbersContainer?: HTMLElement;
    /**
     * Items per page selector dropdown
     */
    pageSizeSelect?: HTMLSelectElement;
    /**
     * Page selector dropdown
     */
    dropdownPageSelector?: HTMLSelectElement;
    /**
     * Page info text element
     */
    pageInfoElement?: HTMLElement;
    /**
     * Old total number of items (rows) to compare with the current total items.
     */
    private oldTotalItems?;
    /**
     * Construct the pagination object.
     *
     * @param grid
     * The Grid Table instance which the pagination controller belongs to.
     */
    constructor(grid: Grid);
    /**
     * Returns the reference to the pagination options.
     */
    get options(): PaginationOptions | undefined;
    /**
     * Returns the language options for pagination text.
     */
    get lang(): PaginationLangOptions | undefined;
    /**
     * Returns the page size selector options.
     */
    get pageSizeSelectorOptions(): number[];
    /**
     * Render the pagination container.
     *
     * The pagination container is positioned based on the `position` option:
     * - `'top'`: Rendered before the table
     * - `'bottom'`: Rendered after the table (default)
     * - `'footer'`: Rendered inside a tfoot element
     * - `'#id'` or any string: Rendered inside a custom container with
     * the specified ID.
     */
    render(): void;
    /**
     * Render pagination in a tfoot element.
     */
    private renderFooter;
    /**
     * Render pagination in a custom container by ID.
     *
     * @param id
     * The ID of the custom container.
     */
    private renderCustomContainer;
    /**
     * Render the page information text.
     */
    renderPageInfo(): void;
    /**
     * Update the page information text.
     */
    updatePageInfo(): void;
    /**
     * Render the controls buttons and page numbers.
     */
    renderControls(): void;
    /**
     * Render the first page button.
     *
     * @param container
     * The container element for the first page button.
     *
     */
    renderFirstButton(container: HTMLElement): void;
    /**
     * Render the previous page button.
     *
     * @param container
     * The container element for the previous page button.
     */
    renderPrevButton(container: HTMLElement): void;
    /**
     * Render the next page button.
     *
     * @param container
     * The container element for the next page button.
     */
    renderNextButton(container: HTMLElement): void;
    /**
     * Render the last page button.
     *
     * @param container
     * The container element for the last page button.
     */
    renderLastButton(container: HTMLElement): void;
    /**
     * Render page number buttons with ellipsis.
     *
     * @param container
     * The container element for the page number buttons.
     */
    renderPageNumbers(container: HTMLElement): void;
    /**
     * Update page number buttons based on current page and total pages.
     */
    updatePageNumbers(): void;
    /**
     * Create a page number button.
     *
     * @param pageNumber
     * The page number to create a button for.
     *
     * @param isActive
     * Whether the page number button is active.
     */
    createPageButton(pageNumber: number, isActive: boolean): void;
    /**
     * Create an ellipsis element.
     */
    createEllipsis(): void;
    /**
     * Render the page size selector.
     */
    renderPageSizeSelector(): void;
    /**
     * Sets the new options for the pagination.
     *
     * @param newOptions
     * The new options to set.
     */
    private setOptions;
    /**
     * Set the page size and recalculate pagination.
     *
     * @param newPageSize
     * The new page size to set.
     */
    setPageSize(newPageSize: number): Promise<void>;
    /**
     * Navigate to a specific page.
     *
     * @param pageNumber
     * The page number to navigate to.
     */
    goToPage(pageNumber: number): Promise<void>;
    /**
     * Update the grid's pagination state.
     */
    updateGridPagination(): Promise<void>;
    /**
     * Update button states based on current page.
     */
    updateButtonStates(): void;
    /**
     * Call modifier to replace items with new ones.
     *
     * @param isNextPage
     * Declare prev or next action triggered by button.
     * @returns
     */
    updatePage(isNextPage?: boolean): Promise<void>;
    /**
     * Set button state (enabled/disabled).
     *
     * @param button
     * The button to set the state for.
     *
     * @param disabled
     * Whether the button should be disabled.
     */
    setButtonState(button: HTMLElement, disabled?: boolean): void;
    /**
     * Reflow the pagination container.
     */
    reflow(): void;
    /**
     * Destroy the pagination instance.
     */
    destroy(): void;
    /**
     * Render the dropdown page selector (select dropdown).
     *
     * @param container
     * The container element for the dropdown page selector.
     */
    renderDropdownPageSelector(container: HTMLElement): void;
    /**
     * Updates the dropdown page selector DOM elements.
     */
    private updateDropdownPageSelector;
    /**
     * Update the row count for a11y.
     *
     * @param currentPageSize
     * The current page size.
     */
    updateA11yRowsCount(currentPageSize: number): void;
}
export interface PaginationState {
    currentPage?: number;
    currentPageSize?: number;
}
export default Pagination;
