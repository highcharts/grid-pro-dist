/* *
 *
 * Grid Context Menu abstract class
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
/* *
 *
 *  Imports
 *
 * */
import Popup from './Popup.js';
import Globals from '../Globals.js';
import GridUtils from '../GridUtils.js';
const { makeHTMLElement } = GridUtils;
/* *
 *
 *  Class
 *
 * */
/**
 * The context menu.
 */
export class ContextMenu extends Popup {
    constructor() {
        /* *
         *
         *  Properties
         *
         * */
        super(...arguments);
        /**
         * The array of buttons in the context menu.
         */
        this.buttons = [];
        /**
         * The index of the focused button in the context menu.
         */
        this.focusCursor = 0;
    }
    /* *
     *
     *  Methods
     *
     * */
    /**
     * Ensures that the items container element is created.
     *
     * @returns
     * The items container element.
     */
    ensureItemsContainer() {
        if (!this.content) {
            return;
        }
        if (this.itemsContainer) {
            return this.itemsContainer;
        }
        this.itemsContainer = makeHTMLElement('ul', {
            className: Globals.getClassName('menuContainer')
        }, this.content);
        return this.itemsContainer;
    }
    show(anchorElement) {
        super.show(anchorElement);
        this.buttons[0]?.focus();
    }
    hide() {
        for (const btn of this.buttons) {
            btn.destroy();
        }
        this.buttons.length = 0;
        this.itemsContainer?.remove();
        delete this.itemsContainer;
        super.hide();
    }
    /**
     * Adds a divider to the context menu.
     *
     * @returns
     * The divider element.
     */
    addDivider() {
        if (!this.ensureItemsContainer()) {
            return;
        }
        return makeHTMLElement('li', {
            className: Globals.getClassName('menuDivider')
        }, this.itemsContainer);
    }
    onClickOutside(event) {
        const buttons = this.buttons;
        for (let i = 0, iEnd = buttons.length; i < iEnd; ++i) {
            if (buttons[i].popup?.container?.contains(event.target)) {
                return;
            }
        }
        super.onClickOutside(event);
    }
    onKeyDown(e) {
        super.onKeyDown(e);
        const len = this.buttons.length;
        const cursor = this.focusCursor;
        switch (e.key) {
            case 'ArrowUp':
            case 'ArrowLeft':
                e.preventDefault();
                this.buttons[Math.abs((cursor - 1 + len) % len)].focus();
                break;
            case 'ArrowDown':
            case 'ArrowRight':
                e.preventDefault();
                this.buttons[(cursor + 1) % len].focus();
                break;
        }
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default ContextMenu;
