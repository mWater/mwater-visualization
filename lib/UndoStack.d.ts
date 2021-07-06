export default class UndoStack {
    constructor(undoStack: any, redoStack: any);
    push(value: any): UndoStack;
    canUndo(): boolean;
    canRedo(): boolean;
    undo(): UndoStack;
    redo(): UndoStack;
    getValue(): unknown;
}
