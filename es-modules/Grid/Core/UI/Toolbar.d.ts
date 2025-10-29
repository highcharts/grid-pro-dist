import type ToolbarButton from './ToolbarButton.js';
interface Toolbar {
    /**
     * The buttons of the toolbar.
     */
    buttons: ToolbarButton[];
    /**
     * The container element of the toolbar.
     */
    container?: HTMLDivElement;
    /**
     * The index of the focused button in the toolbar.
     */
    focusCursor: number;
}
export default Toolbar;
