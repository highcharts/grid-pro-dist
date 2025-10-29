import type Column from '../../Column';
import type { Condition } from './FilteringTypes';
import type FilterCell from './FilterCell.js';
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
     * Sets the value and condition for the filtering.
     *
     * @param value
     * The value to set.
     *
     * @param condition
     * The condition to set.
     */
    set(value?: string, condition?: Condition): Promise<void>;
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
     * Disables the input element if the condition is `empty` or `notEmpty`.
     */
    private disableInputIfNeeded;
}
export default ColumnFiltering;
