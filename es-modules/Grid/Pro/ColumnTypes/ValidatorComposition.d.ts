import type Table from '../../Core/Table/Table';
import type { RuleKey, RuleDefinition, RulesRegistryType } from './Validator';
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
        validator: Validator;
    }
}
declare module '../../Pro/CellEditing/CellEditingComposition' {
    interface ColumnEditModeOptions {
        /**
         * Validation options for the column.
         *
         * If not set, the validation rules are applied according to the data
         * type.
         */
        validationRules?: (RuleKey | RuleDefinition)[];
    }
}
declare module '../../Core/Options' {
    interface LangOptions {
        /**
         * Validation options for the column.
         *
         * If not set, the validation rules are applied according to the data
         * type.
         */
        validationErrors?: RulesRegistryType;
    }
}
declare const _default: {
    readonly compose: typeof compose;
};
export default _default;
