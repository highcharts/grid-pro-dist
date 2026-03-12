import type Grid from '../Grid';
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
    /**
     * Optional reference to the Grid instance (e.g. for icon registry).
     */
    grid?: Grid;
}
export default Toolbar;
