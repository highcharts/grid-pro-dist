import type TableCell from '../../../Core/Table/Body/TableCell';
/**
 * Flags aggregated cells and decorates rendered tree cells.
 *
 * @param cell
 * Rendered table cell.
 *
 * @param toggleAttribute
 * Attribute used to mark the toggle button for delegated listeners.
 */
export declare function decorateTreeViewCell(cell: TableCell, toggleAttribute: string): void;
