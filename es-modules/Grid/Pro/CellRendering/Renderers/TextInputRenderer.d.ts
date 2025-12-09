import type Column from '../../../Core/Table/Column';
import type TableCell from '../../../Core/Table/Body/TableCell';
import { EditModeRenderer } from '../../CellEditing/CellEditMode';
import type { EditModeRendererTypeName } from '../../CellEditing/CellEditingComposition';
import { CellRenderer, CellRendererOptions } from '../CellRenderer.js';
import TextInputContent from '../ContentTypes/TextInputContent.js';
/**
 * Renderer for the Select in a column..
 */
declare class TextInputRenderer extends CellRenderer implements EditModeRenderer {
    /**
     * The default edit mode renderer type names for this view renderer.
     */
    static defaultEditingRenderer: EditModeRendererTypeName;
    /**
     * Default options for the text input renderer.
     */
    static defaultOptions: TextInputRendererOptions;
    options: TextInputRendererOptions;
    constructor(column: Column, options: Partial<CellRendererOptions>);
    render(cell: TableCell, parentElement?: HTMLElement): TextInputContent;
}
/**
 * Options to control the text input renderer content.
 */
export interface TextInputRendererOptions extends CellRendererOptions {
    type: 'textInput';
    /**
     * Whether the text input is disabled.
     */
    disabled?: boolean;
    /**
     * Attributes to control the text input.
     */
    attributes?: TextInputAttributes;
}
/**
 * Attributes to control the text input.
 */
export interface TextInputAttributes {
    minlength?: number;
    maxlength?: number;
    pattern?: string;
    placeholder?: string;
    size?: number;
}
declare module '../CellRendererType' {
    interface CellRendererTypeRegistry {
        textInput: typeof TextInputRenderer;
    }
}
export default TextInputRenderer;
