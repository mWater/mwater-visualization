import { assert } from 'chai';
import _ from 'lodash';
import UndoStack from '../src/UndoStack';

describe("UndoStack", function() {
  beforeEach(function() {
    this.undoStack = new UndoStack();
    this.a = { x: 1 };
    this.b = { x: 2 };
    return this.c = { x: 3 };});

  it("returns self when pushing identical value", function() {
    const us = this.undoStack.push(this.a);
    const us2 = us.push(this.a);
    return assert.equal(us, us2);
  });

  it("cannot undo with one value", function() {
    const us = this.undoStack.push(this.a);
    assert.isFalse(us.canUndo());
    return assert.equal(us.getValue(), this.a);
  });

  it("cannot redo with two values", function() {
    let us = this.undoStack.push(this.a);
    us = us.push(this.b);
    return assert.isFalse(us.canRedo());
  });

  it("can undo with two values", function() {
    let us = this.undoStack.push(this.a);
    us = us.push(this.b);
    return assert.isTrue(us.canUndo());
  });

  it("can redo after undo", function() {
    let us = this.undoStack.push(this.a);
    us = us.push(this.b);
    us = us.undo();
    return assert.isTrue(us.canRedo());
  });

  it("gets previous value after undo", function() {
    let us = this.undoStack.push(this.a);
    us = us.push(this.b);
    us = us.undo();
    return assert.equal(us.getValue(), this.a);
  });

  it("redoes", function() {
    let us = this.undoStack.push(this.a);
    us = us.push(this.b);
    us = us.undo();
    us = us.redo();
    return assert.equal(us.getValue(), this.b);
  });

  return it("pushing new value clears redo stack", function() {
    let us = this.undoStack.push(this.a);
    us = us.push(this.b);
    us = us.undo();

    // Same value no effect
    us = us.push(this.a);
    assert.isTrue(us.canRedo());

    us = us.push(this.c);
    return assert.isFalse(us.canRedo());
  });
});
