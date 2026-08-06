import type { RowId } from '../../../Core/Data/DataProvider';
import type TableCell from '../../../Core/Table/Body/TableCell';
import type TreeProjectionController from '../Projection/TreeProjectionController';
import type { TreeProjectionRowState, TreeProjectionState } from '../TreeViewTypes';
import type { ResolvedTreeViewOptions } from '../TreeViewOptionsNormalizer';
export interface TreeViewCellContext {
    cell: TableCell;
    controller: TreeProjectionController;
    isTreeColumnCell: boolean;
    options: ResolvedTreeViewOptions;
    projectionState: TreeProjectionState;
    rowId: RowId;
    rowState: TreeProjectionRowState;
    treeColumnId: string;
}
/**
 * Resolves shared TreeView context for a rendered table cell.
 *
 * @param cell
 * Rendered table cell.
 *
 * @returns
 * Shared TreeView context, or `undefined` when the cell is not currently
 * associated with a projected tree row.
 */
export declare function getTreeViewCellContext(cell: TableCell): TreeViewCellContext | undefined;
