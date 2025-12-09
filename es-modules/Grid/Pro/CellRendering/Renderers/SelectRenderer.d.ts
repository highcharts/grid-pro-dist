import type Column from '../../../Core/Table/Column';
import type TableCell from '../../../Core/Table/Body/TableCell';
import type { EditModeRenderer } from '../../CellEditing/CellEditMode';
import type { EditModeRendererTypeName } from '../../CellEditing/CellEditingComposition';
import { CellRenderer, CellRendererOptions } from '../CellRenderer.js';
import SelectContent from '../ContentTypes/SelectContent.js';
/**
 * Renderer for the Select in a column..
 */
declare class SelectRenderer extends CellRenderer implements EditModeRenderer {
    /**
     * The default edit mode renderer type name for this view renderer.
     */
    static defaultEditingRenderer: EditModeRendererTypeName;
    /**
     * Default options for the select renderer.
     */
    static defaultOptions: SelectRendererOptions;
    options: SelectRendererOptions;
    constructor(column: Column, options: Partial<CellRendererOptions>);
    render(cell: TableCell, parentElement?: HTMLElement): SelectContent;
}
/**
 * Options to define a single select option.
 */
export interface SelectOption {
    /**
     * The value of the option.
     */
    value: string;
    /**
     * The label of the option.
     */
    label?: string;
    /**
     * Whether the option is disabled. If true, the option cannot be
     * selected.
     */
    disabled?: boolean;
}
/**
 * Options to control the select renderer content.
 */
export interface SelectRendererOptions extends CellRendererOptions {
    type: 'select';
    /**
     * The options available in the select input.
     */
    options: SelectOption[];
    /**
     * Whether the select input is disabled.
     */
    disabled?: boolean;
    /**
     * Attributes to control the select input.
     */
    attributes?: SelectAttributes;
}
/**
 * Attributes to control the select input.
 */
export interface SelectAttributes {
    multiple?: boolean;
    autofocus?: boolean;
    size?: number;
}
declare module '../CellRendererType' {
    interface CellRendererTypeRegistry {
        select: typeof SelectRenderer;
    }
}
export default SelectRenderer;
