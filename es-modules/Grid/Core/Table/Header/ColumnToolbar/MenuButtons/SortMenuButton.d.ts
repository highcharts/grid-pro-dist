import type MenuPopup from '../MenuPopup';
import type { LangOptions } from '../../../../Options';
import ContextMenuButton from '../../../../UI/ContextMenuButton.js';
declare class SortMenuButton extends ContextMenuButton {
    contextMenu?: MenuPopup;
    private direction;
    constructor(langOptions: LangOptions, direction: typeof SortMenuButton.prototype.direction);
    protected refreshState(): void;
    protected addEventListeners(): void;
    protected clickHandler(event: MouseEvent): void;
}
export default SortMenuButton;
