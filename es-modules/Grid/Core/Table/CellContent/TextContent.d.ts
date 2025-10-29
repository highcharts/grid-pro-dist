import type Column from '../Column';
import CellContent from './CellContent.js';
import TableCell from '../Body/TableCell';
/**
 * Represents a text type of content.
 */
declare class TextContent extends CellContent {
    constructor(cell: TableCell);
    protected add(): void;
    destroy(): void;
    update(): void;
}
declare namespace TextContent {
    /**
     * Default formats for data types.
     */
    const defaultFormatsForDataTypes: Record<Column.DataType, string>;
}
export default TextContent;
