import type { CellRendererOptions } from '../CellRenderer.js';
/**
 * Options to control the date input renderer content.
 */
export interface DateInputRendererBaseOptions extends CellRendererOptions {
    type: 'dateInput' | 'dateTimeInput' | 'timeInput';
    /**
     * Whether the date input is disabled.
     */
    disabled?: boolean;
    /**
     * Attributes to control the date input.
     */
    attributes?: DateInputAttributes;
}
/**
 * Attributes to control the date input.
 */
export interface DateInputAttributes {
    min?: string;
    max?: string;
    step?: string;
}
