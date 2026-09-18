import type Table from '../../Core/Table/Table';
import type { SummaryRenderRow } from './SummaryRowsTypes';
/**
 * Renders computed summary rows in dedicated frozen tbody sections above and/or
 * below the scrollable table body.
 */
declare class SummaryView {
    private readonly viewport;
    /**
     * Frozen section stuck above the scrollable body.
     */
    private readonly top;
    /**
     * Frozen section stuck below the scrollable body.
     */
    private readonly bottom;
    constructor(viewport: Table);
    /**
     * Registers a summary body section.
     *
     * @param position
     * Summary position the section holds.
     *
     * @param sectionPosition
     * Body section placement relative to the main rows.
     */
    private createSection;
    /**
     * Renders the given summary rows into the top and bottom sections.
     *
     * @param summaryRows
     * Resolved summary rows (values, formats, position).
     */
    render(summaryRows: SummaryRenderRow[]): Promise<void>;
    /**
     * Renders one section's rows, reusing existing rows.
     *
     * @param section
     * Target section.
     *
     * @param summaryRows
     * Rows assigned to the section.
     *
     * @param before
     * Whether the section is inserted before the main body.
     */
    private renderSection;
    /**
     * Re-applies per-cell widths and horizontal offset after a reflow.
     */
    reflow(): void;
    /**
     * Reflows a single section's rows.
     *
     * @param section
     * Target section.
     */
    private reflowSection;
    /**
     * Keeps the frozen rows aligned with the main body horizontal scroll.
     *
     * @param scrollLeft
     * Current horizontal scroll offset of the main body.
     */
    syncHorizontalScroll(scrollLeft: number): void;
    /**
     * Applies the horizontal offset to a single section.
     *
     * @param section
     * Target section.
     *
     * @param transform
     * Transform to apply to each row.
     */
    private offsetSection;
    /**
     * Unregisters the sections and removes all rendered rows.
     */
    destroy(): void;
    /**
     * Destroys a single section.
     *
     * @param position
     * Summary position the section holds.
     *
     * @param section
     * Target section.
     */
    private destroySection;
}
export default SummaryView;
