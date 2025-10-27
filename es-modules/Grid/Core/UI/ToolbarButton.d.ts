import type Toolbar from './Toolbar';
import type Button from './Button';
import type Popup from './Popup';
import SvgIcons from './SvgIcons.js';
import Globals from '../Globals.js';
declare class ToolbarButton implements Button {
    /**
     * The wrapper element for the button.
     */
    wrapper?: HTMLSpanElement;
    /**
     * The toolbar that the button belongs to.
     */
    toolbar?: Toolbar;
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
     * The options for the toolbar button.
     */
    private options;
    /**
     * The default icon for the toolbar button.
     */
    private icon?;
    /**
     * The button element.
     */
    private buttonEl?;
    /**
     * The active indicator for the button.
     */
    private activeIndicator?;
    constructor(options: ToolbarButton.Options);
    /**
     * Adds the button to the toolbar.
     *
     * @param toolbar
     * The toolbar to add the button to.
     */
    add(toolbar: Toolbar): this;
    focus(): void;
    /**
     * Sets the icon for the button.
     *
     * @param icon
     * The icon to set.
     */
    setIcon(icon: SvgIcons.GridIconName): void;
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
     * Renders the active indicator for the button.
     *
     * @param render
     * Whether the active indicator should be rendered.
     */
    protected renderActiveIndicator(render: boolean): void;
    /**
     * Adds event listeners to the button.
     */
    protected addEventListeners(): void;
    /**
     * Removes event listeners from the button.
     */
    private removeEventListeners;
}
declare namespace ToolbarButton {
    /**
     * Options for the toolbar button.
     */
    interface Options {
        /**
         * The icon for the button.
         */
        icon: SvgIcons.GridIconName;
        /**
         * The class name key for the button.
         */
        classNameKey?: Globals.ClassNameKey;
        /**
         * The tooltip string for the button.
         */
        tooltip?: string;
        /**
         * Whether the button should be always visible.
         */
        alwaysVisible?: boolean;
        /**
         * The click handler for the button.
         */
        onClick?: (event: MouseEvent, button: ToolbarButton) => void;
    }
}
export default ToolbarButton;
