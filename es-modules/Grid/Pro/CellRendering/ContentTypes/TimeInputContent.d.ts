import type { EditModeContent } from '../../CellEditing/CellEditMode.js';
import type { TimeInputRendererOptions } from '../Renderers/TimeInputRenderer.js';
import DateInputContentBase from './DateInputContentBase.js';
/**
 * Represents a time input type of cell content.
 */
declare class TimeInputContent extends DateInputContentBase implements EditModeContent {
    options: TimeInputRendererOptions;
    protected getInputType(): 'time';
    get value(): number;
    protected convertToInputValue(): string;
}
export default TimeInputContent;
