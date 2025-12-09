import type ColumnToolbar from '../ColumnToolbar.js';
import ToolbarButton from '../../../../UI/ToolbarButton.js';
import MenuPopup from '../MenuPopup.js';
declare class MenuToolbarButton extends ToolbarButton {
    toolbar?: ColumnToolbar;
    popup?: MenuPopup;
    constructor();
    protected clickHandler(event: MouseEvent): void;
    refreshState(): void;
    protected addEventListeners(): void;
}
export default MenuToolbarButton;
