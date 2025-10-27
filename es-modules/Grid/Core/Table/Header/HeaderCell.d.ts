import type { GroupedHeaderOptions } from '../../Options';
import Cell from '../Cell.js';
import Column from '../Column';
import Row from '../Row';
import TableHeader from './TableHeader.js';
import ColumnToolbar from './ColumnToolbar/ColumnToolbar.js';
/**
 * Represents a cell in the data grid header.
 */
declare class HeaderCell extends Cell {
    /**
     * The HTML element of the header cell content.
     */
    headerContent?: HTMLElement;
    /**
     * The container element of the header cell.
     */
    container?: HTMLDivElement;
    /**
     * List of columns that are subordinated to the header cell.
     */
    readonly columns: Column[];
    /**
     * Content value of the header cell.
     */
    value: string;
    /**
     * The table header that this header cell belongs to.
     */
    tableHeader: TableHeader;
    /**
     * The toolbar of the header cell.
     */
    toolbar?: ColumnToolbar;
    /**
     * Constructs a cell in the data grid header.
     *
     * @param row
     * The row of the cell.
     *
     * @param column
     * The column of the cell.
     *
     * @param columnsTree
     * If the cell is a wider than one column, this property contains the
     * structure of the columns that are subordinated to the header cell.
     */
    constructor(row: Row, column?: Column, columnsTree?: GroupedHeaderOptions[]);
    /**
     * Init element.
     */
    init(): HTMLTableCellElement;
    /**
     * Render the cell container.
     */
    render(): void;
    reflow(): void;
    protected onKeyDown(e: KeyboardEvent): void;
    protected onClick(e: MouseEvent): void;
    /**
     * Add sorting option to the column.
     */
    private initColumnSorting;
    /**
     * Check if the cell is part of the last cell in the header.
     */
    isLastColumn(): boolean;
    destroy(): void;
}
export default HeaderCell;
