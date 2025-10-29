import type MenuToolbarButton from './ToolbarButtons/MenuToolbarButton.js';
import type Grid from '../../../Grid.js';
import ContextMenu from '../../../UI/ContextMenu.js';
/**
 * The column filtering popup.
 */
declare class MenuPopup extends ContextMenu {
    button: MenuToolbarButton;
    constructor(grid: Grid, button: MenuToolbarButton);
    protected renderContent(): void;
}
export default MenuPopup;
