import type { ColumnDataType } from '../../Column';
/**
 * String filtering conditions.
 */
export type StringCondition = typeof stringConditions[number];
/**
 * Number filtering conditions.
 */
export type NumberCondition = typeof numberConditions[number];
/**
 * DateTime filtering conditions (same operators as number).
 */
export type DateTimeCondition = NumberCondition;
/**
 * Boolean filtering conditions.
 */
export type BooleanCondition = typeof booleanConditions[number];
/**
 * The event object for the 'afterRender' event.
 */
export type AfterRenderEvent = Event & {
    column: ColumnDataType;
    filtering: boolean;
};
/**
 * String conditions values for the condition select options.
 */
export declare const stringConditions: readonly ["contains", "doesNotContain", "equals", "doesNotEqual", "beginsWith", "endsWith", "empty", "notEmpty"];
/**
 * Number conditions values for the condition select options.
 */
export declare const numberConditions: readonly ["equals", "doesNotEqual", "greaterThan", "greaterThanOrEqualTo", "lessThan", "lessThanOrEqualTo", "empty", "notEmpty"];
/**
 * DateTime conditions values for the condition select options.
 */
export declare const dateTimeConditions: readonly ["equals", "doesNotEqual", "greaterThan", "greaterThanOrEqualTo", "lessThan", "lessThanOrEqualTo", "empty", "notEmpty"];
/**
 * Boolean conditions values for the condition select options.
 */
export declare const booleanConditions: readonly ["all", "true", "false", "empty"];
/**
 * Legacy datetime operator aliases (`before` → `lessThan`, `after` → `greaterThan`).
 */
export declare const operatorAliases: {
    readonly before: "lessThan";
    readonly after: "greaterThan";
};
/**
 * Combined filtering conditions.
 */
export type Condition = StringCondition | NumberCondition | BooleanCondition | keyof typeof operatorAliases;
/**
 * Corresponding values for the boolean select options.
 */
export declare const booleanValueMap: Record<BooleanCondition, 'all' | boolean | null>;
/**
 * Conditions map for the condition select options.
 */
export declare const conditionsMap: Record<ColumnDataType, readonly Condition[]>;
