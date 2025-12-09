import Popup from './Popup.js';
import ContextMenuButton from './ContextMenuButton.js';
/**
 * The context menu.
 */
export declare abstract class ContextMenu extends Popup {
    /**
     * The array of buttons in the context menu.
     */
    readonly buttons: ContextMenuButton[];
    /**
     * The index of the focused button in the context menu.
     */
    focusCursor: number;
    /**
     * The items container element.
     */
    private itemsContainer?;
    /**
     * Ensures that the items container element is created.
     *
     * @returns
     * The items container element.
     */
    ensureItemsContainer(): HTMLElement | undefined;
    show(anchorElement?: HTMLElement): void;
    hide(): void;
    /**
     * Adds a divider to the context menu.
     *
     * @returns
     * The divider element.
     */
    protected addDivider(): HTMLElement | undefined;
    protected onClickOutside(event: MouseEvent): void;
    protected onKeyDown(e: KeyboardEvent): void;
}
export default ContextMenu;
