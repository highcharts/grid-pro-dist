import type Column from '../../../Core/Table/Column';
import type TableCell from '../../../Core/Table/Body/TableCell';
import type { EditModeRenderer } from '../../CellEditing/CellEditMode';
import type { EditModeRendererTypeName } from '../../CellEditing/CellEditingComposition';
import { CellRenderer, CellRendererOptions } from '../CellRenderer.js';
import NumberInputContent from '../ContentTypes/NumberInputContent.js';
/**
 * Renderer for the Select in a column..
 */
declare class NumberInputRenderer extends CellRenderer implements EditModeRenderer {
    /**
     * The default edit mode renderer type name for this view renderer.
     */
    static defaultEditingRenderer: EditModeRendererTypeName;
    /**
     * Default options for the date input renderer.
     */
    static defaultOptions: NumberInputRendererOptions;
    options: NumberInputRendererOptions;
    constructor(column: Column, options: Partial<CellRendererOptions>);
    render(cell: TableCell, parentElement?: HTMLElement): NumberInputContent;
}
/**
 * Options to control the number input renderer content.
 */
export interface NumberInputRendererOptions extends CellRendererOptions {
    /**
     * Use the built-in number input renderer.
     *
     * @default 'numberInput'
     */
    type: 'numberInput';
    /**
     * Whether the number input is disabled.
     */
    disabled?: boolean;
    /**
     * Attributes to control the number input.
     */
    attributes?: NumberInputAttributes;
}
/**
 * Attributes to control the number input.
 */
export interface NumberInputAttributes {
    /**
     * Minimum accepted numeric value.
     */
    min?: number;
    /**
     * Maximum accepted numeric value.
     */
    max?: number;
    /**
     * Step interval used by the number input controls.
     */
    step?: number;
}
declare module '../CellRendererType' {
    interface CellRendererTypeRegistry {
        numberInput: typeof NumberInputRenderer;
    }
}
export default NumberInputRenderer;
