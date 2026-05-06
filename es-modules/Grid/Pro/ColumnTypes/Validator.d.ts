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
 * Callback function that returns a validation notification.
 */
export type ValidationNotificationFunction = (this: TableCell, content?: EditModeContent) => string;
/**
 * Validation notification content.
 */
export type ValidationNotification = string | ValidationNotificationFunction;
/**
 * Definition of the validation rule that should contain validate method
 * and validation notification.
 */
export interface RuleDefinition {
    /**
     * Validation logic for the rule.
     *
     * Use a built-in rule key to reuse one of the predefined validators, or
     * provide a custom callback function.
     */
    validate: RuleKey | ValidateFunction;
    /**
     * Notification displayed when the validation fails.
     *
     * Can be defined as a static string or a callback function returning a
     * string.
     *
     * When `validate` references one of the predefined rule keys, this
     * property overrides that rule's built-in notification.
     *
     * Localized notifications for predefined rules configured directly by key
     * can be customized through `lang.validationNotifications`.
     */
    notification: ValidationNotification;
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
 * Definition of localized validation notifications keyed by validator name.
 *
 * Built-in validator names are listed below, and custom validators can be
 * addressed by their registry key as well.
 */
export interface ValidationNotificationsType extends Record<string, ValidationNotification | undefined> {
    /**
     * Notification text for the `boolean` validator.
     *
     * @default 'Value has to be a boolean.'
     */
    boolean?: ValidationNotification;
    /**
     * Notification text for the `datetime` validator.
     *
     * @default 'Value has to be parsed to a valid timestamp.'
     */
    datetime?: ValidationNotification;
    /**
     * Notification text for the `notEmpty` validator.
     *
     * @default 'Value cannot be empty.'
     */
    notEmpty?: ValidationNotification;
    /**
     * Notification text for the `number` validator.
     *
     * @default 'Value has to be a number.'
     */
    number?: ValidationNotification;
    /**
     * Notification text for the `ignoreCaseUnique` validator.
     *
     * @default 'Value must be unique within this column (case-insensitive).'
     */
    ignoreCaseUnique?: ValidationNotification;
    /**
     * Notification text for the `unique` validator.
     *
     * @default 'Value must be unique within this column (case-sensitive).'
     */
    unique?: ValidationNotification;
    /**
     * Notification text for the `arrayNumber` validator.
     *
     * @default 'Value should be a list of numbers separated by commas.'
     */
    arrayNumber?: ValidationNotification;
    /**
     * Notification text for the `json` validator.
     *
     * @default 'Value should be a valid JSON.'
     */
    json?: ValidationNotification;
    /**
     * Notification text for the `sparkline` validator.
     *
     * @default 'Value should be a valid JSON or a list of numbers separated by commas.'
     */
    sparkline?: ValidationNotification;
}
/**
 * Type of rule: `notEmpty`, `number` or `boolean`.
 */
export type RuleKey = keyof RulesRegistryType;
export default Validator;
