import type Column from '../../../Core/Table/Column';
import type { DateInputRendererBaseOptions } from './DateInputRendererBase';
import type TableCell from '../../../Core/Table/Body/TableCell';
import type { EditModeRenderer } from '../../CellEditing/CellEditMode';
import type { EditModeRendererTypeName } from '../../CellEditing/CellEditingComposition';
import { CellRenderer, CellRendererOptions } from '../CellRenderer.js';
import TimeInputContent from '../ContentTypes/TimeInputContent.js';
/**
 * Renderer for the Select in a column..
 */
declare class TimeInputRenderer extends CellRenderer implements EditModeRenderer {
    /**
     * The default edit mode renderer type name for this view renderer.
     */
    static defaultEditingRenderer: EditModeRendererTypeName;
    /**
     * Default options for the time input renderer.
     */
    static defaultOptions: TimeInputRendererOptions;
    options: TimeInputRendererOptions;
    constructor(column: Column, options: Partial<CellRendererOptions>);
    render(cell: TableCell, parentElement?: HTMLElement): TimeInputContent;
}
/**
 * Options to control the time input renderer content.
 */
export interface TimeInputRendererOptions extends DateInputRendererBaseOptions {
    type: 'timeInput';
}
declare module '../CellRendererType' {
    interface CellRendererTypeRegistry {
        timeInput: typeof TimeInputRenderer;
    }
}
export default TimeInputRenderer;
