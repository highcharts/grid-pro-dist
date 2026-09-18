/* *
 *
 *  Grid Credits class
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
 *  - Sebastian Bochan
 *
 * */
'use strict';
import AST from '../../Core/Renderer/HTML/AST.js';
import Globals from './Globals.js';
import GridUtils from './GridUtils.js';
const { makeHTMLElement, setHTMLContent } = GridUtils;
/* *
 *
 *  Class
 *
 * */
/**
 * Represents a credits in the grid.
 */
class Credits {
    /* *
    *
    *  Constructor
    *
    * */
    /**
     * Construct the credits.
     *
     * @param grid
     * The Grid instance which the credits belong to.
     *
     * @param options
     * Options for the credits label. Predefined if not provided.
     *
     */
    constructor(grid, options) {
        this.grid = grid;
        this.containerElement = makeHTMLElement('div', {
            className: Globals.getClassName('creditsContainer')
        });
        this.textElement = this.renderAnchor();
        this.options = options ?? Credits.defaultOptions;
        this.render();
    }
    /* *
    *
    *  Methods
    *
    * */
    /**
     * Render the credits. If the credits are disabled, they will be removed
     * from the container.
     */
    render() {
        const grid = this.grid;
        const contentWrapper = grid.contentWrapper;
        const { text, href } = this.options;
        this.containerElement.remove();
        if (!this.textElement) {
            this.textElement = this.renderAnchor();
        }
        if (text) {
            setHTMLContent(this.textElement, text);
        }
        if (href) {
            this.setHref(href);
        }
        if (grid.descriptionElement) {
            contentWrapper?.insertBefore(this.containerElement, grid.descriptionElement);
        }
        else {
            contentWrapper?.appendChild(this.containerElement);
        }
    }
    /**
     * Set the anchor's href, dropping URLs that are not allowed references.
     *
     * @param href
     * The href to set on the anchor element. If undefined or unsafe, the href
     * attribute will be removed.
     */
    setHref(href) {
        const filtered = href && AST.filterUserAttributes({ href }).href;
        if (filtered) {
            this.textElement.setAttribute('href', filtered);
        }
        else {
            this.textElement.removeAttribute('href');
        }
    }
    renderAnchor() {
        const anchorElement = makeHTMLElement('a', {
            className: Globals.getClassName('creditsText')
        }, this.containerElement);
        anchorElement.setAttribute('target', '_blank');
        anchorElement.setAttribute('alt', 'Highcharts logo');
        return anchorElement;
    }
    /**
     * Get the height of the credits container.
     */
    getHeight() {
        return this.containerElement.offsetHeight;
    }
    /**
     * Destroy the credits. The credits will be removed from the container and
     * the reference to the credits will be deleted from the Grid instance
     * it belongs to.
     */
    destroy() {
        this.containerElement.remove();
    }
}
/* *
*
*  Static Properties
*
* */
/**
 * Default options of the credits.
 */
Credits.defaultOptions = {
    enabled: true,
    text: '',
    href: 'https://www.highcharts.com',
    position: 'bottom'
};
/* *
 *
 *  Default Export
 *
 * */
export default Credits;
