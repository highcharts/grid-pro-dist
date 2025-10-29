import type Grid from '../Grid';
import type { ColumnSortingOrder, FilteringCondition } from '../Options';
/**
 *  Representing the accessibility functionalities for the Data Grid.
 */
declare class Accessibility {
    /**
     * The Data Grid Table instance which the accessibility belong to.
     */
    grid: Grid;
    /**
     * The HTML element of the accessibility.
     */
    private element;
    /**
     * The HTML element of the announcer.
     */
    private announcerElement;
    /**
     * The timeout for the announcer element removal.
     */
    private announcerTimeout?;
    /**
     * Construct the accessibility object.
     *
     * @param grid
     * The Grid Table instance which the accessibility controller belong to.
     */
    constructor(grid: Grid);
    /**
     * Add the description to the header cell.
     *
     * @param thElement
     * The header cell element to add the description to.
     *
     * @param description
     * The description to be added.
     */
    addHeaderCellDescription(thElement: HTMLElement, description: string | undefined): void;
    /**
     * Announce the message to the screen reader.
     *
     * @param msg
     * The message to be announced.
     *
     * @param assertive
     * Whether the message should be assertive. Default is false.
     */
    announce(msg: string, assertive?: boolean): void;
    /**
     * Announce the message to the screen reader that the user sorted the
     * column.
     *
     * @param order
     * The order of the sorting.
     */
    userSortedColumn(order: ColumnSortingOrder): void;
    /**
     * Set the aria sort state of the column header cell element.
     *
     * @param thElement
     * The header cell element to set the `aria-sort` state to.
     *
     * @param state
     * The sort state to be set for the column header cell.
     */
    setColumnSortState(thElement: HTMLElement, state: Accessibility.AriaSortState): void;
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
    userFilteredColumn(filteredColumnValues: Accessibility.FilteredColumnValues, filteringApplied: boolean): void;
    /**
     * Adds high contrast CSS class, if the browser is in High Contrast mode.
     */
    addHighContrast(): void;
    /**
     * Set the row index attribute for the row element.
     *
     * @param el
     * The row element to set the index to.
     *
     * @param idx
     * The index of the row in the data table.
     */
    setRowIndex(el: HTMLElement, idx: number): void;
    /**
     * Set a11y options for the Grid.
     */
    setA11yOptions(): void;
    /**
     * Destroy the accessibility controller.
     */
    destroy(): void;
}
declare namespace Accessibility {
    /**
     * The possible states of the aria-sort attribute.
     */
    type AriaSortState = 'ascending' | 'descending' | 'none';
    /**
     * The values of the filtered column.
     */
    type FilteredColumnValues = FilteringCondition & {
        columnId: string;
        rowsCount: number;
    };
}
export default Accessibility;
