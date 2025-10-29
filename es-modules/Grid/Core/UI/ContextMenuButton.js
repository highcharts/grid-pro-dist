/* *
 *
 *  Grid Context Menu Button class
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
import SvgIcons from './SvgIcons.js';
import Globals from '../Globals.js';
import GridUtils from '../GridUtils.js';
const { makeHTMLElement } = GridUtils;
/* *
 *
 *  Class
 *
 * */
class ContextMenuButton {
    /* *
     *
     *  Constructor
     *
     * */
    constructor(options) {
        /**
         * Used to remove the event listeners when the button is destroyed.
         */
        this.eventListenerDestroyers = [];
        /**
         * Whether the button is active.
         */
        this.isActive = false;
        this.options = options;
    }
    /* *
     *
     *  Methods
     *
     * */
    /**
     * Adds the button to the context menu.
     *
     * @param contextMenu
     * The context menu to add the button to.
     */
    add(contextMenu) {
        const cfg = this.options;
        this.contextMenu = contextMenu;
        contextMenu.buttons.push(this);
        const container = contextMenu.ensureItemsContainer();
        if (!container) {
            return;
        }
        const liEl = this.wrapper = makeHTMLElement('li', cfg.classNameKey && {
            className: Globals.getClassName(cfg.classNameKey)
        }, container);
        const buttonEl = this.buttonEl = makeHTMLElement('button', {
            className: Globals.getClassName('menuItem')
        }, liEl);
        const iconEl = this.iconWrapper = makeHTMLElement('span', {
            className: Globals.getClassName('menuItemIcon')
        }, buttonEl);
        this.spanEl = makeHTMLElement('span', {
            className: Globals.getClassName('menuItemLabel'),
            innerText: cfg.label || ''
        }, buttonEl);
        const chevronEl = makeHTMLElement('span', {
            className: Globals.getClassName('menuItemIcon')
        }, buttonEl);
        iconEl.setAttribute('aria-hidden', 'true');
        chevronEl.setAttribute('aria-hidden', 'true');
        buttonEl.setAttribute('type', 'button');
        buttonEl.setAttribute('tabindex', '-1');
        this.refreshState();
        if (cfg.chevron) {
            chevronEl.appendChild(SvgIcons.createGridIcon('chevronRight'));
        }
        if (cfg.icon) {
            this.setIcon(cfg.icon);
        }
        this.addEventListeners();
        return this;
    }
    focus() {
        this.buttonEl?.focus();
        const cm = this.contextMenu;
        if (cm) {
            cm.focusCursor = cm.buttons.indexOf(this);
        }
    }
    setLabel(label) {
        if (this.spanEl) {
            this.spanEl.innerText = label;
        }
    }
    /**
     * Sets the icon for the button.
     *
     * @param icon
     * The icon to set.
     */
    setIcon(icon) {
        this.icon?.remove();
        if (!icon) {
            return;
        }
        this.icon = SvgIcons.createGridIcon(icon);
        this.iconWrapper?.appendChild(this.icon);
    }
    setActive(active) {
        this.isActive = active;
        this.buttonEl?.classList.toggle('active', active);
        const { activeIcon, icon } = this.options;
        if (activeIcon) {
            this.setIcon(active ? activeIcon : icon);
        }
    }
    setHighlighted(highlighted) {
        this.buttonEl?.classList.toggle('highlighted', highlighted);
    }
    /**
     * Destroys the button.
     */
    destroy() {
        this.removeEventListeners();
        this.wrapper?.remove();
        // Unregister from the context menu
        const cm = this.contextMenu;
        if (cm) {
            cm.buttons.splice(cm.buttons.indexOf(this), 1);
            delete this.contextMenu;
        }
    }
    /**
     * Initializes the state of the button.
     */
    refreshState() {
        // Do nothing, to be overridden by subclasses
    }
    /**
     * Handles the click event for the button.
     *
     * @param event
     * The mouse event.
     */
    clickHandler(event) {
        this.options.onClick?.(event, this);
    }
    /**
     * Adds event listeners to the button.
     */
    addEventListeners() {
        const clickListener = (event) => {
            this.clickHandler(event);
        };
        this.buttonEl?.addEventListener('click', clickListener);
        this.eventListenerDestroyers.push(() => {
            this.buttonEl?.removeEventListener('click', clickListener);
        });
    }
    /**
     * Removes event listeners from the button.
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
export default ContextMenuButton;
