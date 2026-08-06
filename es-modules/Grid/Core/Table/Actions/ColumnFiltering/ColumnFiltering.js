/* *
 *
 *  Grid ColumnFiltering class
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
 *  - Kamil Kubik
 *
 * */
'use strict';
import { makeHTMLElement } from '../../../GridUtils.js';
import FilteringController from '../../../Querying/FilteringController.js';
import Globals from '../../../Globals.js';
import { defaultOptions } from '../../../Defaults.js';
import { conditionsMap, operatorAliases } from './FilteringTypes.js';
import { defined, fireEvent, pick } from '../../../../../Shared/Utilities.js';
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
    /**
     * Returns the localized label for a filtering operator.
     *
     * @param operator
     * The filtering operator.
     *
     * @param dataType
     * The column data type.
     *
     * @param lang
     * The grid language options.
     */
    static getOperatorLabel(operator, dataType, lang) {
        if (dataType === 'datetime') {
            const datetimeLabel = lang?.columnFilteringDateTimeOperators?.[operator];
            if (datetimeLabel) {
                return datetimeLabel;
            }
        }
        const label = lang?.columnFilteringOperators?.[operator] ??
            // TODO: Remove, deprecated
            lang?.columnFilteringConditions?.[operator];
        if (label) {
            return label;
        }
        return ColumnFiltering.parseCamelCaseToReadable(operator);
    }
    /**
     * Maps legacy filtering operators to their canonical names for UI use.
     * TODO: Remove, deprecated — only needed for `before`/`after` aliases.
     *
     * @param operator
     * The filtering operator from options or UI.
     */
    static mapOperatorAliases(operator) {
        if (!operator) {
            return;
        }
        return (operatorAliases[operator] ??
            operator);
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
            if (direction && contentOrder.length) {
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
     * Sets the value and operator for the filtering.
     *
     * @param value
     * The value to set.
     *
     * @param operator
     * The operator to set.
     */
    async set(value, operator) {
        if (this.filterInput) {
            this.filterInput.value = value ?? '';
        }
        const conditions = this.getAllowedConditions();
        const normalizedOperator = ColumnFiltering.mapOperatorAliases(operator);
        if (this.filterSelect) {
            this.filterSelect.value =
                (normalizedOperator &&
                    conditions.includes(normalizedOperator)) ?
                    normalizedOperator :
                    conditions[0];
        }
        this.updateFilterInputHint();
        await this.applyFilter({
            value,
            condition: normalizedOperator ?? conditions[0]
        });
    }
    /**
     * Refreshes the state of the filtering content by updating the select,
     * input and clear button according to the column filtering options.
     * @internal
     */
    refreshState() {
        const colFilteringOptions = this.column.options.filtering;
        const operator = colFilteringOptions?.rule?.operator ??
            colFilteringOptions?.condition;
        const value = colFilteringOptions?.rule?.value ??
            colFilteringOptions?.value;
        if (this.filterSelect) {
            const conditions = this.getAllowedConditions();
            const normalizedOperator = ColumnFiltering.mapOperatorAliases(operator);
            this.filterSelect.value =
                (normalizedOperator &&
                    conditions.includes(normalizedOperator)) ?
                    normalizedOperator :
                    conditions[0];
        }
        if (this.filterInput) {
            this.filterInput.value =
                '' + (value ?? '');
        }
        if (this.clearButton) {
            this.clearButton.disabled = !this.isFilteringApplied();
        }
        this.disableInputIfNeeded();
        this.updateFilterInputHint();
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
        if (!column.viewport.grid.columnPolicy.isColumnFilteringEnabled(column.id)) {
            return;
        }
        // Render the input wrapper.
        const inputWrapper = makeHTMLElement('div', {
            className: Globals.getClassName('columnFilterWrapper')
        }, container);
        if (!column.viewport.grid.columnPolicy
            .isFilterOperatorSelectHidden(column.id)) {
            this.renderConditionSelect(inputWrapper);
        }
        else if (column.viewport.grid.columnPolicy
            .shouldRenderOperatorSpacer(column.id, column.viewport.grid.enabledColumns ?? [])) {
            this.renderOperatorSelectSpacer(inputWrapper);
        }
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
            condition: this.getActiveCondition()
        };
        if (this.filterInput) {
            result.value = this.filterInput.value;
        }
        if (result.condition &&
            this.getAllowedConditions().includes(result.condition)) {
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
        if (this.hasSameFilterCondition(columnId, condition)) {
            return;
        }
        this.column.setOptions({
            filtering: {
                rule: {
                    operator: condition.condition,
                    value: condition.value
                }
            }
        });
        const filteringOptions = this.column.viewport.grid.columnPolicy
            .getIndividualColumnOptions(this.column.id)
            ?.filtering;
        // The setOptions deep-merges filtering, so deprecated keys
        // would otherwise remain alongside rule after a user interaction.
        if (filteringOptions) {
            delete filteringOptions.condition;
            delete filteringOptions.value;
            delete filteringOptions.conditions;
        }
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
     * Returns whether the next filtering options would produce the same
     * semantic filter condition as the current one.
     *
     * @param columnId
     * The column ID to compare filtering state for.
     *
     * @param options
     * The next filtering options to compare.
     */
    hasSameFilterCondition(columnId, options) {
        const currentCondition = FilteringController.mapOptionsToFilter(columnId, this.column.options.filtering ?? {});
        const nextCondition = FilteringController.mapOptionsToFilter(columnId, options);
        return FilteringController.filterConditionsEqual(currentCondition, nextCondition);
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
        if (columnType === 'number') {
            this.filterInput.type = 'number';
        }
        else if (columnType === 'datetime') {
            this.filterInput.type = 'date';
        }
        else {
            this.filterInput.type = 'text';
        }
        // Assign the default input value.
        const value = this.column.options.filtering?.rule?.value ??
            this.column.options.filtering?.value;
        if (value || value === 0) {
            this.filterInput.value = columnType === 'datetime' ?
                column.viewport.grid.time.dateFormat('%Y-%m-%d', Number(value)) :
                value.toString();
        }
        this.disableInputIfNeeded();
        this.updateFilterInputHint();
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
     * Reserves the operator select row height in inline filtering when the
     * select is hidden, so value inputs align across columns.
     *
     * @param inputWrapper
     * Reference to the input wrapper.
     */
    renderOperatorSelectSpacer(inputWrapper) {
        const spacer = makeHTMLElement('div', {
            className: Globals.getClassName('columnFilterOperatorSpacer') +
                ' ' + Globals.getClassName('input'),
            innerText: '\u00a0'
        }, inputWrapper);
        spacer.setAttribute('aria-hidden', 'true');
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
        const conditions = this.getAllowedConditions();
        const lang = column.viewport.grid.options?.lang;
        // Render the options.
        for (const condition of conditions) {
            const optionElement = document.createElement('option');
            optionElement.value = condition;
            optionElement.textContent = ColumnFiltering.getOperatorLabel(condition, column.dataType, lang);
            this.filterSelect.appendChild(optionElement);
        }
        // Use operator from options or first available operator as default.
        const filteringOperator = ColumnFiltering.mapOperatorAliases(column.options.filtering?.rule?.operator ??
            column.options.filtering?.condition);
        if (filteringOperator && conditions.includes(filteringOperator)) {
            this.filterSelect.value = filteringOperator;
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
            innerText: 'Clear filter' // TODO(lang): Lang
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
        const { filterInput: input } = this;
        const { dataType } = this.column;
        const condition = this.getActiveCondition();
        if (dataType === 'boolean') {
            return condition !== 'all';
        }
        if (condition === 'empty' || condition === 'notEmpty') {
            return true;
        }
        return input?.value !== '';
    }
    /**
     * Updates the filter input placeholder or aria-label when the operator
     * select is hidden.
     */
    updateFilterInputHint() {
        const input = this.filterInput;
        const column = this.column;
        if (!input) {
            return;
        }
        const hideOperatorSelect = column.viewport.grid.columnPolicy
            .isFilterOperatorSelectHidden(column.id);
        if (!hideOperatorSelect) {
            input.placeholder = pick(column.viewport.grid.options?.lang?.filterValuePlaceholder, defaultOptions.lang?.filterValuePlaceholder, '');
            input.removeAttribute('aria-label');
            return;
        }
        const operatorLabel = ColumnFiltering.getOperatorLabel(this.getActiveCondition(), column.dataType, column.viewport.grid.options?.lang);
        if (column.dataType === 'datetime') {
            input.setAttribute('aria-label', operatorLabel);
        }
        else {
            input.placeholder = operatorLabel;
        }
    }
    /**
     * Disables the input element if the condition is `empty` or `notEmpty`.
     */
    disableInputIfNeeded() {
        const { filterInput: input } = this;
        const condition = this.getActiveCondition();
        if (!input) {
            return;
        }
        if (condition === 'empty' || condition === 'notEmpty') {
            input.disabled = true;
        }
        else if (input.disabled) {
            input.disabled = false;
        }
    }
    /**
     * Returns the current filtering operator from the dropdown or options.
     */
    getActiveCondition() {
        if (this.filterSelect) {
            return this.filterSelect.value;
        }
        const conditions = this.getAllowedConditions();
        const filteringOperator = ColumnFiltering.mapOperatorAliases(this.column.options.filtering?.rule?.operator ??
            this.column.options.filtering?.condition);
        if (filteringOperator && conditions.includes(filteringOperator)) {
            return filteringOperator;
        }
        return conditions[0];
    }
    /**
     * Focuses the first filter control in tab order for inline filtering.
     */
    focusFirstControl() {
        if (!this.filterSelect?.disabled) {
            this.filterSelect?.focus();
            return;
        }
        if (!this.filterInput?.disabled) {
            this.filterInput?.focus();
            return;
        }
        if (!this.clearButton?.disabled) {
            this.clearButton?.focus();
        }
    }
    /**
     * Returns the list of filtering conditions available for the current
     * column, optionally restricted by column filtering options.
     */
    getAllowedConditions() {
        const column = this.column;
        const grid = column.viewport.grid;
        const defaultTypeConditions = conditionsMap[column.dataType];
        const columnConditions = grid.columnPolicy.getIndividualColumnOptions(column.id)
            ?.filtering?.operators ??
            grid.columnPolicy.getIndividualColumnOptions(column.id)
                ?.filtering?.conditions ??
            grid.options?.columnDefaults?.filtering?.operators ??
            grid.options?.columnDefaults?.filtering?.conditions;
        if (!columnConditions?.length) {
            return defaultTypeConditions;
        }
        const allowedSet = new Set(columnConditions.map((operator) => ColumnFiltering.mapOperatorAliases(operator) ??
            operator));
        const allowed = defaultTypeConditions.filter((c) => allowedSet.has(c));
        return allowed.length ? allowed : defaultTypeConditions;
    }
}
/* *
 *
 *  Default Export
 *
 * */
export default ColumnFiltering;
