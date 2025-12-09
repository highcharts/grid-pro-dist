/* *
 *
 *  Grid Popup abstract class
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
import GridUtils from '../GridUtils.js';
import Globals from '../Globals.js';
import U from '../../../Core/Utilities.js';
const { makeHTMLElement } = GridUtils;
const { fireEvent } = U;
/* *
 *
 *  Class
 *
 * */
/**
 * Abstract base class for for Grid popups.
 */
export class Popup {
    /* *
     *
     *  Constructor
     *
     * */
    /**
     * Constructs a popup for the given grid.
     *
     * @param grid
     * The grid that will own this popup.
     *
     * @param button
     * The button that opened the popup, if any.
     *
     * @param options
     * Popup options.
     */
    constructor(grid, button, options) {
        /**
         * Whether the popup is currently visible.
         */
        this.isVisible = false;
        /**
         * Event listener destroyers.
         */
        this.eventListenerDestroyers = [];
        this.grid = grid;
        this.button = button;
        this.options = options || {};
    }
    /**
     * Shows the popup positioned relative to the anchor element.
     *
     * @param anchorElement
     * The element to position the popup relative to.
     */
    show(anchorElement) {
        if (this.container) {
            return;
        }
        this.button?.setHighlighted(true);
        this.container = makeHTMLElement('div', {
            className: Globals.getClassName('popup')
        });
        this.content = makeHTMLElement('div', {
            className: Globals.getClassName('popupContent')
        });
        const { header } = this.options;
        if (header) {
            this.addHeader(header.label, header.category);
        }
        this.renderContent(this.content);
        this.container.appendChild(this.content);
        this.anchorElement = anchorElement;
        this.isVisible = true;
        this.grid.contentWrapper?.appendChild(this.container);
        this.position(anchorElement);
        this.addEventListeners();
        this.grid.popups.add(this);
        fireEvent(this, 'afterShow');
    }
    /**
     * Hides the popup. In reality, it just destroys the popup container and
     * removes the event listeners.
     */
    hide() {
        if (!this.container) {
            return;
        }
        fireEvent(this, 'beforeHide');
        this.grid.popups.delete(this);
        this.isVisible = false;
        // Remove event listeners
        this.removeEventListeners();
        this.container.remove();
        delete this.container;
        delete this.content;
        this.button?.setHighlighted(false);
        fireEvent(this, 'afterHide');
    }
    /**
     * Toggles the popup visibility.
     *
     * @param anchorElement
     * The element to position the popup relative to. If not provided, the popup
     * will be positioned relative to the parent element.
     */
    toggle(anchorElement) {
        if (this.isVisible) {
            this.hide();
        }
        else {
            this.show(anchorElement);
        }
    }
    /**
     * Reflows the popup.
     */
    reflow() {
        if (this.anchorElement?.isConnected) {
            this.position(this.anchorElement);
        }
        else {
            this.hide();
        }
    }
    /**
     * Positions the popup relative to the anchor element.
     *
     * @param anchorElement
     * The element to position relative to. If not provided, the popup will be
     * positioned relative to the parent element.
     */
    position(anchorElement) {
        const wrapper = this.grid.contentWrapper;
        if (!this.container || !this.content || !wrapper) {
            return;
        }
        const next = this.options.nextToAnchor || false;
        const popupRect = this.container.getBoundingClientRect();
        const parentRect = wrapper.getBoundingClientRect();
        const anchorRect = anchorElement?.getBoundingClientRect() ?? parentRect;
        const top = next ? anchorRect.top : anchorRect.bottom + 4;
        let left = next ? anchorRect.right + 3 : anchorRect.left;
        // If popup's right side is after the parent's right side, shift popup
        // to the left of the anchor element.
        if (left + popupRect.width > parentRect.width) {
            left = -popupRect.width + (next ? anchorRect.left + 4 : anchorRect.right);
        }
        // If popup's left side is before the parent's left side,
        // shift popup so it's aligned to parent's left.
        if (left < parentRect.left) {
            left = parentRect.left;
        }
        // Apply positioning
        this.container.style.top = `${top - parentRect.top}px`;
        this.container.style.left = `${left - parentRect.left}px`;
        // If the content is too tall, constrain the container to the bottom
        // of the parent to enable content Y-scrolling.
        const contentRect = this.content.getBoundingClientRect();
        if (contentRect.height + contentRect.top - parentRect.top >
            parentRect.height) {
            this.container.style.top = 'auto';
            this.container.style.bottom = '0';
        }
        else {
            this.container.style.top = `${top - parentRect.top}px`;
            this.container.style.bottom = 'auto';
        }
    }
    /**
     * Adds a header to the context menu.
     *
     * @param label
     * The label shown in the header of the context menu.
     *
     * @param category
     * The category shown in the header of the context menu, before the label.
     *
     * @returns
     * The header element.
     */
    addHeader(label, category) {
        if (!this.content) {
            return;
        }
        const container = makeHTMLElement('div', {
            className: Globals.getClassName('menuHeader')
        }, this.content);
        if (category) {
            makeHTMLElement('span', {
                className: Globals.getClassName('menuHeaderCategory'),
                innerText: category + ' '
            }, container);
        }
        makeHTMLElement('span', {
            className: Globals.getClassName('menuHeaderName'),
            innerText: label
        }, container);
        return container;
    }
    /**
     * Handles key down events.
     *
     * @param e
     * Keyboard event
     */
    onKeyDown(e) {
        if (e.key === 'Escape' || (e.key === 'Tab' && e.shiftKey)) {
            e.preventDefault();
            this.hide();
            this.button?.focus();
        }
    }
    /**
     * Handles click outside events.
     *
     * @param e
     * Mouse event
     */
    onClickOutside(e) {
        if (!this.container?.contains(e.target) &&
            !this.anchorElement?.contains(e.target)) {
            this.hide();
        }
    }
    /**
     * Adds event listeners for click outside and escape key.
     */
    addEventListeners() {
        const container = this.container;
        if (!container) {
            return;
        }
        const clickOutsideListener = (event) => {
            this.onClickOutside(event);
        };
        const keyDownListener = (event) => {
            this.onKeyDown(event);
        };
        document.addEventListener('mousedown', clickOutsideListener);
        container.addEventListener('keydown', keyDownListener);
        this.eventListenerDestroyers.push(() => {
            document.removeEventListener('mousedown', clickOutsideListener);
            container.removeEventListener('keydown', keyDownListener);
        });
    }
    /**
     * Removes event listeners.
     */
    removeEventListeners() {
        for (const destroyer of this.eventListenerDestroyers) {
            destroyer();
        }
        this.eventListenerDestroyers.length = 0;
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default Popup;
