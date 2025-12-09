import type ColumnToolbar from '../ColumnToolbar.js';
import ToolbarButton from '../../../../UI/ToolbarButton.js';
declare class SortToolbarButton extends ToolbarButton {
    toolbar?: ColumnToolbar;
    constructor();
    protected clickHandler(event: MouseEvent): void;
    refreshState(): void;
    protected addEventListeners(): void;
    protected renderActiveIndicator(): void;
}
export default SortToolbarButton;
