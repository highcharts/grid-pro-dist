import type { ColumnDataType } from '../Column';
import CellContent from './CellContent.js';
import TableCell from '../Body/TableCell';
/**
 * Represents a text type of content.
 */
declare class TextContent extends CellContent {
    static readonly defaultFormatsForDataTypes: Record<ColumnDataType, string>;
    constructor(cell: TableCell);
    protected add(): void;
    destroy(): void;
    update(): void;
}
export default TextContent;
