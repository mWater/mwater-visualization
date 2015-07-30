assert = require('chai').assert
_ = require 'lodash'
UndoStack = require '../src/UndoStack'

describe "UndoStack", ->
  beforeEach ->
    @undoStack = new UndoStack()
    @a = { x: 1 }
    @b = { x: 2 }
    @c = { x: 3 }

  it "returns self when pushing identical value", ->
    us = @undoStack.push(@a)
    us2 = us.push(@a)
    assert.equal us, us2

  it "cannot undo with one value", ->
    us = @undoStack.push(@a)
    assert.isFalse us.canUndo()
    assert.equal us.getValue(), @a

  it "cannot redo with two values", ->
    us = @undoStack.push(@a)
    us = us.push(@b)
    assert.isFalse us.canRedo()

  it "can undo with two values", ->
    us = @undoStack.push(@a)
    us = us.push(@b)
    assert.isTrue us.canUndo()

  it "can redo after undo", ->
    us = @undoStack.push(@a)
    us = us.push(@b)
    us = us.undo()
    assert.isTrue us.canRedo()

  it "gets previous value after undo", ->
    us = @undoStack.push(@a)
    us = us.push(@b)
    us = us.undo()
    assert.equal us.getValue(), @a

  it "redoes", ->
    us = @undoStack.push(@a)
    us = us.push(@b)
    us = us.undo()
    us = us.redo()
    assert.equal us.getValue(), @b

  it "pushing new value clears redo stack", ->
    us = @undoStack.push(@a)
    us = us.push(@b)
    us = us.undo()

    # Same value no effect
    us = us.push(@a)
    assert.isTrue us.canRedo()

    us = us.push(@c)
    assert.isFalse us.canRedo()
