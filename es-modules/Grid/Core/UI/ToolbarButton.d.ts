import type Toolbar from './Toolbar';
import type Button from './Button';
import type Popup from './Popup';
import { ClassNameKey } from '../Globals.js';
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
    constructor(options: ToolbarButtonOptions);
    /**
     * Adds the button to the toolbar.
     *
     * @param toolbar
     * The toolbar to add the button to.
     */
    add(toolbar: Toolbar): this;
    setA11yAttributes(button: HTMLButtonElement): void;
    focus(): void;
    /**
     * Sets the icon for the button.
     *
     * @param icon
     * The icon to set (built-in name or custom name from rendering.icons).
     */
    setIcon(icon: string): void;
    setActive(active: boolean): void;
    setHighlighted(highlighted: boolean): void;
    /**
     * Destroys the button.
     */
    destroy(): void;
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
/**
 * Options for the toolbar button.
 */
export interface ToolbarButtonOptions {
    /**
     * The icon for the button (built-in name or custom from rendering.icons).
     */
    icon: string;
    /**
     * The class name key for the button.
     */
    classNameKey?: ClassNameKey;
    /**
     * The tooltip string for the button.
     */
    tooltip?: string;
    /**
     * Whether the button should be always visible.
     */
    alwaysVisible?: boolean;
    /**
     * The accessibility options for the button.
     */
    accessibility?: ToolbarButtonA11yOptions;
    /**
     * The click handler for the button.
     */
    onClick?: (event: MouseEvent, button: ToolbarButton) => void;
}
export interface ToolbarButtonA11yOptions {
    /**
     * The aria label attribute for the button.
     */
    ariaLabel?: string;
    /**
     * The aria expanded attribute for the button.
     */
    ariaExpanded?: boolean;
    /**
     * The aria controls attribute for the button.
     */
    ariaControls?: string;
}
export default ToolbarButton;
