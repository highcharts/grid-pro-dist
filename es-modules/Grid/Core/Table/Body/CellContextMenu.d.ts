import type TableCell from './TableCell';
import ContextMenu from '../../UI/ContextMenu.js';
declare class CellContextMenu extends ContextMenu {
    cell?: TableCell;
    private cursorAnchorElement?;
    private removeCellOutdateListener?;
    showAt(cell: TableCell, clientX: number, clientY: number): void;
    hide(): void;
    protected renderContent(): void;
}
export default CellContextMenu;
