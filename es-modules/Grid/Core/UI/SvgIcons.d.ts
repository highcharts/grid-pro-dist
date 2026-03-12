/**
 * The name of the icon from SvgIcons registry.
 * Use these names wherever an icon is accepted (toolbar, menu, pagination).
 * Can be overridden or extended via `rendering.icons`.
 *
 * Default icons available in the registry:
 * - `filter`, `menu`, `checkmark`
 * - `arrowUpDown`, `arrowUp`, `arrowDown`
 * - `chevronLeft`, `chevronRight`, `doubleChevronLeft`, `doubleChevronRight`
 * - `copy`, `clipboard`, `plus`, `trash`
 * - `addRowAbove`, `addRowBelow`, `addColumnLeft`, `addColumnRight`
 */
export type GridIconName = ('filter' | 'menu' | 'checkmark' | 'arrowUpDown' | 'arrowUp' | 'arrowDown' | 'chevronLeft' | 'chevronRight' | 'doubleChevronLeft' | 'doubleChevronRight' | 'copy' | 'clipboard' | 'plus' | 'trash' | 'addRowAbove' | 'addRowBelow' | 'addColumnLeft' | 'addColumnRight');
/**
 * The registry of all Grid Svg icons with their SVG path data.
 */
export declare const icons: Record<GridIconName, SVGDefinition>;
/**
 * The default path definitions for the Grid Svg icons.
 */
export declare const pathDefaults: Partial<PathDefinition>;
/**
 * The definition of a path for a Grid Svg icon.
 */
export interface PathDefinition {
    d: string;
    stroke?: string;
    'stroke-width'?: number;
    'stroke-linecap'?: string;
    'stroke-linejoin'?: string;
    opacity?: number;
}
/**
 * The definition of an SVG for a Grid Svg icon.
 */
export interface SVGDefinition {
    width?: number;
    height?: number;
    viewBox?: string;
    fill?: string;
    children?: PathDefinition[];
}
/**
 * Value for an entry in the icon registry: either an SVG definition object
 * or a raw SVG markup string (e.g. `'<svg>...</svg>'`).
 */
export type IconRegistryValue = SVGDefinition | string;
/**
 * Looks up an icon by name, checking custom icons first and then falling
 * back to the built-in registry.
 *
 * @param name
 * Icon name to look up.
 *
 * @param customIcons
 * Optional map of icon names provided via `rendering.icons`.
 *
 * @returns
 * Icon registry value (definition or raw SVG string), or `undefined` if
 * neither a custom nor a built-in icon exists for the given name.
 */
export declare function getIconFromRegistry(name: string, customIcons?: Record<string, IconRegistryValue>): IconRegistryValue | undefined;
/**
 * Creates an SVG icon element from the SvgIcons registry or a custom
 * registry. When `customIcons` is provided, `name` can be any registered
 * name (built-in or custom). When omitted, only built-in `GridIconName`
 * values are allowed. The SVG element always receives the default icon
 * class name from `Globals`.
 *
 * @param name
 * The name of the icon (built-in or from registry)
 *
 * @param customIcons
 * Optional custom icons map from `rendering.icons`. When provided, custom
 * and override icons are used and arbitrary names are allowed.
 *
 * @returns
 * SVG element with the specified icon
 */
export declare function createGridIcon(name: string, customIcons?: Record<string, IconRegistryValue>): SVGElement;
declare const _default: {
    readonly createGridIcon: typeof createGridIcon;
    readonly getIconFromRegistry: typeof getIconFromRegistry;
    readonly icons: Record<GridIconName, SVGDefinition>;
    readonly pathDefaults: Partial<PathDefinition>;
};
export default _default;
