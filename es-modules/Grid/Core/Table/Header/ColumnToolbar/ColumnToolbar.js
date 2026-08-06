/* *
 *
 *  Grid Header Cell Toolbar class
 *
 *  (c) 2020-2026 Highsoft AS
 *
 *  Integration of this software requires a license.
 *  - For commercial use, see www.highcharts.com/license
 *  - For non-commercial, see www.highcharts.com/license-eula
 *
 *
 *  Authors:
 *  - Dawid Draguła
 *
 * */
'use strict';
import GridUtils from '../../../GridUtils.js';
import Globals from '../../../Globals.js';
import SortToolbarButton from './ToolbarButtons/SortToolbarButton.js';
import FilterToolbarButton from './ToolbarButtons/FilterToolbarButton.js';
import MenuToolbarButton from './ToolbarButtons/MenuToolbarButton.js';
import { getStyle } from '../../../../../Shared/Utilities.js';
const { makeHTMLElement } = GridUtils;
/* *
 *
 *  Class
 *
 * */
class HeaderCellToolbar {
    /**
     * Reference to the Grid instance for icon registry and options.
     */
    get grid() {
        return this.column.viewport.grid;
    }
    /* *
     *
     *  Constructor
     *
     * */
    constructor(column) {
        this.buttons = [];
        this.focusCursor = 0;
        /**
         * The event listener destroyers of the toolbar.
         */
        this.eventListenerDestroyers = [];
        this.column = column;
    }
    /* *
     *
     *  Methods
     *
     * */
    /**
     * Initializes the buttons of the toolbar.
     */
    renderFull() {
        const columnOptions = this.column.options;
        const sortingEnabled = this.column.viewport.grid.columnPolicy
            .isColumnSortingEnabled(this.column.id);
        if (sortingEnabled) {
            new SortToolbarButton().add(this);
        }
        if (this.column.viewport.grid.columnPolicy.isColumnFilteringEnabled(this.column.id) &&
            !columnOptions.filtering?.inline) {
            new FilterToolbarButton().add(this);
        }
    }
    renderMinimized() {
        const columnOptions = this.column.options;
        const sortingEnabled = this.column.viewport.grid.columnPolicy
            .isColumnSortingEnabled(this.column.id);
        if (sortingEnabled || (this.column.viewport.grid.columnPolicy.isColumnFilteringEnabled(this.column.id) &&
            !columnOptions.filtering?.inline)) {
            new MenuToolbarButton().add(this);
        }
    }
    /**
     * Render the toolbar.
     */
    add() {
        const headerCell = this.column.header;
        if (!headerCell?.container) {
            return;
        }
        if (this.columnResizeObserver) {
            this.columnResizeObserver.disconnect();
            delete this.columnResizeObserver;
        }
        this.columnResizeObserver = new ResizeObserver(() => this.reflow());
        this.columnResizeObserver.observe(headerCell.container);
        const container = this.container = makeHTMLElement('div', {
            className: Globals.getClassName('headerCellIcons')
        });
        headerCell.container.appendChild(container);
        const onKeyDown = (e) => {
            this.keyDownHandler(e);
        };
        container.addEventListener('keydown', onKeyDown);
        this.eventListenerDestroyers.push(() => {
            container.removeEventListener('keydown', onKeyDown);
        });
    }
    /**
     * Refreshes the state of the toolbar buttons.
     * @internal
     */
    refreshState() {
        for (const button of this.buttons) {
            button.refreshState();
        }
    }
    /**
     * Destroys all buttons of the toolbar.
     */
    clearButtons() {
        const { buttons } = this;
        while (buttons.length > 0) {
            buttons[buttons.length - 1].destroy();
        }
    }
    /**
     * Reflows the toolbar. It is called when the column is resized.
     */
    reflow() {
        const width = this.column.getWidth();
        const shouldBeMinimized = width <= HeaderCellToolbar.MINIMIZED_COLUMN_WIDTH;
        if (shouldBeMinimized !== this.isMinimized) {
            this.isMinimized = shouldBeMinimized;
            this.clearButtons();
            if (shouldBeMinimized) {
                this.renderMinimized();
            }
            else {
                this.renderFull();
            }
        }
        if (!shouldBeMinimized) {
            // Ensure we reset any "minimized only" header state. This can
            // happen if the grid was initialized in a hidden container
            // (e.g. display:none) where widths measure as 0. (#24002)
            this.isMenuCentered = void 0;
            this.column.header?.container?.classList.remove(Globals.getClassName('noWidth'));
            return;
        }
        const parent = this.column.header?.htmlElement;
        const container = this.container;
        const parentWidth = parent?.offsetWidth || 0;
        const containerWidth = this.buttons[0]?.wrapper?.offsetWidth || 0;
        const parentPaddings = ((parent && getStyle(parent, 'padding-left', true) || 0) +
            (parent && getStyle(parent, 'padding-right', true) || 0));
        const containerMargins = ((container && getStyle(container, 'margin-left', true) || 0) +
            (container && getStyle(container, 'margin-right', true) || 0));
        const shouldBeCentered = parentWidth - parentPaddings < containerWidth + containerMargins;
        if (this.isMenuCentered !== shouldBeCentered) {
            this.isMenuCentered = shouldBeCentered;
            this.column.header?.container?.classList.toggle(Globals.getClassName('noWidth'), shouldBeCentered);
        }
    }
    /**
     * Destroy the toolbar.
     */
    destroy() {
        for (const destroyer of this.eventListenerDestroyers) {
            destroyer();
        }
        this.eventListenerDestroyers.length = 0;
        this.clearButtons();
        this.columnResizeObserver?.disconnect();
        delete this.columnResizeObserver;
    }
    /**
     * Focuses the first button of the toolbar.
     *
     * @param options
     * Native focus options.
     */
    focus(options) {
        this.buttons[0]?.focus(options);
    }
    /**
     * Handles the key down event on the toolbar.
     *
     * @param e
     * Keyboard event object.
     */
    keyDownHandler(e) {
        const len = this.buttons.length;
        const cursor = this.focusCursor;
        let elementToFocus;
        switch (e.key) {
            case 'ArrowUp':
            case 'ArrowLeft':
                elementToFocus = this.buttons[Math.abs((cursor - 1 + len) % len)];
                break;
            case 'ArrowDown':
            case 'ArrowRight':
                elementToFocus = this.buttons[(cursor + 1) % len];
                break;
            case 'Escape':
                elementToFocus = this.column.header?.htmlElement;
                break;
            default:
                return;
        }
        e.preventDefault();
        e.stopPropagation();
        elementToFocus?.focus({
            preventScroll: true
        });
    }
}
/**
 * The maximum width of the column to be minimized.
 */
HeaderCellToolbar.MINIMIZED_COLUMN_WIDTH = 120;
/* *
 *
 *  Default Export
 *
 * */
export default HeaderCellToolbar;
