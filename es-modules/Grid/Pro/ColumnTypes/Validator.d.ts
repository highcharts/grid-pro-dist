import type { ColumnDataType } from '../../Core/Table/Column';
import type { EditModeContent } from '../CellEditing/CellEditMode';
import type Table from '../../Core/Table/Table';
import type TableCell from '../../Core/Table/Body/TableCell';
import type { CellRendererTypeRegistry } from '../CellRendering/CellRendererType';
import Cell from '../../Core/Table/Cell.js';
/**
 * Class for validating cell content.
 */
declare class Validator {
    /**
     * The class names used by the validator functionality.
     */
    static readonly classNames: {
        readonly notifContainer: string;
        readonly notifError: string;
        readonly notifAnimation: string;
        readonly editedCellError: string;
    };
    /**
     * Definition of default validation rules.
     */
    static readonly rulesRegistry: RulesRegistryType;
    /**
     * Default validation rules for each dataType.
     */
    static readonly predefinedRules: {
        dataType: Record<ColumnDataType, RuleKey[]>;
        renderer: {
            [K in keyof CellRendererTypeRegistry]?: RuleKey[];
        };
    };
    viewport: Table;
    /**
     * The cell that has an error.
     */
    errorCell?: Cell;
    /**
     * HTML Element for the errors.
     */
    notifContainer: HTMLElement;
    constructor(viewport: Table);
    /**
     * Validates the cell content.
     *
     * @param cell
     * Edited cell.
     *
     * @param errors
     * An output array for error messages.
     *
     * @returns
     * Returns true if the value is valid, false otherwise.
     */
    validate(cell: TableCell, errors?: string[]): boolean;
    /**
     * Set content of notification and adjust the position.
     *
     * @param cell
     * Cell that is currently edited and is not valid.
     *
     * @param errors
     * An array of error messages.
     *
     */
    initErrorBox(cell: TableCell, errors: string[]): void;
    /**
     * Highlight the non-valid cell and display error in the notification box.
     */
    show(): void;
    /**
     * Hide the notification, error and unset highlight on cell.
     *
     * @param hideErrorBox
     * The flag that hides the error on edited cell.
     *
     */
    hide(hideErrorBox?: boolean): void;
    /**
     * Set the position of the error box.
     */
    reflow(): void;
    /**
     * Destroy validator.
     */
    destroy(): void;
}
/**
 * Callback function that checks if field is valid.
 */
export type ValidateFunction = (this: TableCell, content: EditModeContent) => boolean;
/**
 * Callback function that returns a error message.
 */
export type ValidationErrorFunction = (this: TableCell, content?: EditModeContent) => string;
/**
 * Definition of the validation rule that should container validate method
 * and error message displayed in notification.
 */
export interface RuleDefinition {
    validate: RulesRegistryType | ValidateFunction;
    notification: string | ValidationErrorFunction;
}
/**
 *  Definition of default validation rules.
 */
export interface RulesRegistryType {
    boolean: RuleDefinition;
    datetime: RuleDefinition;
    notEmpty: RuleDefinition;
    number: RuleDefinition;
    ignoreCaseUnique: RuleDefinition;
    unique: RuleDefinition;
    arrayNumber: RuleDefinition;
    json: RuleDefinition;
    sparkline: RuleDefinition;
}
/**
 * Type of rule: `notEmpty`, `number` or `boolean`.
 */
export type RuleKey = keyof RulesRegistryType;
export default Validator;
