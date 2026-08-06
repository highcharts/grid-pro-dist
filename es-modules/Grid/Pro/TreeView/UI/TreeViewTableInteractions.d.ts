import type Table from '../../../Core/Table/Table';
type TreeToggleClickListener = (event: MouseEvent) => void;
type TreeToggleDblClickListener = (event: MouseEvent) => void;
type TreeToggleMouseDownListener = (event: MouseEvent) => void;
type TreeToggleKeyDownListener = (event: KeyboardEvent) => void;
type TreeToggleWheelListener = (event: WheelEvent) => void;
export type TreeToggleListeners = {
    click: TreeToggleClickListener;
    dblClick: TreeToggleDblClickListener;
    mouseDown: TreeToggleMouseDownListener;
    keyDown: TreeToggleKeyDownListener;
    stickyBody: HTMLElement;
    wheel: TreeToggleWheelListener;
};
/**
 * Creates and attaches delegated listeners for tree toggle buttons and
 * keyboard shortcuts.
 *
 * @param table
 * Table viewport instance.
 *
 * @param toggleAttribute
 * Attribute used to identify toggle buttons.
 *
 * @returns
 * Attached listener references.
 */
export declare function createTreeToggleListeners(table: Table, toggleAttribute: string): TreeToggleListeners;
/**
 * Removes delegated tree toggle listeners and destroys sticky row state.
 *
 * @param table
 * Table viewport instance.
 *
 * @param listeners
 * Attached listener references.
 */
export declare function removeTreeToggleListeners(table: Table, listeners: TreeToggleListeners): void;
export {};
