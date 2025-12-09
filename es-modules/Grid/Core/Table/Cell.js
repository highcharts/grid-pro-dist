/* *
 *
 *  Grid Cell abstract class
 *
 *  (c) 2020-2025 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Dawid Dragula
 *  - Sebastian Bochan
 *
 * */
'use strict';
import Templating from '../../../Core/Templating.js';
import U from '../../../Core/Utilities.js';
const { fireEvent } = U;
/* *
 *
 *  Abstract Class of Cell
 *
 * */
class Cell {
    /* *
    *
    *  Constructor
    *
    * */
    /**
     * Constructs a cell in the data grid.
     *
     * @param row
     * The row of the cell.
     *
     * @param column
     * The column of the cell.
     */
    constructor(row, column) {
        /**
         * Array of cell events to be removed when the cell is destroyed.
         */
        this.cellEvents = [];
        this.column = column;
        this.row = row;
        this.row.registerCell(this);
        this.htmlElement = this.init();
        this.htmlElement.setAttribute('tabindex', '-1');
        if (!this.column?.options.cells?.editMode?.enabled) {
            this.htmlElement.setAttribute('aria-readonly', 'true');
        }
        this.initEvents();
    }
    /* *
    *
    *  Methods
    *
    * */
    /**
     * Init element.
     * @internal
     */
    init() {
        const cell = document.createElement('td', {});
        cell.setAttribute('role', 'gridcell');
        return cell;
    }
    /**
     * Initialize event listeners. Events added to the `cellEvents` array will
     * be registered now and unregistered when the cell is destroyed.
     */
    initEvents() {
        this.cellEvents.push(['blur', () => this.onBlur()]);
        this.cellEvents.push(['focus', () => this.onFocus()]);
        this.cellEvents.push(['click', (e) => {
                this.onClick(e);
            }]);
        this.cellEvents.push(['keydown', (e) => {
                this.onKeyDown(e);
            }]);
        this.cellEvents.push(['mouseout', () => {
                this.onMouseOut();
            }]);
        this.cellEvents.push(['mouseover', () => {
                this.onMouseOver();
            }]);
        this.cellEvents.forEach((pair) => {
            this.htmlElement.addEventListener(pair[0], pair[1]);
        });
    }
    /**
     * Handles the focus event on the cell.
     */
    onFocus() {
        this.row.viewport.setFocusAnchorCell(this);
    }
    /**
     * Handles the blur event on the cell.
     */
    onBlur() {
        delete this.row.viewport.focusCursor;
    }
    /**
     * Handles user keydown on the cell.
     *
     * @param e
     * Keyboard event object.
     */
    onKeyDown(e) {
        const { row, column } = this;
        if (!column) {
            return;
        }
        const vp = row.viewport;
        const { header } = vp;
        const getVerticalPos = () => {
            if (row.index !== void 0) {
                return row.index - vp.rows[0].index;
            }
            const level = row.level;
            if (!header || level === void 0) {
                return 0;
            }
            return Math.max(level, header.levels) - header.rows.length - 1;
        };
        const changeFocusKeys = {
            ArrowDown: [1, 0],
            ArrowUp: [-1, 0],
            ArrowLeft: [0, -1],
            ArrowRight: [0, 1]
        };
        const dir = changeFocusKeys[e.key];
        if (e.key === 'Enter') {
            this.onClick(e);
        }
        if (dir) {
            e.preventDefault();
            e.stopPropagation();
            const { header } = vp;
            const localRowIndex = getVerticalPos();
            const nextVerticalDir = localRowIndex + dir[0];
            if (nextVerticalDir < 0 && header) {
                const extraRowIdx = header.rows.length + nextVerticalDir;
                if (extraRowIdx + 1 > header.levels) {
                    header.rows[extraRowIdx]
                        .cells[column.index + dir[1]]?.htmlElement.focus();
                }
                else {
                    vp.columns[column.index + dir[1]]
                        ?.header?.htmlElement.focus();
                }
                return;
            }
            const nextRow = vp.rows[nextVerticalDir];
            if (nextRow) {
                nextRow.cells[column.index + dir[1]]?.htmlElement.focus();
            }
        }
    }
    /**
     * Handles the mouse over event on the cell.
     * @internal
     */
    onMouseOver() {
        const { grid } = this.row.viewport;
        grid.hoverColumn(this.column?.id);
        fireEvent(this, 'mouseOver', {
            target: this
        });
    }
    /**
     * Handles the mouse out event on the cell.
     * @internal
     */
    onMouseOut() {
        const { grid } = this.row.viewport;
        grid.hoverColumn();
        fireEvent(this, 'mouseOut', {
            target: this
        });
    }
    /**
     * Renders the cell by appending the HTML element to the row.
     */
    render() {
        this.row.htmlElement.appendChild(this.htmlElement);
        this.reflow();
    }
    /**
     * Reflows the cell dimensions.
     */
    reflow() {
        const column = this.column;
        if (!column) {
            return;
        }
        const elementStyle = this.htmlElement.style;
        elementStyle.width = elementStyle.maxWidth = column.getWidth() + 'px';
    }
    /**
     * Returns the formatted string where the templating context is the cell.
     *
     * @param template
     * The template string.
     *
     * @return
     * The formatted string.
     */
    format(template) {
        return Templating.format(template, this, this.row.viewport.grid);
    }
    /**
     * Sets the custom class name of the cell based on the template.
     *
     * @param template
     * The template string.
     */
    setCustomClassName(template) {
        const element = this.htmlElement;
        if (this.customClassName) {
            element.classList.remove(...this.customClassName.split(/\s+/g));
        }
        if (!template) {
            delete this.customClassName;
            return;
        }
        const newClassName = this.format(template);
        if (!newClassName) {
            delete this.customClassName;
            return;
        }
        element.classList.add(...newClassName.split(/\s+/g));
        this.customClassName = newClassName;
    }
    /**
     * Destroys the cell.
     */
    destroy() {
        this.cellEvents.forEach((pair) => {
            this.htmlElement.removeEventListener(pair[0], pair[1]);
        });
        this.column?.unregisterCell(this);
        this.row.unregisterCell(this);
        this.htmlElement.remove();
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default Cell;
