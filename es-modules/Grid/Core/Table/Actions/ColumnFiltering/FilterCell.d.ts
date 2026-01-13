import type Row from '../../Row.js';
import type Column from '../../Column.js';
import HeaderCell from '../../Header/HeaderCell.js';
/**
 * Represents a cell in the data grid header.
 */
declare class FilterCell extends HeaderCell {
    column: Column;
    constructor(row: Row, column: Column);
    render(): void;
    onKeyDown(e: KeyboardEvent): void;
    onClick(e: MouseEvent): void;
}
export default FilterCell;
