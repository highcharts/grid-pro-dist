import type ColumnToolbar from '../ColumnToolbar.js';
import FilterPopup from '../FilterPopup.js';
import ToolbarButton from '../../../../UI/ToolbarButton.js';
declare class FilterToolbarButton extends ToolbarButton {
    toolbar?: ColumnToolbar;
    popup?: FilterPopup;
    constructor();
    refreshState(): void;
    protected addEventListeners(): void;
    protected clickHandler(event: MouseEvent): void;
}
export default FilterToolbarButton;
