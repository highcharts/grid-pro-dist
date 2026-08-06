import type Grid from '../../Core/Grid';
/**
 * Registers TreeView-specific validator rules in the shared validator
 * registry.
 */
declare function registerTreeViewValidationRules(): void;
/**
 * Synchronizes TreeView path validation rules with the current path column.
 *
 * @param grid
 * Grid instance owning the current TreeView controller.
 */
declare function syncTreePathValidationRules(grid: Grid): void;
declare module '../ColumnTypes/Validator' {
    interface RulesRegistryType {
        treeViewPathSyntax?: RuleDefinition;
        treeViewPathUnique?: RuleDefinition;
    }
}
declare const _default: {
    readonly registerTreeViewValidationRules: typeof registerTreeViewValidationRules;
    readonly syncTreePathValidationRules: typeof syncTreePathValidationRules;
};
export default _default;
