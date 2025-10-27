import type CellRendererType from './CellRendererType';
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
export default CellRenderersComposition;
