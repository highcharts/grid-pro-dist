import type Row from '../../Row.js';
import type Column from '../../Column.js';
import type { GroupedHeaderOptions } from '../../../Options';
import HeaderCell from '../../Header/HeaderCell.js';
/**
 * Represents a cell in the data grid header.
 */
declare class FilterCell extends HeaderCell {
    column: Column;
    constructor(row: Row, column: Column);
    render(): Promise<void>;
    syncColumns(column?: Column, columnsTree?: GroupedHeaderOptions[]): void;
    onKeyDown(e: KeyboardEvent): void;
    onClick(e: MouseEvent): void;
}
export default FilterCell;
