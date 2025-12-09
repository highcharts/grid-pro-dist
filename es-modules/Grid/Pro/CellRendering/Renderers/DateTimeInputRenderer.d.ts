import type Column from '../../../Core/Table/Column';
import type { DateInputRendererBaseOptions } from './DateInputRendererBase';
import type TableCell from '../../../Core/Table/Body/TableCell';
import type { EditModeRenderer } from '../../CellEditing/CellEditMode';
import type { EditModeRendererTypeName } from '../../CellEditing/CellEditingComposition';
import { CellRenderer, CellRendererOptions } from '../CellRenderer.js';
import DateTimeInputContent from '../ContentTypes/DateTimeInputContent.js';
/**
 * Renderer for the Select in a column..
 */
declare class DateTimeInputRenderer extends CellRenderer implements EditModeRenderer {
    /**
     * The default edit mode renderer type name for this view renderer.
     */
    static defaultEditingRenderer: EditModeRendererTypeName;
    /**
     * Default options for the date input renderer.
     */
    static defaultOptions: DateTimeInputRendererOptions;
    options: DateTimeInputRendererOptions;
    constructor(column: Column, options: Partial<CellRendererOptions>);
    render(cell: TableCell, parentElement?: HTMLElement): DateTimeInputContent;
}
/**
 * Options to control the date time input renderer content.
 */
export interface DateTimeInputRendererOptions extends DateInputRendererBaseOptions {
    type: 'dateTimeInput';
}
declare module '../CellRendererType' {
    interface CellRendererTypeRegistry {
        dateTimeInput: typeof DateTimeInputRenderer;
    }
}
export default DateTimeInputRenderer;
