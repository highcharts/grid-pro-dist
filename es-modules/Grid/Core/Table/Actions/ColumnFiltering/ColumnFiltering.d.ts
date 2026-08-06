import type { Column, ColumnDataType } from '../../Column';
import type { Condition } from './FilteringTypes';
import type FilterCell from './FilterCell';
import type { LangOptions } from '../../../Options';
/**
 * Class that manages filtering for a dedicated column.
 */
declare class ColumnFiltering {
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
    static parseCamelCaseToReadable(value: string): string;
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
    static getOperatorLabel(operator: string, dataType: ColumnDataType, lang?: LangOptions): string;
    /**
     * Maps legacy filtering operators to their canonical names for UI use.
     * TODO: Remove, deprecated — only needed for `before`/`after` aliases.
     *
     * @param operator
     * The filtering operator from options or UI.
     */
    private static mapOperatorAliases;
    /**
     * The filtered column of the table.
     */
    column: Column;
    /**
     * The filter cell of the column if the filtering is inline.
     */
    inlineCell?: FilterCell;
    /**
     * The input element for the filtering. Can be of type `text`, `number`
     * or `date`.
     */
    filterInput?: HTMLInputElement;
    /**
     * The select element setting the condition for the filtering.
     */
    filterSelect?: HTMLSelectElement;
    /**
     * The button to clear the filtering.
     */
    clearButton?: HTMLButtonElement;
    /**
     * Constructs filtering controller for a dedicated column.
     *
     * @param column
     * The filtered column.
     */
    constructor(column: Column);
    /**
     * Sets the value and operator for the filtering.
     *
     * @param value
     * The value to set.
     *
     * @param operator
     * The operator to set.
     */
    set(value?: string, operator?: Condition): Promise<void>;
    /**
     * Render the filtering content in the container.
     *
     * @param container
     * The container element.
     */
    renderFilteringContent(container: HTMLElement): void;
    /**
     * Handles the keydown event for the filtering content. Used externally,
     * not in the class itself.
     *
     * @param e
     * The keyboard event.
     */
    onKeyDown: (e: KeyboardEvent) => void;
    /**
     * Takes the filtering value and condition from the inputs and applies it
     * to the column.
     */
    private applyFilterFromForm;
    /**
     * Applies the filtering to the column.
     *
     * @param condition
     * The filtering condition.
     */
    private applyFilter;
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
    private hasSameFilterCondition;
    /**
     * Render the filtering input element, based on the column type.
     *
     * @param inputWrapper
     * Reference to the input wrapper.
     *
     * @param columnType
     * Reference to the column type.
     */
    private renderFilteringInput;
    /**
     * Reserves the operator select row height in inline filtering when the
     * select is hidden, so value inputs align across columns.
     *
     * @param inputWrapper
     * Reference to the input wrapper.
     */
    private renderOperatorSelectSpacer;
    /**
     * Render the condition select element.
     *
     * @param inputWrapper
     * Reference to the input wrapper.
     */
    private renderConditionSelect;
    private renderClearButton;
    /**
     * Checks if filtering is applied to the column.
     *
     * @returns
     * `true` if filtering is applied to the column, `false` otherwise.
     */
    private isFilteringApplied;
    /**
     * Updates the filter input placeholder or aria-label when the operator
     * select is hidden.
     */
    private updateFilterInputHint;
    /**
     * Disables the input element if the condition is `empty` or `notEmpty`.
     */
    private disableInputIfNeeded;
    /**
     * Returns the current filtering operator from the dropdown or options.
     */
    private getActiveCondition;
    /**
     * Focuses the first filter control in tab order for inline filtering.
     */
    focusFirstControl(): void;
    /**
     * Returns the list of filtering conditions available for the current
     * column, optionally restricted by column filtering options.
     */
    private getAllowedConditions;
}
export default ColumnFiltering;
