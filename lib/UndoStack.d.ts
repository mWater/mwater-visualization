declare const _default: {
    new (undoStack: any, redoStack: any): {
        push(value: any): any;
        canUndo(): boolean;
        canRedo(): boolean;
        undo(): any;
        redo(): any;
        getValue(): unknown;
    };
};
export default _default;
