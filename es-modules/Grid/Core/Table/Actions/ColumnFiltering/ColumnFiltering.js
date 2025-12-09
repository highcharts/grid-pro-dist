/* *
 *
 *  Grid ColumnFiltering class
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
 *  - Kamil Kubik
 *
 * */
'use strict';
import U from '../../../../../Core/Utilities.js';
import GU from '../../../GridUtils.js';
import Globals from '../../../Globals.js';
import { conditionsMap } from './FilteringTypes.js';
const { defined, fireEvent } = U;
const { makeHTMLElement } = GU;
/* *
 *
 *  Class
 *
 * */
/**
 * Class that manages filtering for a dedicated column.
 */
class ColumnFiltering {
    /* *
     *
     *  Static Methods
     *
     * */
    /**
     * Parses a camel case string to a readable string and capitalizes the first
     * letter.
     *
     * @param value
     * The camel case string to parse.
     *
     * @returns
     * The readable string with the first letter capitalized.
     */
    static parseCamelCaseToReadable(value) {
        const readable = value
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .toLowerCase()
            .split(/\s+/).join(' ');
        return readable.charAt(0).toUpperCase() + readable.slice(1);
    }
    /* *
    *
    *  Constructor
    *
    * */
    /**
     * Constructs filtering controller for a dedicated column.
     *
     * @param column
     * The filtered column.
     */
    constructor(column) {
        /**
         * Handles the keydown event for the filtering content. Used externally,
         * not in the class itself.
         *
         * @param e
         * The keyboard event.
         */
        this.onKeyDown = (e) => {
            const contentOrder = [];
            if (this.filterSelect && !this.filterSelect.disabled) {
                contentOrder.push(this.filterSelect);
            }
            if (this.filterInput && !this.filterInput.disabled) {
                contentOrder.push(this.filterInput);
            }
            if (this.clearButton && !this.clearButton.disabled) {
                contentOrder.push(this.clearButton);
            }
            const direction = {
                'ArrowDown': 1,
                'ArrowUp': -1
            }[e.key];
            if (direction) {
                e.preventDefault();
                const currentIndex = contentOrder.indexOf(e.target);
                const n = contentOrder.length;
                contentOrder[(currentIndex + direction + n) % n].focus();
                return;
            }
            if (e.key === 'Enter') {
                if (e.target === this.clearButton) {
                    e.preventDefault();
                    void this.set();
                    contentOrder[0]?.focus();
                    return;
                }
            }
        };
        this.column = column;
    }
    /* *
    *
    *  Methods
    *
    * */
    /**
     * Sets the value and condition for the filtering.
     *
     * @param value
     * The value to set.
     *
     * @param condition
     * The condition to set.
     */
    async set(value, condition) {
        if (this.filterInput) {
            this.filterInput.value = value ?? '';
        }
        if (this.filterSelect) {
            this.filterSelect.value =
                condition ?? conditionsMap[this.column.dataType][0];
        }
        await this.applyFilter({ value, condition });
    }
    /**
     * Refreshes the state of the filtering content by updating the select,
     * input and clear button according to the column filtering options.
     * @internal
     */
    refreshState() {
        const colFilteringOptions = this.column.options.filtering;
        if (this.filterSelect) {
            this.filterSelect.value =
                colFilteringOptions?.condition ??
                    conditionsMap[this.column.dataType][0];
        }
        if (this.filterInput) {
            this.filterInput.value = '' + (colFilteringOptions?.value ?? '');
        }
        if (this.clearButton) {
            this.clearButton.disabled = !this.isFilteringApplied();
        }
        this.disableInputIfNeeded();
    }
    /**
     * Render the filtering content in the container.
     *
     * @param container
     * The container element.
     */
    renderFilteringContent(container) {
        const column = this.column;
        const columnType = column.dataType;
        if (!column.options.filtering?.enabled) {
            return;
        }
        // Render the input wrapper.
        const inputWrapper = makeHTMLElement('div', {
            className: Globals.getClassName('columnFilterWrapper')
        }, container);
        this.renderConditionSelect(inputWrapper);
        if (columnType !== 'boolean') {
            this.renderFilteringInput(inputWrapper, columnType);
        }
        this.renderClearButton(inputWrapper);
    }
    /**
     * Takes the filtering value and condition from the inputs and applies it
     * to the column.
     */
    applyFilterFromForm() {
        const result = {
            condition: this.filterSelect?.value
        };
        if (this.filterInput) {
            result.value = this.filterInput.value;
        }
        if (result.condition &&
            conditionsMap[this.column.dataType].includes(result.condition)) {
            void this.applyFilter(result);
        }
    }
    /**
     * Applies the filtering to the column.
     *
     * @param condition
     * The filtering condition.
     */
    async applyFilter(condition) {
        const viewport = this.column.viewport;
        const querying = viewport.grid.querying;
        const filteringController = querying.filtering;
        const columnId = this.column.id;
        const a11y = viewport.grid.accessibility;
        const { value } = condition;
        fireEvent(this.column, 'beforeFilter', {
            target: this.column
        });
        const filteringApplied = this.isFilteringApplied();
        const clearButton = this.clearButton;
        if (clearButton && filteringApplied === clearButton.disabled) {
            clearButton.disabled = !filteringApplied;
        }
        if (defined(value) && value !== '' && typeof value !== 'number') {
            switch (this.column.dataType) {
                case 'number':
                    condition.value = Number(value);
                    break;
                case 'datetime':
                    condition.value = new Date(`${value}Z`).getTime();
                    break;
            }
        }
        this.column.setOptions({
            filtering: {
                condition: condition.condition,
                value: condition.value
            }
        });
        filteringController.addColumnFilterCondition(columnId, condition);
        this.disableInputIfNeeded();
        await querying.proceed();
        await viewport.updateRows();
        a11y?.userFilteredColumn({
            ...condition,
            columnId,
            rowsCount: viewport.rows.length
        }, filteringApplied);
        fireEvent(this.column, 'afterFilter', {
            target: this.column
        });
    }
    /**
     * Render the filtering input element, based on the column type.
     *
     * @param inputWrapper
     * Reference to the input wrapper.
     *
     * @param columnType
     * Reference to the column type.
     */
    renderFilteringInput(inputWrapper, columnType) {
        // Render the input element.
        this.filterInput = makeHTMLElement('input', {
            className: Globals.getClassName('input')
        }, inputWrapper);
        this.filterInput.setAttribute('tabindex', '-1');
        const column = this.column;
        this.filterInput.setAttribute('id', 'filter-input-' + column.viewport.grid.id + '-' + column.id);
        this.filterInput.placeholder = 'Value...';
        if (columnType === 'number') {
            this.filterInput.type = 'number';
        }
        else if (columnType === 'datetime') {
            this.filterInput.type = 'date';
        }
        else {
            this.filterInput.type = 'text';
            this.filterInput.classList.add(Globals.getClassName('icon'), Globals.getClassName('iconSearch'));
        }
        // Assign the default input value.
        const { value } = this.column.options.filtering ?? {};
        if (value || value === 0) {
            this.filterInput.value = columnType === 'datetime' ?
                column.viewport.grid.time.dateFormat('%Y-%m-%d', Number(value)) :
                value.toString();
        }
        if (this.filterSelect) {
            this.disableInputIfNeeded();
        }
        const eventTypes = {
            string: ['keyup'],
            number: ['keyup', 'change'],
            datetime: ['change']
        };
        for (const eventType of eventTypes[columnType]) {
            this.filterInput.addEventListener(eventType, () => {
                this.applyFilterFromForm();
            });
        }
    }
    /**
     * Render the condition select element.
     *
     * @param inputWrapper
     * Reference to the input wrapper.
     */
    renderConditionSelect(inputWrapper) {
        // Render the select element.
        this.filterSelect = makeHTMLElement('select', {
            className: Globals.getClassName('input')
        }, inputWrapper);
        this.filterSelect.setAttribute('tabindex', '-1');
        const column = this.column;
        this.filterSelect.setAttribute('id', 'filter-select-' + column.viewport.grid.id + '-' + column.id);
        const conditions = conditionsMap[column.dataType];
        const langConditions = this.column.viewport.grid.options
            ?.lang?.columnFilteringConditions ?? {};
        // Render the options.
        for (const condition of conditions) {
            const optionElement = document.createElement('option');
            optionElement.value = condition;
            optionElement.textContent = langConditions[condition] ??
                ColumnFiltering.parseCamelCaseToReadable(condition);
            this.filterSelect.appendChild(optionElement);
        }
        // Use condition from options or first available condition as default.
        const filteringCondition = this.column.options.filtering?.condition;
        if (filteringCondition && conditions.includes(filteringCondition)) {
            this.filterSelect.value = filteringCondition;
        }
        else {
            this.filterSelect.value = conditions[0];
        }
        this.disableInputIfNeeded();
        // Attach event listener.
        this.filterSelect.addEventListener('change', () => {
            this.applyFilterFromForm();
        });
    }
    renderClearButton(inputWrapper) {
        this.clearButton = makeHTMLElement('button', {
            className: Globals.getClassName('clearFilterButton'),
            innerText: 'Clear filter' // TODO: Lang
        }, inputWrapper);
        this.clearButton.setAttribute('tabindex', '-1');
        this.clearButton.disabled = !this.isFilteringApplied();
        this.clearButton.addEventListener('click', () => {
            void this.set();
        });
    }
    /**
     * Checks if filtering is applied to the column.
     *
     * @returns
     * `true` if filtering is applied to the column, `false` otherwise.
     */
    isFilteringApplied() {
        const { filterSelect: select, filterInput: input } = this;
        const { dataType } = this.column;
        const condition = select?.value;
        if (dataType === 'boolean') {
            return condition !== 'all';
        }
        if (condition === 'empty' || condition === 'notEmpty') {
            return true;
        }
        return input?.value !== '';
    }
    /**
     * Disables the input element if the condition is `empty` or `notEmpty`.
     */
    disableInputIfNeeded() {
        const { filterSelect: select, filterInput: input } = this;
        const condition = select?.value;
        if (!input || !select) {
            return;
        }
        if (condition === 'empty' || condition === 'notEmpty') {
            input.disabled = true;
        }
        else if (input?.disabled) {
            input.disabled = false;
        }
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default ColumnFiltering;
