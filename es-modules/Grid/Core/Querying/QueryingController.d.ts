import type DataModifier from '../../../Data/Modifiers/DataModifier.js';
import type Grid from '../Grid.js';
import SortingController from './SortingController.js';
import FilteringController from './FilteringController.js';
import PaginationController from './PaginationController.js';
/**
 * Class that manage data modification of the visible data in the data grid.
 * It manages the modifiers that are applied to the data table.
 */
declare class QueryingController {
    /**
     * The data grid instance.
     */
    grid: Grid;
    /**
     * Sorting controller instance.
     */
    sorting: SortingController;
    /**
     * Filtering controller instance.
     */
    filtering: FilteringController;
    /**
     * Pagination controller instance
     */
    pagination: PaginationController;
    /**
     * This flag should be set to `true` if the modifiers should reapply to the
     * data table due to some data change or other important reason.
     */
    shouldBeUpdated: boolean;
    constructor(grid: Grid);
    /**
     * Proceeds with the data modification if needed.
     *
     * @param force
     * If the data should be modified even if the significant options are not
     * changed.
     */
    proceed(force?: boolean): Promise<void>;
    /**
     * Load all options needed to generate the modifiers.
     */
    loadOptions(): void;
    /**
     * Whether the query leaves the data table untouched, so that a cell edit
     * does not need a requery.
     */
    willNotModify(): boolean;
    /**
     * Returns a list of modifiers that should be applied to the data table.
     *
     * Features can contribute their own modifiers through the
     * `getGroupedModifiers` event. Those run first, so that sorting and
     * filtering see the columns they produce.
     */
    getGroupedModifiers(): DataModifier[];
    /**
     * Apply all modifiers to the data provider.
     */
    private modifyData;
}
export default QueryingController;
