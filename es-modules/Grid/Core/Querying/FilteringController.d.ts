import type { FilterCondition } from '../../../Data/Modifiers/FilterModifierOptions.js';
import type { ColumnFilteringOptions, FilteringCondition } from '../Options.js';
import FilterModifier from '../../../Data/Modifiers/FilterModifier.js';
import QueryingController from './QueryingController.js';
/**
 * Event that allows data projection features to redirect a filter condition
 * built for a column, e.g. from a generated column to its source columns.
 */
export interface ResolveFilterConditionEvent {
    /**
     * Grid column id the filter is applied to.
     */
    columnId: string;
    /**
     * Condition built from the filtering options. Can be replaced.
     */
    condition?: FilterCondition;
    /**
     * Filtering options the condition was built from.
     */
    options: ColumnFilteringOptions;
    /**
     * Source column id resolved for the Grid column.
     */
    sourceColumnId: string;
}
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
    static mapOptionsToFilter(columnId: string, options: ColumnFilteringOptions): FilterCondition | undefined;
    /**
     * Compares two serializable filter conditions produced from Grid options.
     *
     * @param left
     * The current filter condition.
     *
     * @param right
     * The next filter condition.
     */
    static filterConditionsEqual(left?: FilterCondition, right?: FilterCondition): boolean;
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
     * Builds the filter condition for a column, letting data projection
     * features redirect it to the columns actually backing the data.
     *
     * @param columnId
     * Grid column id.
     *
     * @param sourceColumnId
     * Source column id resolved for the Grid column.
     *
     * @param options
     * Filtering options of the column.
     */
    private createColumnCondition;
    /**
     * Updates the modifier based on the current column conditions.
     */
    private updateModifier;
}
export default FilteringController;
