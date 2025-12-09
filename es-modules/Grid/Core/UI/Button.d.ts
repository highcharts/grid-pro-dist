import type Popup from './Popup.js';
/**
 * Basic interface for buttons used in Grid components, like `ContextMenu` or
 * `Toolbar`.
 * @private
 */
export interface Button {
    /**
     * Focuses the button.
     */
    focus(): void;
    /**
     * Sets the highlighted state of the button.
     *
     * @param highlighted
     * Whether the button should be highlighted.
     */
    setHighlighted(highlighted: boolean): void;
    /**
     * Sets the active state of the button.
     *
     * @param active
     * Whether the button should be active.
     */
    setActive(active: boolean): void;
    /**
     * The popup associated with the button, if any.
     */
    popup?: Popup;
}
export default Button;
