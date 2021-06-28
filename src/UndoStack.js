_ = require 'lodash'

# Immutable undo/redo stack. Mutation operations return a new copy
module.exports = class UndoStack
  constructor: (undoStack, redoStack) ->
    @undoStack = undoStack or []
    @redoStack = redoStack or []

  # Add a value to the stack
  push: (value) ->
    # No trivial pushes
    if _.isEqual(@getValue(), value)
      return this

    undoStack = @undoStack.slice()
    undoStack.push(value)
    redoStack = []

    return new UndoStack(undoStack, redoStack)

  canUndo: ->
    return @undoStack.length > 1

  canRedo: ->
    return @redoStack.length > 0

  undo: ->
    # Put last undo on to redoStack
    redoStack = @redoStack.slice()
    redoStack.push(_.last(@undoStack))

    undoStack = _.initial(@undoStack)

    return new UndoStack(undoStack, redoStack)

  redo: ->
    # Put last redo on to undoStack
    undoStack = @undoStack.slice()
    undoStack.push(_.last(@redoStack))

    redoStack = _.initial(@redoStack)

    return new UndoStack(undoStack, redoStack)

  # Get the current value
  getValue: ->
    return _.last(@undoStack)
