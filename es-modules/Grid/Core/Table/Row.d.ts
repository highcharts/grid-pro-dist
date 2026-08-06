import type Cell from './Cell';
import type Column from './Column';
import Table from './Table.js';
/**
 * Represents a row in the data grid.
 */
declare abstract class Row {
    /**
     * The cells of the row.
     */
    cells: Cell[];
    /**
     * Cells indexed by column ID.
     */
    private cellsByColumnId;
    /**
     * The HTML element of the row.
     */
    htmlElement: HTMLTableRowElement;
    /**
     * The viewport the row belongs to.
     */
    viewport: Table;
    /**
     * Flag to determine if the row is added to the DOM.
     */
    rendered?: boolean;
    /**
     * Constructs a row in the data grid.
     *
     * @param viewport
     * The Grid Table instance which the row belongs to.
     */
    constructor(viewport: Table);
    /**
     * Creates a cell in the row.
     *
     * @param column
     * The column the cell belongs to.
     */
    abstract createCell(column?: Column): Cell;
    /**
     * Renders the row's content. It does not attach the row element to the
     * viewport nor pushes the rows to the viewport.rows array.
     */
    render(): Promise<void>;
    /**
     * Synchronizes the row cells with the currently rendered columns.
     */
    syncRenderedCells(): Promise<void>;
    /**
     * Reflows the row's content dimensions.
     */
    reflow(): void;
    /**
     * Reflows row-level dimensions and horizontal offset.
     */
    protected reflowPosition(): void;
    /**
     * Destroys the row.
     */
    destroy(): void;
    /**
     * Returns the cell with the given column ID.
     *
     * @param columnId
     * The column ID that the cell belongs to.
     *
     * @returns
     * The cell with the given column ID or undefined if not found.
     */
    getCell(columnId: string): Cell | undefined;
    /**
     * Returns the cell with the given column index.
     *
     * @param columnIndex
     * The global column index.
     *
     * @returns
     * The cell with the given column index or undefined if not found.
     */
    getCellByColumnIndex(columnIndex: number): Cell | undefined;
    /**
     * Inserts a cell only when it is not already at the expected position.
     *
     * @param cell
     * The cell to position.
     *
     * @param index
     * The expected DOM index.
     */
    protected insertCellElement(cell: Cell, index: number): void;
    /**
     * Handles a cell before it is detached from the row.
     *
     * @param cell
     * The cell that is about to be detached.
     */
    protected onCellBeforeDetach(cell: Cell): void;
    /**
     * Registers a cell in the row.
     *
     * @param cell
     * The cell to register.
     */
    registerCell(cell: Cell): void;
    /**
     * Unregister a cell from the row.
     *
     * @param cell
     * The cell to unregister.
     */
    unregisterCell(cell: Cell): void;
}
export default Row;
