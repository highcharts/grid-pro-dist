import type { CellType as DataTableCellType } from '../../../Data/DataTable';
import type Grid from '../Grid';
import type { ColumnSortingOrder } from '../Options';
export interface GridSortingState {
    columnId?: string;
    order: ColumnSortingOrder;
}
export interface ResolvedGridSorting {
    columnId: string;
    compare: (a: DataTableCellType, b: DataTableCellType) => number;
    customCompare?: (a: DataTableCellType, b: DataTableCellType) => number;
    order: 'asc' | 'desc';
    sourceColumnId: string;
}
/**
 * Creates a compare function consistent with the standard SortModifier.
 *
 * @param direction
 * Sorting direction.
 *
 * @param customCompare
 * Optional custom column compare override.
 */
export declare function createGridSortCompare(direction: 'asc' | 'desc', customCompare?: (a: DataTableCellType, b: DataTableCellType) => number): ((a: DataTableCellType, b: DataTableCellType) => number);
/**
 * Resolves active grid sorting descriptors to source columns and effective
 * compare functions.
 *
 * @param grid
 * Grid instance providing column policy and defaults.
 *
 * @param currentSortings
 * Current multi-column sorting state.
 *
 * @param currentSorting
 * Current single-column sorting state fallback.
 */
export declare function resolveActiveGridSortings(grid: Grid, currentSortings?: GridSortingState[], currentSorting?: GridSortingState): ResolvedGridSorting[];
