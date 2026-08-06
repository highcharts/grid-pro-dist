import type TableCell from '../Body/TableCell';
import type Grid from '../../Grid';
import type { RowId } from '../../Data/DataProvider';
import type { CellContextMenuActionId, CellContextMenuDividerItemOptions, CellContextMenuGroupId } from './CellContextMenuOptions';
import type { GridIconName } from '../../UI/SvgIcons';
export interface CellContextMenuContext {
    cell: TableCell;
    columnId: string;
    grid: Grid;
    rowId?: RowId;
    sourceColumnId?: string;
}
export interface ResolvedCellContextMenuActionItemOptions {
    label: string;
    icon?: string;
    disabled?: boolean;
    onClick?: (this: TableCell, cell: TableCell) => void;
    items?: ResolvedCellContextMenuItemOptions[];
}
export type ResolvedCellContextMenuItemOptions = CellContextMenuDividerItemOptions | ResolvedCellContextMenuActionItemOptions;
export interface BuiltInActionDefinition {
    getLabel: (context: CellContextMenuContext) => string;
    icon: GridIconName;
    isVisible?: (context: CellContextMenuContext) => boolean;
    isDisabled?: (context: CellContextMenuContext) => boolean;
    onClick: (context: CellContextMenuContext) => void;
}
export interface BuiltInGroupDefinition {
    getLabel?: (context: CellContextMenuContext) => string;
    icon?: string;
    isVisible?: (context: CellContextMenuContext) => boolean;
    items: CellContextMenuActionId[];
}
/**
 * Registers one built-in context menu action.
 *
 * @param actionId
 * Built-in action identifier.
 *
 * @param definition
 * Action behavior definition.
 */
export declare function registerBuiltInAction(actionId: CellContextMenuActionId, definition: BuiltInActionDefinition): void;
/**
 * Registers one built-in context menu group.
 *
 * @param groupId
 * Built-in group identifier.
 *
 * @param definition
 * Group definition.
 *
 * @param useByDefault
 * Whether the group should be included in the default menu.
 */
export declare function registerBuiltInGroup(groupId: CellContextMenuGroupId, definition: BuiltInGroupDefinition, useByDefault?: boolean): void;
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
    readonly registerBuiltInAction: typeof registerBuiltInAction;
    readonly registerBuiltInGroup: typeof registerBuiltInGroup;
    readonly resolveCellContextMenuItems: typeof resolveCellContextMenuItems;
};
export default _default;
