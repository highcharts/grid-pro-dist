import type Table from '../../Core/Table/Table';
import type { RuleKey, RuleDefinition, ValidationNotificationsType } from './Validator';
import Validator from './Validator.js';
/**
 * Extends the grid classes with cell editing functionality.
 *
 * @param TableClass
 * The class to extend.
 *
 */
export declare function compose(TableClass: typeof Table): void;
declare module '../../Core/Table/Table' {
    export default interface Table {
        /**
         * The validator object.
         */
        validator?: Validator;
    }
}
declare module '../../Pro/CellEditing/CellEditingComposition' {
    interface ColumnEditModeOptions {
        /**
         * Validation options for the column.
         *
         * If not set, the validation rules are applied according to the data
         * type.
         *
         * Can be an array where each item can be
         * either a rule key (string) or a rule definition (object).
         *
         * @sample grid-pro/demo/validation Validation rules
         */
        validationRules?: (RuleKey | RuleDefinition)[];
    }
}
declare module '../../Core/Options' {
    interface LangOptions {
        /**
         * Localized validation notifications for predefined rules or custom
         * validators.
         */
        validationNotifications?: ValidationNotificationsType;
    }
}
declare const _default: {
    readonly compose: typeof compose;
};
export default _default;
