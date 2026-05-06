import type TableCell from './TableCell';
import type { ContextMenu as ContextMenuType } from '../../UI/ContextMenu';
import type { ResolvedCellContextMenuItemOptions } from './CellContextMenuBuiltInActions';
import ContextMenu from '../../UI/ContextMenu.js';
import ContextMenuButton from '../../UI/ContextMenuButton.js';
import Grid from '../../Grid.js';
/**
 * Closes the full chain of menus from current submenu to root.
 *
 * @param menu
 * Current menu in the chain.
 */
export declare function closeCellContextMenuTree(menu: ContextMenuType): void;
/**
 * Opens focused branch submenu if available.
 *
 * @param menu
 * Menu instance.
 */
export declare function openFocusedSubMenu(menu: ContextMenuType): void;
/**
 * Renders resolved menu items into a context menu.
 *
 * @param menu
 * Menu to render items into.
 *
 * @param cell
 * Target table cell.
 *
 * @param items
 * Resolved menu items.
 */
export declare function renderResolvedCellContextMenuItems(menu: ContextMenuType, cell: TableCell, items: ResolvedCellContextMenuItemOptions[]): void;
declare class CellContextSubMenu extends ContextMenu {
    /**
     * Cell bound to this submenu chain.
     */
    readonly cell: TableCell;
    /**
     * Resolved submenu items.
     */
    readonly items: ResolvedCellContextMenuItemOptions[];
    /**
     * Branch button that opened this submenu.
     */
    readonly openerButton: ContextMenuButton;
    /**
     * Builds a submenu anchored next to its parent button.
     *
     * @param grid
     * Grid instance.
     *
     * @param button
     * Parent branch button.
     *
     * @param cell
     * Target table cell.
     *
     * @param items
     * Submenu items.
     */
    constructor(grid: Grid, button: ContextMenuButton, cell: TableCell, items: ResolvedCellContextMenuItemOptions[]);
    protected renderContent(): void;
    protected onKeyDown(event: KeyboardEvent): void;
}
export default CellContextSubMenu;
