export default class UndoStack {
    undoStack: any[];
    redoStack: any[];
    constructor(undoStack?: any, redoStack?: any);
    push(value: any): UndoStack;
    canUndo(): boolean;
    canRedo(): boolean;
    undo(): UndoStack;
    redo(): UndoStack;
    getValue(): any;
}
