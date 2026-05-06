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
    /**
     * Use the built-in text input renderer.
     *
     * @default 'textInput'
     */
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
    /**
     * Minimum number of characters allowed in the input.
     */
    minlength?: number;
    /**
     * Maximum number of characters allowed in the input.
     */
    maxlength?: number;
    /**
     * Regular expression pattern used for native input validation.
     */
    pattern?: string;
    /**
     * Placeholder text shown when the input is empty.
     */
    placeholder?: string;
    /**
     * Visible width of the input in characters.
     */
    size?: number;
}
declare module '../CellRendererType' {
    interface CellRendererTypeRegistry {
        textInput: typeof TextInputRenderer;
    }
}
export default TextInputRenderer;
