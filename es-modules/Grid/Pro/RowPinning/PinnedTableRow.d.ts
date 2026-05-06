import type Cell from '../../Core/Table/Cell';
import type Column from '../../Core/Table/Column';
import type { RowObject as DataTableRowObject } from '../../../Data/DataTable';
import type { RowId } from '../../Core/Data/DataProvider';
import TableRow from '../../Core/Table/Body/TableRow.js';
declare class PinnedTableRow extends TableRow {
    readonly bodySectionId: 'top' | 'bottom';
    constructor(viewport: TableRow['viewport'], section: 'top' | 'bottom', index: number);
    init(): Promise<void>;
    createCell(column: Column): Cell;
    update(): Promise<void>;
    sync(rowId: RowId | undefined, data: DataTableRowObject, index?: number, doReflow?: boolean): Promise<void>;
    setHoveredState(hovered: boolean): void;
    setSyncedState(synced: boolean): void;
    setRowAttributes(): void;
    updateRowAttributes(): void;
    protected updateParityClass(): void;
    protected updateStateClasses(): void;
}
export default PinnedTableRow;
