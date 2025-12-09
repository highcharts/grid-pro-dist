import type CellRendererType from '../CellRendering/CellRendererType';
import type Column from '../../Core/Table/Column';
import type { DeepPartial } from '../../../Shared/Types';
import type { EditModeRenderer } from './CellEditMode';
import type Options from '../../Core/Options';
import type Table from '../../Core/Table/Table';
import type TableCell from '../../Core/Table/Body/TableCell';
import CellEditing from './CellEditing.js';
/**
 * Default options for the cell editing.
 */
export declare const defaultOptions: DeepPartial<Options>;
/**
 * Extends the grid classes with cell editing functionality.
 *
 * @param TableClass
 * The class to extend.
 *
 * @param TableCellClass
 * The class to extend.
 *
 * @param ColumnClass
 * The class to extend.
 */
export declare function compose(TableClass: typeof Table, TableCellClass: typeof TableCell, ColumnClass: typeof Column): void;
export type EditModeRendererType = Extract<CellRendererType, EditModeRenderer>;
export type EditModeRendererTypeName = EditModeRendererType['options']['type'];
/**
 * The options for the cell edit mode functionality.
 */
export interface ColumnEditModeOptions {
    /**
     * Whether to enable the cell edit mode functionality.
     */
    enabled?: boolean;
    /**
     * The edit mode renderer for the column.
     */
    renderer?: EditModeRendererType['options'];
}
/**
 * Accessibility options for the Grid cell editing functionality.
 */
export interface CellEditingLangA11yOptions {
    /**
     * An additional hint (a visually hidden span) read by the voice over
     * after the cell value.
     *
     * @default 'Editable.'
     */
    editable?: string;
    /**
     * Accessibility lang options for the cell editing announcements.
     */
    announcements?: {
        /**
         * The message when the cell editing started.
         *
         * @default 'Entered cell editing mode.'
         */
        started?: string;
        /**
         * The message when the cell editing ended.
         *
         * @default 'Edited cell value.'
         */
        edited?: string;
        /**
         * The message when the cell editing was cancelled.
         *
         * @default 'Editing cancelled.'
         */
        cancelled?: string;
        /**
         * The message when the cell value is not valid. It precedes the
         * error messages.
         *
         * @default 'Provided value is not valid.'
         */
        notValid?: string;
    };
}
declare module '../../Core/Table/Table' {
    export default interface Table {
        /**
         * The cell editing instance for the table.
         */
        cellEditing?: CellEditing;
    }
}
declare module '../../Core/Table/Column' {
    export default interface Column {
        /**
         * The edit mode renderer for the column.
         */
        editModeRenderer?: EditModeRendererType;
    }
}
declare module '../../Core/Table/Body/TableCell' {
    export default interface TableCell {
        /**
         * The HTML span element that contains the 'editable' hint for the cell.
         */
        a11yEditableHint?: HTMLSpanElement;
    }
}
declare module '../GridEvents' {
    interface CellEvents {
        /**
         * Callback function to be called after editing of cell value.
         */
        afterEdit?: CellEventCallback;
    }
}
declare module '../../Core/Accessibility/A11yOptions' {
    interface A11yAnnouncementsOptions {
        /**
         * Enable accessibility announcements for the cell editing.
         *
         * @default true
         */
        cellEditing?: boolean;
    }
    interface LangAccessibilityOptions {
        /**
         * Language options for the accessibility descriptions in cell editing.
         */
        cellEditing?: CellEditingLangA11yOptions;
    }
}
declare module '../../Core/Options' {
    interface ColumnCellOptions {
        /**
         * Whether to enabled the cell edit mode functionality. It allows to
         * edit the cell value in a separate input field that is displayed
         * after double-clicking the cell or pressing the Enter key.
         */
        editMode?: ColumnEditModeOptions;
    }
}
/**
 * The possible types of the edit message.
 */
export type EditMsgType = 'started' | 'edited' | 'cancelled';
declare const _default: {
    compose: typeof compose;
    defaultOptions: DeepPartial<Options>;
};
export default _default;
