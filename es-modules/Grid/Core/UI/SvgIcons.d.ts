/**
 * Registry of all Grid Svg icons with their SVG path data.
 * Icons are designed for a 24x24 viewBox and use stroke-based rendering.
 */
declare namespace SvgIcons {
    /**
     * The name of the icon from SvgIcons registry
     */
    type GridIconName = ('filter' | 'menu' | 'chevronRight' | 'checkmark' | 'upDownArrows' | 'sortAsc' | 'sortDesc');
    /**
     * The registry of all Grid Svg icons with their SVG path data.
     */
    const icons: Record<GridIconName, SVGDefinition>;
    /**
     * The default path definitions for the Grid Svg icons.
     */
    const pathDefaults: Partial<PathDefinition>;
    /**
     * The definition of a path for a Grid Svg icon.
     */
    interface PathDefinition {
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
    interface SVGDefinition {
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
    function createGridIcon(name: GridIconName, className?: string): SVGElement;
}
export default SvgIcons;
