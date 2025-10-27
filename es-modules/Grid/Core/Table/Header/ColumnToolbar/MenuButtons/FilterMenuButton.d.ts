import type MenuPopup from '../MenuPopup';
import type { LangOptions } from '../../../../Options';
import FilterPopup from '../FilterPopup.js';
import ContextMenuButton from '../../../../UI/ContextMenuButton.js';
declare class FilterToolbarButton extends ContextMenuButton {
    contextMenu?: MenuPopup;
    popup?: FilterPopup;
    constructor(langOptions: LangOptions);
    protected refreshState(): void;
    protected addEventListeners(): void;
    protected clickHandler(event: MouseEvent): void;
}
export default FilterToolbarButton;
