import type { FilterCondition } from '../../../Data/Modifiers/FilterModifierOptions.js';
import type { FilteringCondition } from '../Options.js';
import FilterModifier from '../../../Data/Modifiers/FilterModifier.js';
import QueryingController from './QueryingController.js';
/**
 * Class that manages one of the data grid querying types - filtering.
 */
declare class FilteringController {
    /**
     * The data grid instance.
     */
    private querying;
    /**
     * A map of the filtering conditions for each column.
     */
    private columnConditions;
    /**
     * The modifier that is used to filter the data.
     */
    modifier?: FilterModifier;
    /**
     * Constructs the FilteringController instance.
     *
     * @param querying
     * The querying controller instance.
     */
    constructor(querying: QueryingController);
    /**
     * Maps filtering options to the filtering condition.
     *
     * @param columnId
     * Id of the column to filter.
     *
     * @param options
     * Filtering options.
     */
    static mapOptionsToFilter(columnId: string, options: FilteringCondition): FilterCondition | undefined;
    /**
     * Loads filtering options from the data grid options.
     */
    loadOptions(): void;
    /**
     * Adds a new filtering condition to the specified column.
     *
     * @param columnId
     * The column ID to filter in.
     *
     * @param options
     * The filtering options.
     */
    addColumnFilterCondition(columnId: string, options: FilteringCondition): void;
    /**
     * Clears the filtering condition for the specified column. If no column ID
     * is provided, clears all the column filtering conditions.
     *
     * @param columnId
     * The column ID to clear or `undefined` to clear all the column filtering
     * conditions.
     */
    clearColumnFiltering(columnId?: string): void;
    /**
     * Updates the modifier based on the current column conditions.
     */
    private updateModifier;
}
export default FilteringController;
