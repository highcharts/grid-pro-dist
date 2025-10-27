import type ColumnsResizer from '../Actions/ColumnsResizer.js';
import ResizingMode from './ResizingMode.js';
declare class DistributedResizingMode extends ResizingMode {
    readonly type: "distributed";
    resize(resizer: ColumnsResizer, diff: number): void;
}
export default DistributedResizingMode;
