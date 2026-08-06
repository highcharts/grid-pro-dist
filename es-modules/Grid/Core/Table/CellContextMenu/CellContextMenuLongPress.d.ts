import type TableCell from '../Body/TableCell';
export interface CellContextMenuLongPressHost {
    getTableCellFromTarget(target: EventTarget | null): TableCell | undefined;
    openCellContextMenu(cell: TableCell, clientX: number, clientY: number): boolean;
    isCellInEditMode(cell: TableCell): boolean;
}
/**
 * iOS long-press polyfill for cell context menus.
 */
export declare class CellContextMenuLongPress {
    private readonly host;
    private state?;
    private eventsTarget?;
    constructor(host: CellContextMenuLongPressHost);
    addEvents(target: HTMLElement): void;
    removeEvents(): void;
    private readonly onTouchStart;
    private readonly onTouchMove;
    private readonly onTouchEnd;
    private cancelLongPress;
}
