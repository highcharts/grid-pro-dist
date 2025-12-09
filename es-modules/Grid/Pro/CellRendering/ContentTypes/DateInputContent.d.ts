import type { EditModeContent } from '../../CellEditing/CellEditMode.js';
import type { DateInputRendererOptions } from '../Renderers/DateInputRenderer.js';
import DateInputContentBase from './DateInputContentBase.js';
/**
 * Represents a date input type of cell content.
 */
declare class DateInputContent extends DateInputContentBase implements EditModeContent {
    options: DateInputRendererOptions;
    protected getInputType(): 'date';
    protected convertToInputValue(): string;
}
export default DateInputContent;
