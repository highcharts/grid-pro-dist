import type Column from '../../Core/Table/Column';
import type CellRendererType from './CellRendererType';
/**
 * Extends the grid classes with cell editing functionality.
 *
 * @param ColumnClass
 * The class to extend.
 */
export declare function compose(ColumnClass: typeof Column): void;
declare module '../../Core/Options' {
    interface ColumnCellOptions {
        /**
         * Options to control the cell content rendering.
         */
        renderer?: CellRendererType['options'];
    }
}
declare module '../../Core/Table/Column' {
    export default interface Column {
        /**
         * The cell view renderer instance for the column.
         */
        cellRenderer: CellRendererType;
    }
}
declare const _default: {
    readonly compose: typeof compose;
};
export default _default;
