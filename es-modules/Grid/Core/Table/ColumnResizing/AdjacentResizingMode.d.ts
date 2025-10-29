import type ColumnsResizer from '../Actions/ColumnsResizer';
import ResizingMode from './ResizingMode.js';
declare class AdjacentResizingMode extends ResizingMode {
    readonly type: "adjacent";
    resize(resizer: ColumnsResizer, diff: number): void;
}
export default AdjacentResizingMode;
