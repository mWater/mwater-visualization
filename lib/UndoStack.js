var UndoStack, _;

_ = require('lodash');

module.exports = UndoStack = (function() {
  function UndoStack(undoStack, redoStack) {
    this.undoStack = undoStack || [];
    this.redoStack = redoStack || [];
  }

  UndoStack.prototype.push = function(value) {
    var redoStack, undoStack;
    if (_.isEqual(this.getValue(), value)) {
      return this;
    }
    undoStack = this.undoStack.slice();
    undoStack.push(value);
    redoStack = [];
    return new UndoStack(undoStack, redoStack);
  };

  UndoStack.prototype.canUndo = function() {
    return this.undoStack.length > 1;
  };

  UndoStack.prototype.canRedo = function() {
    return this.redoStack.length > 0;
  };

  UndoStack.prototype.undo = function() {
    var redoStack, undoStack;
    redoStack = this.redoStack.slice();
    redoStack.push(_.last(this.undoStack));
    undoStack = _.initial(this.undoStack);
    return new UndoStack(undoStack, redoStack);
  };

  UndoStack.prototype.redo = function() {
    var redoStack, undoStack;
    undoStack = this.undoStack.slice();
    undoStack.push(_.last(this.redoStack));
    redoStack = _.initial(this.redoStack);
    return new UndoStack(undoStack, redoStack);
  };

  UndoStack.prototype.getValue = function() {
    return _.last(this.undoStack);
  };

  return UndoStack;

})();
