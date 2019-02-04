"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var UndoStack, _;

_ = require('lodash'); // Immutable undo/redo stack. Mutation operations return a new copy

module.exports = UndoStack =
/*#__PURE__*/
function () {
  function UndoStack(undoStack, redoStack) {
    (0, _classCallCheck2.default)(this, UndoStack);
    this.undoStack = undoStack || [];
    this.redoStack = redoStack || [];
  } // Add a value to the stack


  (0, _createClass2.default)(UndoStack, [{
    key: "push",
    value: function push(value) {
      var redoStack, undoStack; // No trivial pushes

      if (_.isEqual(this.getValue(), value)) {
        return this;
      }

      undoStack = this.undoStack.slice();
      undoStack.push(value);
      redoStack = [];
      return new UndoStack(undoStack, redoStack);
    }
  }, {
    key: "canUndo",
    value: function canUndo() {
      return this.undoStack.length > 1;
    }
  }, {
    key: "canRedo",
    value: function canRedo() {
      return this.redoStack.length > 0;
    }
  }, {
    key: "undo",
    value: function undo() {
      var redoStack, undoStack; // Put last undo on to redoStack

      redoStack = this.redoStack.slice();
      redoStack.push(_.last(this.undoStack));
      undoStack = _.initial(this.undoStack);
      return new UndoStack(undoStack, redoStack);
    }
  }, {
    key: "redo",
    value: function redo() {
      var redoStack, undoStack; // Put last redo on to undoStack

      undoStack = this.undoStack.slice();
      undoStack.push(_.last(this.redoStack));
      redoStack = _.initial(this.redoStack);
      return new UndoStack(undoStack, redoStack);
    } // Get the current value

  }, {
    key: "getValue",
    value: function getValue() {
      return _.last(this.undoStack);
    }
  }]);
  return UndoStack;
}();