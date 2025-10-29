/* *
 *
 *  Grid Accessibility class
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
import whcm from '../../../Accessibility/HighContrastMode.js';
import Globals from '../Globals.js';
import ColumnFiltering from '../Table/Actions/ColumnFiltering/ColumnFiltering.js';
import GridUtils from '../GridUtils.js';
const { formatText } = GridUtils;
/**
 *  Representing the accessibility functionalities for the Data Grid.
 */
class Accessibility {
    /* *
    *
    *  Constructor
    *
    * */
    /**
     * Construct the accessibility object.
     *
     * @param grid
     * The Grid Table instance which the accessibility controller belong to.
     */
    constructor(grid) {
        this.grid = grid;
        this.element = document.createElement('div');
        this.element.classList.add(Globals.getClassName('visuallyHidden'));
        this.grid.container?.prepend(this.element);
        this.announcerElement = document.createElement('p');
        this.announcerElement.setAttribute('aria-atomic', 'true');
        this.announcerElement.setAttribute('aria-hidden', 'false');
    }
    /* *
    *
    *  Methods
    *
    * */
    /**
     * Add the description to the header cell.
     *
     * @param thElement
     * The header cell element to add the description to.
     *
     * @param description
     * The description to be added.
     */
    addHeaderCellDescription(thElement, description) {
        if (description) {
            thElement.setAttribute('aria-description', description);
        }
    }
    /**
     * Announce the message to the screen reader.
     *
     * @param msg
     * The message to be announced.
     *
     * @param assertive
     * Whether the message should be assertive. Default is false.
     */
    announce(msg, assertive = false) {
        if (this.announcerTimeout) {
            clearTimeout(this.announcerTimeout);
        }
        this.announcerElement.remove();
        this.announcerElement.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
        this.element.appendChild(this.announcerElement);
        requestAnimationFrame(() => {
            this.announcerElement.textContent = msg;
        });
        this.announcerTimeout = setTimeout(() => {
            this.announcerElement.remove();
        }, 3000);
    }
    /**
     * Announce the message to the screen reader that the user sorted the
     * column.
     *
     * @param order
     * The order of the sorting.
     */
    userSortedColumn(order) {
        const { options } = this.grid;
        const announcementsLang = options?.lang
            ?.accessibility?.sorting?.announcements;
        if (!options?.accessibility?.announcements?.sorting) {
            return;
        }
        let msg;
        switch (order) {
            case 'asc':
                msg = announcementsLang?.ascending;
                break;
            case 'desc':
                msg = announcementsLang?.descending;
                break;
            default:
                msg = announcementsLang?.none;
        }
        if (!msg) {
            return;
        }
        this.announce(msg, true);
    }
    /**
     * Set the aria sort state of the column header cell element.
     *
     * @param thElement
     * The header cell element to set the `aria-sort` state to.
     *
     * @param state
     * The sort state to be set for the column header cell.
     */
    setColumnSortState(thElement, state) {
        thElement?.setAttribute('aria-sort', state);
    }
    /**
     * Announce the message to the screen reader that the user filtered the
     * column.
     *
     * @param filteredColumnValues
     * The values of the filtered column.
     *
     * @param filteringApplied
     * Whether the filtering was applied or cleared.
     */
    userFilteredColumn(filteredColumnValues, filteringApplied) {
        const { columnId, condition, value, rowsCount } = filteredColumnValues;
        const { lang, accessibility } = this.grid.options || {};
        if (!accessibility?.announcements?.filtering) {
            return;
        }
        const announcementsLang = lang?.accessibility?.filtering?.announcements;
        let msg;
        if (filteringApplied && condition) {
            const parsedCondition = ColumnFiltering.parseCamelCaseToReadable(condition);
            if (condition === 'empty' ||
                condition === 'notEmpty' ||
                condition === 'false' ||
                condition === 'true') {
                msg = formatText(announcementsLang?.emptyFilterApplied || '', {
                    columnId,
                    condition: parsedCondition,
                    rowsCount: rowsCount
                });
            }
            else {
                msg = formatText(announcementsLang?.filterApplied || '', {
                    columnId,
                    condition: parsedCondition,
                    value: value?.toString() || '',
                    rowsCount: rowsCount
                });
            }
        }
        else {
            msg = formatText(announcementsLang?.filterCleared || '', {
                columnId,
                rowsCount: rowsCount
            });
        }
        this.announce(msg, true);
    }
    /**
     * Adds high contrast CSS class, if the browser is in High Contrast mode.
     */
    addHighContrast() {
        const highContrastMode = this.grid.options?.accessibility?.highContrastMode;
        if (highContrastMode !== false && (whcm.isHighContrastModeActive() ||
            highContrastMode === true)) {
            this.grid.contentWrapper?.classList.add('hcg-theme-highcontrast');
        }
    }
    /**
     * Set the row index attribute for the row element.
     *
     * @param el
     * The row element to set the index to.
     *
     * @param idx
     * The index of the row in the data table.
     */
    setRowIndex(el, idx) {
        el.setAttribute('aria-rowindex', idx);
    }
    /**
     * Set a11y options for the Grid.
     */
    setA11yOptions() {
        const grid = this.grid;
        const tableEl = grid.tableElement;
        if (!tableEl) {
            return;
        }
        tableEl.setAttribute('aria-rowcount', grid.dataTable?.getRowCount() || 0);
        if (grid.captionElement) {
            tableEl.setAttribute('aria-labelledby', grid.captionElement.id);
        }
        if (grid.descriptionElement) {
            tableEl.setAttribute('aria-describedby', grid.descriptionElement.id);
        }
        this.addHighContrast();
    }
    /**
     * Destroy the accessibility controller.
     */
    destroy() {
        this.element.remove();
        this.announcerElement.remove();
        clearTimeout(this.announcerTimeout);
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default Accessibility;
