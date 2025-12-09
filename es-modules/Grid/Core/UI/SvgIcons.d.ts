/**
 * The name of the icon from SvgIcons registry
 */
export type GridIconName = ('filter' | 'menu' | 'chevronRight' | 'checkmark' | 'upDownArrows' | 'sortAsc' | 'sortDesc');
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
 * Creates an SVG icon element from the SvgIcons registry.
 *
 * @param name
 * The name of the icon from SvgIcons registry
 *
 * @param className
 * CSS class name for the SVG element (default: 'hcg-icon')
 *
 * @returns
 * SVG element with the specified icon
 */
export declare function createGridIcon(name: GridIconName, className?: string): SVGElement;
declare const _default: {
    readonly createGridIcon: typeof createGridIcon;
    readonly icons: Record<GridIconName, SVGDefinition>;
    readonly pathDefaults: Partial<PathDefinition>;
};
export default _default;
