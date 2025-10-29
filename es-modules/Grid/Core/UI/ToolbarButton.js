/* *
 *
 *  Grid Toolbar Button class
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
class ToolbarButton {
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
     * Adds the button to the toolbar.
     *
     * @param toolbar
     * The toolbar to add the button to.
     */
    add(toolbar) {
        const cfg = this.options;
        this.toolbar = toolbar;
        toolbar.buttons.push(this);
        const wrapper = makeHTMLElement('span', cfg.classNameKey && {
            className: Globals.getClassName(cfg.classNameKey)
        }, toolbar.container);
        this.wrapper = wrapper;
        const button = this.buttonEl = makeHTMLElement('button', {
            className: (Globals.getClassName('button') +
                (this.isActive ? ' active' : ''))
        }, wrapper);
        button.setAttribute('type', 'button');
        button.setAttribute('tabindex', '-1');
        this.setA11yAttributes(button);
        this.setIcon(cfg.icon);
        this.refreshState();
        this.addEventListeners();
        return this;
    }
    setA11yAttributes(button) {
        const { accessibility, tooltip } = this.options;
        const { ariaLabel, ariaExpanded, ariaControls } = accessibility || {};
        if (tooltip) {
            button.title = tooltip;
        }
        if (ariaLabel) {
            button.setAttribute('aria-label', ariaLabel);
        }
        if (typeof ariaExpanded === 'boolean') {
            button.setAttribute('aria-expanded', ariaExpanded);
        }
        if (ariaControls) {
            button.setAttribute('aria-controls', ariaControls);
        }
    }
    focus() {
        this.buttonEl?.focus();
        const tb = this.toolbar;
        if (tb) {
            tb.focusCursor = tb.buttons.indexOf(this);
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
        this.icon = SvgIcons.createGridIcon(icon);
        this.buttonEl?.appendChild(this.icon);
    }
    setActive(active) {
        this.isActive = active;
        this.buttonEl?.classList.toggle('active', active);
        this.renderActiveIndicator(active);
    }
    setHighlighted(highlighted) {
        this.buttonEl?.classList.toggle('highlighted', highlighted);
        const ariaExpanded = this.options.accessibility?.ariaExpanded;
        if (typeof ariaExpanded === 'boolean') {
            this.buttonEl?.setAttribute('aria-expanded', highlighted);
        }
    }
    /**
     * Destroys the button.
     */
    destroy() {
        this.removeEventListeners();
        this.wrapper?.remove();
        // Unregister from toolbar
        this.toolbar?.buttons.splice(this.toolbar.buttons.indexOf(this), 1);
        delete this.toolbar;
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
     * Renders the active indicator for the button.
     *
     * @param render
     * Whether the active indicator should be rendered.
     */
    renderActiveIndicator(render) {
        const button = this.buttonEl;
        if (!button) {
            return;
        }
        this.activeIndicator?.remove();
        if (!render) {
            delete this.activeIndicator;
            return;
        }
        this.activeIndicator = makeHTMLElement('div', {
            className: Globals.getClassName('toolbarButtonActiveIndicator')
        }, button);
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
export default ToolbarButton;
