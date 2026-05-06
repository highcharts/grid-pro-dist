import type { CellType as DataTableCellType } from '../../../Data/DataTable';
import type { RowId } from '../../Core/Data/DataProvider';
import Table from '../../Core/Table/Table.js';
import TableRow from '../../Core/Table/Body/TableRow.js';
/**
 * The class names used by the row pinning functionality.
 */
export declare const classNames: {
    readonly pinnedTbodyElement: string;
    readonly pinnedTopTbodyElement: string;
    readonly pinnedBottomTbodyElement: string;
    readonly rowPinned: string;
    readonly rowPinnedTop: string;
    readonly rowPinnedBottom: string;
};
export interface PinningViewportCompensationState {
    anchorRowId?: RowId;
    anchorRowTop?: number;
    pinnedTopHeight: number;
}
declare class RowPinningView {
    readonly viewport: Table;
    readonly pinnedTopTbodyElement: HTMLElement;
    readonly pinnedBottomTbodyElement: HTMLElement;
    private readonly pinnedTopRows;
    private readonly pinnedBottomRows;
    private readonly pinnedTopRowById;
    private readonly pinnedBottomRowById;
    private scrollbarCompensationQueued;
    constructor(viewport: Table);
    getRows(section: 'top' | 'bottom'): TableRow[];
    getPinnedRowsCount(): number;
    getRenderedPinnedRowById(rowId: RowId, section: 'top' | 'bottom'): TableRow | undefined;
    getBodyForSection(section: 'top' | 'bottom'): HTMLElement;
    getSectionForBody(tbody: HTMLElement): ('top' | 'bottom' | undefined);
    getPinnedBodyMaxHeightSignature(): string;
    refreshFromQueryCycle(deferLayout?: boolean): Promise<void>;
    render(deferLayout?: boolean): Promise<{
        missingPinnedRowIds: RowId[];
    }>;
    reflow(): void;
    destroy(): void;
    revealRowInSection(rowId: RowId, section: 'top' | 'bottom'): void;
    captureViewportCompensation(rowId: RowId): PinningViewportCompensationState;
    restoreViewportCompensation(compensationState: PinningViewportCompensationState): void;
    syncHorizontalScroll(scrollLeft: number): void;
    updateRowAttributes(row: TableRow): void;
    syncRenderedMirrors(rowId: RowId, columnId: string, value: DataTableCellType, sourceRow: TableRow, sourceColumnId?: string): Promise<void>;
    syncPinnedRowsFromMaterializedRows(): Promise<void>;
    getScrollableRowCount(providerRowCount: number): Promise<number>;
    private getPinnedBodyMaxHeight;
    private normalizeMaxHeight;
    private applyPinnedBodyMaxHeights;
    private syncPinnedRowsByIds;
    private rebuildPinnedRowLookupMaps;
    private updateScrollableRowAttributes;
    /**
     * Keeps pinned sections aligned with the scrollable tbody content width by
     * compensating for the vertical scrollbar gutter.
     */
    private applyPinnedScrollbarCompensation;
    private ensurePinnedBodiesRendered;
    private hasPendingRenderedPinnedRows;
    private clearPinnedRows;
    private getPinnedSections;
}
export default RowPinningView;
