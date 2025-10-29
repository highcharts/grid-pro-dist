import type Toolbar from '../../../UI/Toolbar';
import type Column from '../../Column';
import ToolbarButton from '../../../UI/ToolbarButton.js';
declare class HeaderCellToolbar implements Toolbar {
    /**
     * The maximum width of the column to be minimized.
     */
    static MINIMIZED_COLUMN_WIDTH: number;
    /**
     * The column that this toolbar belongs to.
     */
    column: Column;
    buttons: ToolbarButton[];
    container?: HTMLDivElement;
    focusCursor: number;
    /**
     * Whether the toolbar is minimized. If true, the toolbar will only show
     * the context menu button.
     */
    private isMinimized?;
    /**
     * Whether the menu button is centered. Used when the header content is
     * super thin, so that it's not visible.
     */
    private isMenuCentered?;
    /**
     * The resize observer of the column.
     */
    private columnResizeObserver?;
    /**
     * The event listener destroyers of the toolbar.
     */
    private eventListenerDestroyers;
    constructor(column: Column);
    /**
     * Initializes the buttons of the toolbar.
     */
    private renderFull;
    private renderMinimized;
    /**
     * Render the toolbar.
     */
    add(): void;
    /**
     * Destroys all buttons of the toolbar.
     */
    clearButtons(): void;
    /**
     * Reflows the toolbar. It is called when the column is resized.
     */
    reflow(): void;
    /**
     * Destroy the toolbar.
     */
    destroy(): void;
    /**
     * Focuses the first button of the toolbar.
     */
    focus(): void;
    /**
     * Handles the key down event on the toolbar.
     *
     * @param e
     * Keyboard event object.
     */
    private keyDownHandler;
}
export default HeaderCellToolbar;
