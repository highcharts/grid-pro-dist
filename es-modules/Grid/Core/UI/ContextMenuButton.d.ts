import type ContextMenu from './ContextMenu';
import type Button from './Button';
import type Popup from './Popup';
import SvgIcons from './SvgIcons.js';
import Globals from '../Globals.js';
declare class ContextMenuButton implements Button {
    /**
     * The wrapper `<li>` element for the button.
     */
    wrapper?: HTMLLIElement;
    /**
     * The context menu that the button belongs to.
     */
    contextMenu?: ContextMenu;
    popup?: Popup;
    /**
     * Used to remove the event listeners when the button is destroyed.
     */
    protected eventListenerDestroyers: Function[];
    /**
     * Whether the button is active.
     */
    protected isActive: boolean;
    /**
     * The options for the context menu button.
     */
    protected options: ContextMenuButton.Options;
    /**
     * The container for the icon element.
     */
    private iconWrapper?;
    /**
     * The default icon for the context menu button.
     */
    private icon?;
    /**
     * The button element.
     */
    private buttonEl?;
    /**
     * The span element for the label.
     */
    private spanEl?;
    constructor(options: ContextMenuButton.Options);
    /**
     * Adds the button to the context menu.
     *
     * @param contextMenu
     * The context menu to add the button to.
     */
    add(contextMenu: ContextMenu): this | undefined;
    focus(): void;
    setLabel(label: string): void;
    /**
     * Sets the icon for the button.
     *
     * @param icon
     * The icon to set.
     */
    setIcon(icon?: SvgIcons.GridIconName): void;
    setActive(active: boolean): void;
    setHighlighted(highlighted: boolean): void;
    /**
     * Destroys the button.
     */
    destroy(): void;
    /**
     * Initializes the state of the button.
     */
    protected refreshState(): void;
    /**
     * Handles the click event for the button.
     *
     * @param event
     * The mouse event.
     */
    protected clickHandler(event: MouseEvent): void;
    /**
     * Adds event listeners to the button.
     */
    protected addEventListeners(): void;
    /**
     * Removes event listeners from the button.
     */
    private removeEventListeners;
}
declare namespace ContextMenuButton {
    /**
     * Options for the context menu button.
     */
    interface Options {
        /**
         * The label for the button.
         */
        label?: string;
        /**
         * The icon for the button.
         */
        icon?: SvgIcons.GridIconName;
        /**
         * A class name key applied to the `<li>` wrapper of the button.
         */
        classNameKey?: Globals.ClassNameKey;
        /**
         * The icon for the active state of the button.
         */
        activeIcon?: SvgIcons.GridIconName;
        /**
         * The icon for the highlighted state of the button.
         */
        highlightedIcon?: SvgIcons.GridIconName;
        /**
         * The tooltip string for the button.
         */
        tooltip?: string;
        /**
         * If the chevron icon should be rendered.
         */
        chevron?: boolean;
        /**
         * The click handler for the button.
         */
        onClick?: (event: MouseEvent, button: ContextMenuButton) => void;
    }
}
export default ContextMenuButton;
