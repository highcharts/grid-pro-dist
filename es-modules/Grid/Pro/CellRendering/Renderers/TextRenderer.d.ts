import type { Column, ColumnDataType } from '../../../Core/Table/Column';
import type TableCell from '../../../Core/Table/Body/TableCell';
import type { EditModeRendererTypeName } from '../../CellEditing/CellEditingComposition';
import { CellRenderer, CellRendererOptions } from '../CellRenderer.js';
import TextContent from '../../../Core/Table/CellContent/TextContent.js';
/**
 * Renderer for the Text in a column..
 */
declare class TextRenderer extends CellRenderer {
    /**
     * The default edit mode renderer type names for this view renderer.
     */
    static defaultEditingRenderer: Record<ColumnDataType, EditModeRendererTypeName>;
    /**
     * Default options for the text renderer.
     */
    static defaultOptions: TextRendererOptions;
    options: TextRendererOptions;
    /**
     * The format to use for the text content.
     */
    format?: string;
    /**
     * Formatter function for the text content.
     */
    formatter?: (this: TableCell) => string;
    constructor(column: Column);
    render(cell: TableCell): TextContent;
}
/**
 * Options to control the text renderer content.
 */
export interface TextRendererOptions extends CellRendererOptions {
    type: 'text';
}
declare module '../CellRendererType' {
    interface CellRendererTypeRegistry {
        text: typeof TextRenderer;
    }
}
export default TextRenderer;
