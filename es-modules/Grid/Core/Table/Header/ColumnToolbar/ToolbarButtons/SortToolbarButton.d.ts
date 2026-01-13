import type ColumnToolbar from '../ColumnToolbar.js';
import ToolbarButton from '../../../../UI/ToolbarButton.js';
declare class SortToolbarButton extends ToolbarButton {
    toolbar?: ColumnToolbar;
    private sortPriorityIndicator?;
    private getColumnLabel;
    private updateA11yLabel;
    constructor();
    protected clickHandler(event: MouseEvent): void;
    private renderSortPriorityIndicator;
    refreshState(): void;
    protected addEventListeners(): void;
    protected renderActiveIndicator(render: boolean): void;
}
export default SortToolbarButton;
