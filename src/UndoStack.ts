// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let UndoStack
import _ from "lodash"

// Immutable undo/redo stack. Mutation operations return a new copy
export default UndoStack = class UndoStack {
  constructor(undoStack: any, redoStack: any) {
    this.undoStack = undoStack || []
    this.redoStack = redoStack || []
  }

  // Add a value to the stack
  push(value: any) {
    // No trivial pushes
    if (_.isEqual(this.getValue(), value)) {
      return this
    }

    const undoStack = this.undoStack.slice()
    undoStack.push(value)
    const redoStack: any = []

    return new UndoStack(undoStack, redoStack)
  }

  canUndo() {
    return this.undoStack.length > 1
  }

  canRedo() {
    return this.redoStack.length > 0
  }

  undo() {
    // Put last undo on to redoStack
    const redoStack = this.redoStack.slice()
    redoStack.push(_.last(this.undoStack))

    const undoStack = _.initial(this.undoStack)

    return new UndoStack(undoStack, redoStack)
  }

  redo() {
    // Put last redo on to undoStack
    const undoStack = this.undoStack.slice()
    undoStack.push(_.last(this.redoStack))

    const redoStack = _.initial(this.redoStack)

    return new UndoStack(undoStack, redoStack)
  }

  // Get the current value
  getValue() {
    return _.last(this.undoStack)
  }
}
