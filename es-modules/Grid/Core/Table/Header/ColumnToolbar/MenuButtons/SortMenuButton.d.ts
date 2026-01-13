import type MenuPopup from '../MenuPopup';
import type { LangOptions } from '../../../../Options';
import ContextMenuButton from '../../../../UI/ContextMenuButton.js';
declare class SortMenuButton extends ContextMenuButton {
    contextMenu?: MenuPopup;
    private direction;
    private baseLabel;
    constructor(langOptions: LangOptions, direction: typeof SortMenuButton.prototype.direction);
    protected refreshState(): void;
    /**
     * Updates the label to include the sort priority when multi-column
     * sorting is active.
     *
     * @param column
     * The column to get the priority from, or undefined to reset the label.
     */
    private updateLabelWithPriority;
    protected addEventListeners(): void;
    protected clickHandler(event: MouseEvent): void;
}
export default SortMenuButton;
