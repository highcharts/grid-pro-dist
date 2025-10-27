import type Grid from '../Grid';
import type Button from './Button';
/**
 * Abstract base class for for Grid popups.
 */
declare abstract class Popup {
    /**
     * The popup container element.
     */
    container?: HTMLElement;
    /**
     * The popup content element.
     */
    content?: HTMLElement;
    /**
     * Parent element of the popup.
     */
    grid: Grid;
    /**
     * Whether the popup is currently visible.
     */
    isVisible: boolean;
    /**
     * The anchor element that the popup is positioned relative to.
     */
    anchorElement?: HTMLElement;
    /**
     * The button that opened the popup, if any.
     */
    protected button?: Button;
    /**
     * Event listener destroyers.
     */
    protected eventListenerDestroyers: Function[];
    /**
     * Options for the popup.
     */
    private options;
    /**
     * Constructs a popup for the given grid.
     *
     * @param grid
     * The grid that will own this popup.
     *
     * @param button
     * The button that opened the popup, if any.
     *
     * @param options
     * Popup options.
     */
    constructor(grid: Grid, button?: Button, options?: Popup.Options);
    /**
     * Renders the popup content.
     *
     * @param contentElement
     * The content element.
     */
    protected abstract renderContent(contentElement: HTMLElement): void;
    /**
     * Shows the popup positioned relative to the anchor element.
     *
     * @param anchorElement
     * The element to position the popup relative to.
     */
    show(anchorElement?: HTMLElement): void;
    /**
     * Hides the popup. In reality, it just destroys the popup container and
     * removes the event listeners.
     */
    hide(): void;
    /**
     * Toggles the popup visibility.
     *
     * @param anchorElement
     * The element to position the popup relative to. If not provided, the popup
     * will be positioned relative to the parent element.
     */
    toggle(anchorElement?: HTMLElement): void;
    /**
     * Reflows the popup.
     */
    reflow(): void;
    /**
     * Positions the popup relative to the anchor element.
     *
     * @param anchorElement
     * The element to position relative to. If not provided, the popup will be
     * positioned relative to the parent element.
     */
    private position;
    /**
     * Adds a header to the context menu.
     *
     * @param label
     * The label shown in the header of the context menu.
     *
     * @param category
     * The category shown in the header of the context menu, before the label.
     *
     * @returns
     * The header element.
     */
    protected addHeader(label: string, category?: string): HTMLElement | undefined;
    /**
     * Handles key down events.
     *
     * @param e
     * Keyboard event
     */
    protected onKeyDown(e: KeyboardEvent): void;
    /**
     * Handles click outside events.
     *
     * @param e
     * Mouse event
     */
    protected onClickOutside(e: MouseEvent): void;
    /**
     * Adds event listeners for click outside and escape key.
     */
    protected addEventListeners(): void;
    /**
     * Removes event listeners.
     */
    private removeEventListeners;
}
declare namespace Popup {
    interface Options {
        /**
         * Whether to position the popup next to the anchor element (`true`), or
         * directly below it (`false`). Defaults to `false`.
         */
        nextToAnchor?: boolean;
        /**
         * The header of the popup.
         */
        header?: {
            /**
             * The prefix of the header label, placed before the label.
             */
            category?: string;
            /**
             * The label of the header.
             */
            label: string;
        };
    }
}
export default Popup;
