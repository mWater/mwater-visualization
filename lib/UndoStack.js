"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
// Immutable undo/redo stack. Mutation operations return a new copy
class UndoStack {
    constructor(undoStack, redoStack) {
        this.undoStack = undoStack || [];
        this.redoStack = redoStack || [];
    }
    // Add a value to the stack
    push(value) {
        // No trivial pushes
        if (lodash_1.default.isEqual(this.getValue(), value)) {
            return this;
        }
        const undoStack = this.undoStack.slice();
        undoStack.push(value);
        const redoStack = [];
        return new UndoStack(undoStack, redoStack);
    }
    canUndo() {
        return this.undoStack.length > 1;
    }
    canRedo() {
        return this.redoStack.length > 0;
    }
    undo() {
        // Put last undo on to redoStack
        const redoStack = this.redoStack.slice();
        redoStack.push(lodash_1.default.last(this.undoStack));
        const undoStack = lodash_1.default.initial(this.undoStack);
        return new UndoStack(undoStack, redoStack);
    }
    redo() {
        // Put last redo on to undoStack
        const undoStack = this.undoStack.slice();
        undoStack.push(lodash_1.default.last(this.redoStack));
        const redoStack = lodash_1.default.initial(this.redoStack);
        return new UndoStack(undoStack, redoStack);
    }
    // Get the current value
    getValue() {
        return lodash_1.default.last(this.undoStack);
    }
}
exports.default = UndoStack;
