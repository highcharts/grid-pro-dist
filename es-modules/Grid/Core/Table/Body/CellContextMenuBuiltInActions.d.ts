import type TableCell from './TableCell';
import type { CellContextMenuActionId, CellContextMenuDividerItemOptions } from '../../Options';
import type { GridIconName } from '../../UI/SvgIcons';
export declare const defaultBuiltInCellContextMenuActions: CellContextMenuActionId[];
export interface ResolvedCellContextMenuActionItemOptions {
    label: string;
    icon?: string;
    disabled?: boolean;
    onClick?: (this: TableCell, cell: TableCell) => void;
    items?: ResolvedCellContextMenuItemOptions[];
}
export type ResolvedCellContextMenuItemOptions = CellContextMenuDividerItemOptions | ResolvedCellContextMenuActionItemOptions;
export interface BuiltInActionDefinition {
    getLabel: (cell: TableCell) => string;
    icon: GridIconName;
    isVisible?: (cell: TableCell, rowId: string | number | undefined) => boolean;
    isDisabled: (cell: TableCell, rowId: string | number | undefined) => boolean;
    onClick: (cell: TableCell, rowId: string | number) => void;
}
/**
 * Registers one built-in context menu action.
 *
 * @param actionId
 * Built-in action identifier.
 *
 * @param definition
 * Action behavior definition.
 *
 * @param useByDefault
 * Whether the action should be added to the default menu set.
 */
export declare function registerBuiltInAction(actionId: CellContextMenuActionId, definition: BuiltInActionDefinition, useByDefault?: boolean): void;
/**
 * Resolves context menu items, including built-in action declarations.
 *
 * @param cell
 * Table cell for the context menu.
 *
 * @return
 * Resolved context menu items.
 */
export declare function resolveCellContextMenuItems(cell: TableCell): ResolvedCellContextMenuItemOptions[];
/**
 * Built-in cell context menu action helpers.
 */
declare const _default: {
    readonly defaultBuiltInCellContextMenuActions: CellContextMenuActionId[];
    readonly registerBuiltInAction: typeof registerBuiltInAction;
    readonly resolveCellContextMenuItems: typeof resolveCellContextMenuItems;
};
export default _default;
