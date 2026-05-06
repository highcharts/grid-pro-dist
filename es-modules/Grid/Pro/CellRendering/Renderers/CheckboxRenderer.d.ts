import type Column from '../../../Core/Table/Column';
import type { EditModeRenderer } from '../../CellEditing/CellEditMode';
import type TableCell from '../../../Core/Table/Body/TableCell';
import type { EditModeRendererTypeName } from '../../CellEditing/CellEditingComposition';
import { CellRenderer, CellRendererOptions } from '../CellRenderer.js';
import CheckboxContent from '../ContentTypes/CheckboxContent.js';
/**
 * Renderer for the Checkbox in a column.
 */
declare class CheckboxRenderer extends CellRenderer implements EditModeRenderer {
    /**
     * The default edit mode renderer type name for this view renderer.
     */
    static defaultEditingRenderer: EditModeRendererTypeName;
    /**
     * Default options for the checkbox renderer.
     */
    static defaultOptions: CheckboxRendererOptions;
    options: CheckboxRendererOptions;
    constructor(column: Column, options: Partial<CellRendererOptions>);
    render(cell: TableCell, parentElement?: HTMLElement): CheckboxContent;
}
/**
 * Options to control the checkbox renderer content.
 */
export interface CheckboxRendererOptions extends CellRendererOptions {
    /**
     * Use the built-in checkbox renderer.
     *
     * @default 'checkbox'
     */
    type: 'checkbox';
    /**
     * Whether the checkbox is disabled.
     */
    disabled?: boolean;
    /**
     * Attributes to control the checkbox.
     */
    attributes?: CheckboxAttributes;
}
/**
 * Attributes to control the checkbox.
 */
export interface CheckboxAttributes {
    /**
     * Initial checked state of the checkbox renderer.
     */
    checked?: boolean;
}
declare module '../CellRendererType' {
    interface CellRendererTypeRegistry {
        checkbox: typeof CheckboxRenderer;
    }
}
export default CheckboxRenderer;
