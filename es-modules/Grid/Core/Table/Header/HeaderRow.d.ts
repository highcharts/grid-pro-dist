import type { GroupedHeaderOptions } from '../../Options';
import Table from '../Table.js';
import Row from '../Row.js';
import HeaderCell from './HeaderCell.js';
import Column from '../Column.js';
/**
 * Represents a row in the data grid header.
 */
declare class HeaderRow extends Row {
    /**
     * The level in the header.
     */
    level: number;
    /**
     * Constructs a row in the data grid.
     *
     * @param viewport
     * The Grid Table instance which the row belongs to.
     *
     * @param level
     * The current level of header that is rendered.
     */
    constructor(viewport: Table, level: number);
    createCell(column?: Column, columnsTree?: GroupedHeaderOptions[]): HeaderCell;
    reflow(): void;
    /**
     * Sets a specific class to the last cell in the row.
     */
    protected setLastCellClass(): void;
    /**
     * Get all headers that should be rendered in a level.
     *
     * @param scope
     * Level that we start from
     *
     * @param targetLevel
     * Max level
     *
     * @param currentLevel
     * Current level
     *
     * @return
     * Array of headers that should be rendered in a level
     */
    private getColumnsAtLevel;
    /**
     * Sets the row HTML element attributes and additional classes.
     */
    private setRowAttributes;
}
export default HeaderRow;
