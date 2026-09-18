import type Cell from '../../Core/Table/Cell';
import type Column from '../../Core/Table/Column';
import type { SummaryRenderRow } from './SummaryRowsTypes';
import TableRow from '../../Core/Table/Body/TableRow.js';
/**
 * Row rendered in the summary section, fed from a computed row object rather
 * than the data provider.
 */
declare class SummaryTableRow extends TableRow {
    /**
     * Body section id the row belongs to.
     */
    readonly bodySectionId = "summary";
    /**
     * Per-cell format overrides for this row, keyed by column id.
     */
    formats: Record<string, string>;
    /**
     * Per-cell class name and style overrides for this row, keyed by column id.
     */
    renderRow?: SummaryRenderRow;
    /**
     * Class name applied to the row element from options.
     */
    private customClassName?;
    /**
     * Style properties applied to the row element from options.
     */
    private customStyleProperties?;
    /**
     * Skips the data-provider fetch of the base row init.
     */
    init(): Promise<void>;
    createCell(column: Column): Cell;
    update(): Promise<void>;
    /**
     * Feeds the row with the computed values and the resolved per-cell
     * overrides.
     *
     * @param renderRow
     * Resolved summary row to render.
     *
     * @param index
     * Row index within the summary section.
     */
    sync(renderRow: SummaryRenderRow, index?: number): Promise<void>;
    setHoveredState(hovered: boolean): void;
    setSyncedState(synced: boolean): void;
    setRowAttributes(): void;
    updateRowAttributes(): void;
    protected updateParityClass(): void;
    protected updateStateClasses(): void;
}
export default SummaryTableRow;
