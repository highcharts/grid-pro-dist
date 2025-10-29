import type Table from '../../Table.js';
import type Column from '../../Column.js';
import FilterCell from './FilterCell.js';
import HeaderRow from '../../Header/HeaderRow.js';
/**
 * Represents a special filtering row in the data grid header.
 */
declare class FilterRow extends HeaderRow {
    /**
     * Constructs a filtering row in the Grid's header.
     *
     * @param viewport
     * The Grid Table instance which the row belongs to.
     */
    constructor(viewport: Table);
    createCell(column: Column): FilterCell;
    renderContent(): void;
}
export default FilterRow;
