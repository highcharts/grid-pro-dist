import type { CellType as DataTableCellType } from '../../../Data/DataTable';
import type PinnedTableRow from './PinnedTableRow';
import TableCell from '../../Core/Table/Body/TableCell.js';
declare class PinnedTableCell extends TableCell {
    readonly row: PinnedTableRow;
    setValue(value?: DataTableCellType, updateDataset?: boolean): Promise<void>;
    protected updateDataset(): Promise<boolean>;
    protected onFocus(): void;
    onMouseOver(): void;
    onMouseOut(): void;
}
export default PinnedTableCell;
