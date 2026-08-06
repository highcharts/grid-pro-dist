import type DataTable from '../../../../Data/DataTable';
import type { CellType as DataTableCellType } from '../../../../Data/DataTable';
import type { RowId } from '../../../Core/Data/DataProvider';
import type { TreeProjectionState, TreeViewColumnAggregatorOption } from '../TreeViewTypes';
interface TreeAggregationResolverDependencies {
    getColumnAggregatorOption: (sourceColumnId: string) => (TreeViewColumnAggregatorOption | undefined);
    resolveProjectedCellValue: (columnId: string, rowId: RowId, table: DataTable, projectionState: TreeProjectionState, idColumn?: string) => DataTableCellType;
}
declare class TreeAggregationResolver {
    private readonly dependencies;
    constructor(dependencies: TreeAggregationResolverDependencies);
    /**
     * Returns whether a source column participates in TreeView aggregation.
     *
     * @param columnId
     * Source column id.
     */
    hasColumnAggregation(columnId: string): boolean;
    /**
     * Resolves projected values for a single aggregated column.
     *
     * Aggregation is evaluated on the projected tree after filtering/sorting,
     * but before pagination and independently of expand/collapse visibility.
     *
     * @param columnId
     * Aggregated source column id.
     *
     * @param table
     * Queried table after filtering/sorting and before pagination.
     *
     * @param projectionState
     * Current projected tree state.
     *
     * @param derivedCellColumnIdsByRowId
     * Mutable map collecting derived cells for the projected state.
     *
     * @param idColumn
     * Column containing stable row IDs, when configured.
     */
    resolveColumnValues(columnId: string, table: DataTable, projectionState: TreeProjectionState, derivedCellColumnIdsByRowId: Map<RowId, Set<string>>, idColumn?: string): Map<RowId, DataTableCellType>;
    /**
     * Marks a projected cell as derived from TreeView aggregation.
     *
     * @param derivedCellColumnIdsByRowId
     * Mutable map collecting derived cells for the projected state.
     *
     * @param rowId
     * Derived row id.
     *
     * @param columnId
     * Derived source column id.
     */
    private markDerivedCell;
    /**
     * Resolves aggregation function name for a row/column combination.
     *
     * @param columnId
     * Aggregated source column id.
     *
     * @param rowState
     * Projected row state for the current row.
     *
     * @param sourceValue
     * Source cell value before aggregation.
     */
    private resolveAggregatorFunctionName;
    /**
     * Executes a registered Formula processor function on direct child values.
     *
     * @param functionName
     * Registered Formula processor function name.
     *
     * @param childValues
     * Direct child values after their own aggregation has been resolved.
     */
    private executeAggregateFunction;
}
export default TreeAggregationResolver;
