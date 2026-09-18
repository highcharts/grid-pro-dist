import type { CreditsOptions } from './Options';
import type Grid from './Grid';
/**
 * Represents a credits in the grid.
 */
declare class Credits {
    /**
     * Default options of the credits.
     */
    static defaultOptions: CreditsOptions;
    /**
     * The Grid instance which the credits belong to.
     */
    readonly grid: Grid;
    /**
     * The credits container HTML element.
     */
    readonly containerElement: HTMLElement;
    /**
     * The credits content HTML element.
     */
    textElement: HTMLElement;
    /**
     * The options for the credits.
     */
    options: CreditsOptions;
    /**
     * Construct the credits.
     *
     * @param grid
     * The Grid instance which the credits belong to.
     *
     * @param options
     * Options for the credits label. Predefined if not provided.
     *
     */
    constructor(grid: Grid, options?: CreditsOptions);
    /**
     * Render the credits. If the credits are disabled, they will be removed
     * from the container.
     */
    render(): void;
    /**
     * Set the anchor's href, dropping URLs that are not allowed references.
     *
     * @param href
     * The href to set on the anchor element. If undefined or unsafe, the href
     * attribute will be removed.
     */
    protected setHref(href?: string): void;
    private renderAnchor;
    /**
     * Get the height of the credits container.
     */
    getHeight(): number;
    /**
     * Destroy the credits. The credits will be removed from the container and
     * the reference to the credits will be deleted from the Grid instance
     * it belongs to.
     */
    destroy(): void;
}
export default Credits;
