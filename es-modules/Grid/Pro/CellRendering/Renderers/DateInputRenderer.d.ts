import type Column from '../../../Core/Table/Column';
import type { DateInputRendererBaseOptions } from './DateInputRendererBase';
import type TableCell from '../../../Core/Table/Body/TableCell';
import type { EditModeRenderer } from '../../CellEditing/CellEditMode';
import type { EditModeRendererTypeName } from '../../CellEditing/CellEditingComposition';
import { CellRenderer, CellRendererOptions } from '../CellRenderer.js';
import DateInputContent from '../ContentTypes/DateInputContent.js';
/**
 * Renderer for the Select in a column..
 */
declare class DateInputRenderer extends CellRenderer implements EditModeRenderer {
    /**
     * The default edit mode renderer type name for this view renderer.
     */
    static defaultEditingRenderer: EditModeRendererTypeName;
    /**
     * Default options for the date input renderer.
     */
    static defaultOptions: DateInputRendererOptions;
    options: DateInputRendererOptions;
    constructor(column: Column, options: Partial<CellRendererOptions>);
    render(cell: TableCell, parentElement?: HTMLElement): DateInputContent;
}
/**
 * Options to control the date input renderer content.
 */
export interface DateInputRendererOptions extends DateInputRendererBaseOptions {
    type: 'dateInput';
}
declare module '../CellRendererType' {
    interface CellRendererTypeRegistry {
        dateInput: typeof DateInputRenderer;
    }
}
export default DateInputRenderer;
