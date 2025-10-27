/* *
 *
 *  Grid Pagination class
 *
 *  (c) 2020-2025 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Sebastian Bochan
 *
 * */
'use strict';
import Icons from './Icons.js';
import Defaults from '../Defaults.js';
import Globals from '../Globals.js';
import GridUtils from '../GridUtils.js';
import Utilities from '../../../Core/Utilities.js';
import AST from '../../../Core/Renderer/HTML/AST.js';
const { makeHTMLElement } = GridUtils;
const { merge, fireEvent, isObject, defined } = Utilities;
/**
 *  Representing the pagination functionalities for the Grid.
 */
class Pagination {
    /* *
    *
    *  Constructor
    *
    * */
    /**
     * Construct the pagination object.
     *
     * @param grid
     * The Grid Table instance which the pagination controller belongs to.
     *
     * @param options
     * The Pagination user options.
     *
     * @param state
     * The Pagination state. Used to restore the previous state after the Grid
     * is destroyed.
     */
    constructor(grid, options, state = {}) {
        /**
         * Current page number, starting from 1.
         */
        this.currentPage = 1;
        this.grid = grid;
        this.options = merge(Pagination.defaultOptions, options);
        const pageSizeSelector = this.options.controls.pageSizeSelector;
        this.pageSizeOptions = isObject(pageSizeSelector) ?
            pageSizeSelector.options :
            Pagination.defaultOptions.controls.pageSizeSelector.options; // eslint-disable-line
        this.currentPageSize =
            state.currentPageSize ||
                this.options.pageSize ||
                this.pageSizeOptions[0];
        // Lang pack
        this.lang = merge(Defaults.defaultOptions.pagination, this.grid.options?.lang?.pagination);
        // Set state
        if (state.currentPage) {
            this.currentPage = state.currentPage;
        }
    }
    /* *
    *
    *  Methods
    *
    * */
    /**
     * Total number of items (rows)
     */
    get totalItems() {
        return this.grid.querying.pagination.totalItems || 0;
    }
    /**
     * Total number of pages
     */
    get totalPages() {
        return Math.ceil(this.totalItems / this.currentPageSize) || 1;
    }
    /**
     * Format text with placeholders.
     *
     * @param template The text template with placeholders
     * @param values Object containing values to replace placeholders
     * @returns Formatted text
     */
    formatText(template, values) {
        return template.replace(/\{(\w+)\}/g, (match, key) => (values[key] !== void 0 ? String(values[key]) : match));
    }
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
    render() {
        const position = this.options.position;
        const grid = this.grid;
        this.oldTotalItems = this.totalItems;
        // Set row count for a11y
        grid.tableElement?.setAttribute('aria-current', 'page');
        this.updateA11yRowsCount(this.currentPageSize);
        // Render pagination container
        if (typeof position === 'string' && position.startsWith('#')) {
            this.renderCustomContainer(position);
        }
        else {
            if (position === 'footer') {
                this.renderFooter();
            }
            this.contentWrapper = makeHTMLElement('nav', {
                className: Globals.getClassName('paginationWrapper')
            }, position === 'footer' ?
                this.paginationContainer : grid.contentWrapper);
            this.contentWrapper.setAttribute('aria-label', 'Results pagination');
        }
        // Clamps the current page to the valid range
        this.clampCurrentPage();
        // Render all components
        this.renderPageInfo();
        this.renderControls();
        this.renderPageSizeSelector();
        // Update button states after rendering
        this.updateButtonStates();
    }
    /**
     * Render pagination in a tfoot element.
     */
    renderFooter() {
        const tableElement = this.grid.tableElement;
        if (!tableElement) {
            return;
        }
        // Create tfoot element
        const tfootElement = makeHTMLElement('tfoot', {}, tableElement);
        // Create tfoot row
        const tfootRow = makeHTMLElement('tr', {}, tfootElement);
        // Create tfoot cell with colspan and store it in paginationContainer
        this.paginationContainer = makeHTMLElement('td', {}, tfootRow);
        this.paginationContainer.setAttribute('colSpan', (this.grid.enabledColumns || []).length.toString());
        this.reflow();
    }
    /**
     * Render pagination in a custom container by ID.
     *
     * @param id
     * The ID of the custom container.
     */
    renderCustomContainer(id) {
        const customContainer = document.querySelector(id);
        if (!customContainer) {
            console.warn(`Pagination: Custom container with ID "${id}" not found.`); // eslint-disable-line no-console
            return;
        }
        this.paginationContainer = customContainer;
        // Set content wrapper to the custom container
        this.contentWrapper = makeHTMLElement('div', {
            className: Globals.getClassName('paginationContainer')
        }, customContainer);
    }
    /**
     * Render the page information text.
     */
    renderPageInfo() {
        const pageInfo = this.options.controls?.pageInfo;
        if (pageInfo === false ||
            (isObject(pageInfo) && pageInfo.enabled === false)) {
            return;
        }
        this.pageInfoElement = makeHTMLElement('div', {
            className: Globals.getClassName('paginationPageInfo')
        }, this.contentWrapper);
        this.updatePageInfo();
    }
    /**
     * Update the page information text.
     */
    updatePageInfo() {
        if (!this.pageInfoElement) {
            return;
        }
        const startItem = (this.currentPage - 1) * this.currentPageSize + 1;
        const endItem = Math.min(this.currentPage * this.currentPageSize, this.totalItems);
        const pageInfoText = this.formatText(this.lang.pageInfo, {
            start: startItem,
            end: endItem,
            total: this.totalItems,
            currentPage: this.currentPage,
            totalPages: this.totalPages
        });
        this.pageInfoElement.innerHTML = pageInfoText;
    }
    /**
     * Render the controls buttons and page numbers.
     */
    renderControls() {
        const navContainer = makeHTMLElement('div', {
            className: Globals.getClassName('paginationControls')
        }, this.contentWrapper);
        // Render first/previous buttons
        if (this.options.controls?.firstLastButtons) {
            this.renderFirstButton(navContainer);
        }
        // Render previous button
        if (this.options.controls?.previousNextButtons) {
            this.renderPrevButton(navContainer);
        }
        // Render page numbers
        if (this.options.controls?.pageButtons) {
            this.renderPageNumbers(navContainer);
        }
        // Render mobile page selector
        this.renderMobilePageSelector(navContainer);
        // Render next button
        if (this.options.controls?.previousNextButtons) {
            this.renderNextButton(navContainer);
        }
        // Render last/first buttons
        if (this.options.controls?.firstLastButtons) {
            this.renderLastButton(navContainer);
        }
    }
    /**
     * Update the pagination controls.
     */
    updateControls() {
        if (this.oldTotalItems === this.totalItems) {
            return;
        }
        this.updatePageInfo();
        this.updatePageNumbers();
        this.updateButtonStates();
        this.updateA11yRowsCount(this.currentPageSize);
        this.oldTotalItems = this.totalItems;
    }
    /**
     * Render the first page button.
     *
     * @param container
     * The container element for the first page button.
     *
     */
    renderFirstButton(container) {
        const firstLastButtons = this.options.controls?.firstLastButtons;
        if (firstLastButtons === false ||
            (isObject(firstLastButtons) && firstLastButtons.enabled === false)) {
            return;
        }
        // Create first button
        this.firstButton = makeHTMLElement('button', {
            innerHTML: Icons.first,
            className: Globals.getClassName('paginationButton') + ' ' +
                Globals.getClassName('paginationFirstButton')
        }, container);
        this.firstButton.title = this.lang.firstPage;
        // Set aria-label for a11y
        this.firstButton.setAttribute('aria-label', this.lang.firstPage);
        // Add click event
        this.firstButton.addEventListener('click', () => {
            void this.goToPage(1);
        });
        this.setButtonState(this.firstButton, this.currentPage === 1);
    }
    /**
     * Render the previous page button.
     *
     * @param container
     * The container element for the previous page button.
     */
    renderPrevButton(container) {
        const previousNextButtons = this.options.controls?.previousNextButtons;
        if (previousNextButtons === false ||
            (isObject(previousNextButtons) &&
                previousNextButtons.enabled === false)) {
            return;
        }
        // Create previous button
        this.prevButton = makeHTMLElement('button', {
            innerHTML: Icons.previous,
            className: Globals.getClassName('paginationButton') + ' ' +
                Globals.getClassName('paginationPrevButton')
        }, container);
        this.prevButton.title = this.lang.previousPage;
        // Set aria-label for a11y
        this.prevButton.setAttribute('aria-label', this.lang.previousPage);
        // Add click event
        this.prevButton.addEventListener('click', () => {
            void this.goToPage(this.currentPage - 1);
        });
        this.setButtonState(this.prevButton, this.currentPage === 1);
    }
    /**
     * Render the next page button.
     *
     * @param container
     * The container element for the next page button.
     */
    renderNextButton(container) {
        const previousNextButtons = this.options.controls?.previousNextButtons;
        if (previousNextButtons === false ||
            (isObject(previousNextButtons) &&
                previousNextButtons.enabled === false)) {
            return;
        }
        // Create next button
        this.nextButton = makeHTMLElement('button', {
            innerHTML: Icons.next,
            className: Globals.getClassName('paginationButton') + ' ' +
                Globals.getClassName('paginationNextButton')
        }, container);
        this.nextButton.title = this.lang.nextPage;
        // Set aria-label for a11y
        this.nextButton.setAttribute('aria-label', this.lang.nextPage);
        // Add click event
        this.nextButton.addEventListener('click', () => {
            void this.goToPage(this.currentPage + 1);
        });
        this.setButtonState(this.nextButton, this.currentPage >= this.totalPages);
    }
    /**
     * Render the last page button.
     *
     * @param container
     * The container element for the last page button.
     */
    renderLastButton(container) {
        const firstLastButtons = this.options.controls?.firstLastButtons;
        if (firstLastButtons === false ||
            (isObject(firstLastButtons) && firstLastButtons.enabled === false)) {
            return;
        }
        // Create last button
        this.lastButton = makeHTMLElement('button', {
            innerHTML: Icons.last,
            className: Globals.getClassName('paginationButton') + ' ' +
                Globals.getClassName('paginationLastButton')
        }, container);
        this.lastButton.title = this.lang.lastPage;
        // Set aria-label for a11y
        this.lastButton.setAttribute('aria-label', this.lang.lastPage);
        // Add click event
        this.lastButton.addEventListener('click', () => {
            void this.goToPage(this.totalPages);
        });
        this.setButtonState(this.lastButton, this.currentPage >= this.totalPages);
    }
    /**
     * Render page number buttons with ellipsis.
     *
     * @param container
     * The container element for the page number buttons.
     */
    renderPageNumbers(container) {
        const pageButtons = this.options.controls?.pageButtons;
        if (pageButtons === false ||
            (isObject(pageButtons) && pageButtons.enabled === false)) {
            return;
        }
        this.pageNumbersContainer = makeHTMLElement('div', {
            className: Globals.getClassName('paginationPageButton')
        }, container);
        this.updatePageNumbers();
    }
    /**
     * Update page number buttons based on current page and total pages.
     */
    updatePageNumbers() {
        if (!this.pageNumbersContainer) {
            return;
        }
        // Clear existing page numbers
        this.pageNumbersContainer.innerHTML = AST.emptyHTML;
        const pageButtons = this.options.controls?.pageButtons;
        const maxPageNumbers = isObject(pageButtons) ?
            pageButtons.count :
            Pagination.defaultOptions.controls.pageButtons.count; // eslint-disable-line
        const totalPages = this.totalPages;
        const currentPage = this.currentPage;
        if (totalPages <= maxPageNumbers) {
            // Show all page numbers if total pages is less than max
            for (let i = 1; i <= totalPages; i++) {
                this.createPageButton(i, i === currentPage);
            }
        }
        else {
            const elements = [];
            // Determine layout based on current page position
            const isNearStart = currentPage <= 3;
            const isNearEnd = currentPage >= totalPages - 2;
            if (isNearStart) {
                // -2 for ellipsis and last page
                const pagesToShow = maxPageNumbers - 2;
                const maxPages = Math.min(pagesToShow, totalPages - 1);
                for (let i = 1; i <= maxPages; i++) {
                    elements.push({ type: 'button', page: i });
                }
                if (totalPages > pagesToShow + 1) {
                    elements.push({ type: 'ellipsis' });
                    elements.push({ type: 'button', page: totalPages });
                }
            }
            else if (isNearEnd) {
                // -2 for first page and ellipsis
                const pagesToShow = maxPageNumbers - 2;
                let i = totalPages - pagesToShow + 1;
                elements.push({ type: 'button', page: 1 });
                elements.push({ type: 'ellipsis' });
                for (i; i <= totalPages; i++) {
                    elements.push({ type: 'button', page: i });
                }
            }
            else {
                // Always add first page
                elements.push({ type: 'button', page: 1 });
                // -4 for first, last, and two ellipsis
                const maxMiddlePages = maxPageNumbers - 4;
                const halfMiddle = Math.floor(maxMiddlePages / 2);
                let startPage = Math.max(2, currentPage - halfMiddle);
                let endPage = Math.min(totalPages - 1, currentPage + halfMiddle);
                // Adjust to ensure we have exactly maxMiddlePages
                if (endPage - startPage + 1 > maxMiddlePages) {
                    if (startPage === 2) {
                        endPage = startPage + maxMiddlePages - 1;
                    }
                    else {
                        startPage = endPage - maxMiddlePages + 1;
                    }
                }
                // Check if we actually need ellipsis
                const needFirstEllipsis = startPage > 2;
                const needLastEllipsis = endPage < totalPages - 1;
                if (!needFirstEllipsis && !needLastEllipsis) {
                    // -2 for first and last
                    const availableSlots = maxPageNumbers - 2;
                    startPage = 2;
                    endPage = Math.min(totalPages - 1, startPage + availableSlots - 1);
                }
                else if (!needFirstEllipsis) {
                    // -3 for first, last, and one ellipsis
                    const availableSlots = maxPageNumbers - 3;
                    startPage = 2;
                    endPage = Math.min(totalPages - 1, startPage + availableSlots - 1);
                }
                else if (!needLastEllipsis) {
                    // -3 for first, last, and one ellipsis
                    const availableSlots = maxPageNumbers - 3;
                    endPage = totalPages - 1;
                    startPage = Math.max(2, endPage - availableSlots + 1);
                }
                // Add first ellipsis
                if (needFirstEllipsis) {
                    elements.push({ type: 'ellipsis' });
                }
                // Add middle pages
                for (let i = startPage; i <= endPage; i++) {
                    elements.push({ type: 'button', page: i });
                }
                // Add last ellipsis
                if (needLastEllipsis) {
                    elements.push({ type: 'ellipsis' });
                }
                // Always add last page
                elements.push({ type: 'button', page: totalPages });
            }
            // Render all elements
            elements.forEach((element) => {
                if (element.type === 'button' && defined(element.page)) {
                    this.createPageButton(element.page, element.page === currentPage);
                }
                else if (element.type === 'ellipsis') {
                    this.createEllipsis();
                }
            });
        }
        // Update mobile selector if it exists
        if (this.mobilePageSelector) {
            this.mobilePageSelector.value = this.currentPage.toString();
        }
    }
    /**
     * Create a page number button.
     *
     * @param pageNumber
     * The page number to create a button for.
     *
     * @param isActive
     * Whether the page number button is active.
     */
    createPageButton(pageNumber, isActive) {
        if (!this.pageNumbersContainer) {
            return;
        }
        const button = makeHTMLElement('button', {
            innerHTML: pageNumber.toString(),
            className: Globals.getClassName(isActive ? 'paginationPageButtonActive' : 'paginationPageButton')
        }, this.pageNumbersContainer);
        button.title = this.formatText(this.lang.pageNumber, { page: pageNumber });
        // Set aria-label for a11y
        button.setAttribute('aria-label', this.formatText(this.lang.pageNumber, { page: pageNumber }));
        // Add click event
        button.addEventListener('click', () => {
            void this.goToPage(pageNumber);
        });
    }
    /**
     * Create an ellipsis element.
     */
    createEllipsis() {
        if (!this.pageNumbersContainer) {
            return;
        }
        const ellipsisElement = makeHTMLElement('span', {
            innerHTML: '...',
            className: Globals.getClassName('paginationEllipsis')
        }, this.pageNumbersContainer);
        ellipsisElement.title = this.lang.ellipsis;
        // Set aria-label for a11y
        ellipsisElement.setAttribute('aria-hidden', true);
    }
    /**
     * Render the page size selector.
     */
    renderPageSizeSelector() {
        const pageSizeSelector = this.options.controls.pageSizeSelector;
        if (pageSizeSelector === false ||
            (isObject(pageSizeSelector) &&
                pageSizeSelector.enabled === false)) {
            return;
        }
        const container = makeHTMLElement('div', {
            className: Globals.getClassName('paginationPageSizeContainer')
        }, this.contentWrapper);
        makeHTMLElement('span', {
            innerHTML: this.lang.pageSizeLabel
        }, container);
        this.pageSizeSelect = makeHTMLElement('select', {
            className: Globals.getClassName('paginationPageSizeSelect')
        }, container);
        this.pageSizeOptions.forEach((option) => {
            const optionElement = document.createElement('option');
            optionElement.value = option.toString();
            optionElement.innerHTML = option.toString();
            if (option === this.currentPageSize) {
                optionElement.selected = true;
            }
            this.pageSizeSelect?.appendChild(optionElement);
        });
        this.pageSizeSelect.addEventListener('change', () => {
            if (!this.pageSizeSelect) {
                return;
            }
            void this.setPageSize(parseInt(this.pageSizeSelect.value, 10));
        });
        // Render mobile page size selector in the same container
        this.renderMobilePageSizeSelector(container);
    }
    /**
     * Set the page size and recalculate pagination.
     *
     * @param newPageSize
     * The new page size to set.
     */
    async setPageSize(newPageSize) {
        const pageSize = this.currentPageSize;
        const langAccessibility = this.grid.options?.lang?.accessibility;
        fireEvent(this, 'beforePageSizeChange', {
            pageSize: pageSize,
            newPageSize: newPageSize
        });
        this.currentPageSize = newPageSize;
        // Reset to first page when changing page size
        this.currentPage = 1;
        // Update the grid's pagination range
        await this.updateGridPagination();
        // Update UI
        this.updatePageInfo();
        this.updatePageNumbers();
        this.updateButtonStates();
        // Update row count for a11y
        this.updateA11yRowsCount(this.currentPageSize);
        // Announce the page size change
        this.grid.accessibility?.announce(langAccessibility?.pagination?.announcements?.pageSizeChange +
            ' ' + newPageSize);
        // Update mobile page size selector if it exists
        if (this.mobilePageSizeSelector) {
            this.mobilePageSizeSelector.value = this.currentPageSize.toString();
        }
        fireEvent(this, 'afterPageSizeChange', {
            pageSize: newPageSize,
            previousPageSize: pageSize
        });
    }
    /**
     * Navigate to a specific page.
     *
     * @param pageNumber
     * The page number to navigate to.
     */
    async goToPage(pageNumber) {
        const langAccessibility = this.grid.options?.lang?.accessibility;
        if (pageNumber < 1 ||
            pageNumber > this.totalPages ||
            pageNumber === this.currentPage) {
            return;
        }
        const previousPage = this.currentPage;
        fireEvent(this, 'beforePageChange', {
            currentPage: this.currentPage,
            nextPage: pageNumber,
            pageSize: this.currentPageSize
        });
        this.currentPage = pageNumber;
        await this.updateGridPagination();
        this.updatePageInfo();
        this.updatePageNumbers();
        this.updateButtonStates();
        // Announce the page change
        this.grid.accessibility?.announce(langAccessibility?.pagination?.announcements?.pageChange +
            ' ' + this.currentPage);
        fireEvent(this, 'afterPageChange', {
            currentPage: this.currentPage,
            previousPage: previousPage,
            pageSize: this.currentPageSize
        });
    }
    /**
     * Update the grid's pagination state.
     *
     * @param ignoreDataRange
     * Whether to ignore the data range update. Used when updating the data
     * range is not needed, for example when updating the data range from
     * the server.
     * @internal
     */
    async updateGridPagination(ignoreDataRange = false) {
        if (!this.grid.querying?.pagination) {
            return;
        }
        this.grid.querying.pagination.setRange(ignoreDataRange ? 1 : this.currentPage);
        // Trigger the grid to update its data and viewport
        this.grid.querying.shouldBeUpdated = true;
        // Force the querying controller to proceed with updates
        await this.grid.querying.proceed(true);
        // Update the viewport to reflect the new data
        await this.grid.viewport?.updateRows();
        this.grid.viewport?.header?.reflow();
        // Scroll to top after page change
        const tBody = this.grid.viewport?.tbodyElement;
        if (tBody) {
            tBody.scrollTop = 0;
        }
    }
    /**
     * Ensures the current page is within valid range.
     */
    clampCurrentPage() {
        if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
            this.grid.querying.pagination.setRange(this.currentPage);
        }
    }
    /**
     * Update button states based on current page.
     */
    updateButtonStates() {
        if (this.firstButton) {
            this.setButtonState(this.firstButton, this.currentPage === 1);
        }
        if (this.prevButton) {
            this.setButtonState(this.prevButton, this.currentPage === 1);
        }
        if (this.nextButton) {
            this.setButtonState(this.nextButton, this.currentPage >= this.totalPages);
        }
        if (this.lastButton) {
            this.setButtonState(this.lastButton, this.currentPage >= this.totalPages);
        }
    }
    /**
     * Call modifier to replace items with new ones.
     *
     * @param isNextPage
     * Declare prev or next action triggered by button.
     * @returns
     */
    async updatePage(isNextPage = true) {
        const newPage = isNextPage ? this.currentPage + 1 : this.currentPage - 1;
        await this.goToPage(newPage);
    }
    /**
     * Set button state (enabled/disabled).
     *
     * @param button
     * The button to set the state for.
     *
     * @param disabled
     * Whether the button should be disabled.
     */
    setButtonState(button, disabled) {
        if (disabled) {
            button.classList.add(Globals.getClassName('paginationButtonDisabled'));
            button.setAttribute('disabled', 'disabled');
        }
        else {
            button.classList.remove(Globals.getClassName('paginationButtonDisabled'));
            button.removeAttribute('disabled');
        }
    }
    /**
     * Reflow the pagination container.
     */
    reflow() {
        const position = this.options.position;
        if (!this.paginationContainer) {
            return;
        }
        if (position === 'footer') {
            // Set the width to match the table width
            this.paginationContainer.style.width =
                this.grid.tableElement?.offsetWidth + 'px';
            return;
        }
    }
    /**
     * Destroy the pagination instance.
     */
    destroy() {
        const position = this.options.position;
        if (position === 'footer') {
            // For footer position, remove the entire tfoot element.
            this.paginationContainer?.parentElement?.parentElement?.remove();
        }
        else {
            this.contentWrapper?.remove();
        }
        this.grid.querying.pagination.reset();
    }
    /**
     * Render the mobile page selector (select dropdown).
     *
     * @param container
     * The container element for the mobile page selector.
     */
    renderMobilePageSelector(container) {
        const totalPages = this.totalPages;
        if (totalPages <= 1) {
            return;
        }
        const mobileSelect = makeHTMLElement('select', {
            className: Globals.getClassName('paginationMobileSelector')
        }, container);
        // Add options for each page
        for (let i = 1; i <= totalPages; i++) {
            const option = makeHTMLElement('option', {}, mobileSelect);
            option.value = i.toString();
            option.textContent = `Page ${i} of ${totalPages}`;
        }
        // Set current page as selected
        mobileSelect.value = this.currentPage.toString();
        this.mobilePageSelector = mobileSelect;
        // Add event listener for page change
        mobileSelect.addEventListener('change', () => {
            const newPage = parseInt(mobileSelect.value, 10);
            if (newPage !== this.currentPage) {
                void this.goToPage(newPage);
            }
        });
    }
    /**
     * Render the mobile page size selector (select dropdown).
     *
     * @param container
     * The container element for the mobile page size selector.
     */
    renderMobilePageSizeSelector(container) {
        const mobilePageSizeSelect = makeHTMLElement('select', {
            className: Globals.getClassName('paginationMobilePageSizeSelector')
        }, container);
        this.pageSizeOptions.forEach((option) => {
            const optionElement = makeHTMLElement('option', {}, mobilePageSizeSelect);
            optionElement.value = option.toString();
            optionElement.textContent = `${option} ${this.lang.pageSizeLabel}`;
            if (option === this.currentPageSize) {
                optionElement.selected = true;
            }
        });
        this.mobilePageSizeSelector = mobilePageSizeSelect;
        mobilePageSizeSelect.addEventListener('change', () => {
            if (!this.mobilePageSizeSelector) {
                return;
            }
            void this.setPageSize(parseInt(this.mobilePageSizeSelector.value, 10));
        });
    }
    /**
     * Update the row count for a11y.
     *
     * @param currentPageSize
     * The current page size.
     */
    updateA11yRowsCount(currentPageSize) {
        const grid = this.grid;
        grid.tableElement?.setAttribute('aria-rowcount', currentPageSize || this.totalItems);
    }
}
/* *
*
*  Static Properties
*
* */
/**
 * Default options of the pagination.
 */
Pagination.defaultOptions = {
    enabled: false,
    pageSize: 10,
    position: 'bottom',
    controls: {
        pageSizeSelector: {
            enabled: true,
            options: [10, 20, 50, 100]
        },
        pageInfo: {
            enabled: true
        },
        firstLastButtons: {
            enabled: true
        },
        previousNextButtons: {
            enabled: true
        },
        pageButtons: {
            enabled: true,
            count: 7
        }
    }
};
/* *
 *
 *  Default Export
 *
 * */
export default Pagination;
