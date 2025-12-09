import type Table from '../Table';
import ResizingMode from './ResizingMode.js';
import AdjacentResizingMode from './AdjacentResizingMode.js';
import IndependentResizingMode from './IndependentResizingMode.js';
import DistributedResizingMode from './DistributedResizingMode.js';
export type ColumnResizingMode = keyof typeof types;
/**
 * Abstract class representing a column resizing mode.
 */
export declare const AbstractStrategy: typeof ResizingMode;
/**
 * Registry of column resizing modes.
 */
export declare const types: {
    adjacent: typeof AdjacentResizingMode;
    distributed: typeof DistributedResizingMode;
    independent: typeof IndependentResizingMode;
};
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
export declare function initMode(viewport: Table): ResizingMode;
declare const _default: {
    readonly initMode: typeof initMode;
    readonly types: {
        adjacent: typeof AdjacentResizingMode;
        distributed: typeof DistributedResizingMode;
        independent: typeof IndependentResizingMode;
    };
    readonly AbstractStrategy: typeof ResizingMode;
};
export default _default;
