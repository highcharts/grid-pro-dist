import type Table from '../Table';
import ResizingMode from './ResizingMode.js';
import AdjacentResizingMode from './AdjacentResizingMode.js';
import IndependentResizingMode from './IndependentResizingMode.js';
import DistributedResizingMode from './DistributedResizingMode.js';
declare namespace ColumnResizing {
    /**
     * Abstract class representing a column resizing mode.
     */
    const AbstractStrategy: typeof ResizingMode;
    /**
     * Registry of column resizing modes.
     */
    const types: {
        adjacent: typeof AdjacentResizingMode;
        distributed: typeof DistributedResizingMode;
        independent: typeof IndependentResizingMode;
    };
    type ModeType = keyof typeof types;
    /**
     * Creates a new column resizing mode instance based on the
     * viewport's options.
     *
     * @param viewport
     * The table that the column resizing mode is applied to.
     *
     * @returns
     * The proper column resizing mode.
     */
    function initMode(viewport: Table): ResizingMode;
}
export default ColumnResizing;
