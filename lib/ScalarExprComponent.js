var ActionCancelModalComponent, EditableLinkComponent, ExpressionBuilder, H, React, ScalarExprComponent, ScalarExprEditorComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

ActionCancelModalComponent = require('./ActionCancelModalComponent');

ScalarExprEditorComponent = require('./ScalarExprEditorComponent');

ExpressionBuilder = require('./ExpressionBuilder');

EditableLinkComponent = require('./EditableLinkComponent');

module.exports = ScalarExprComponent = (function(superClass) {
  extend(ScalarExprComponent, superClass);

  ScalarExprComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    table: React.PropTypes.string,
    types: React.PropTypes.array,
    includeCount: React.PropTypes.boolean,
    editorTitle: React.PropTypes.string,
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired
  };

  function ScalarExprComponent() {
    this.handleRemove = bind(this.handleRemove, this);
    this.handleEditorSave = bind(this.handleEditorSave, this);
    this.handleEditorChange = bind(this.handleEditorChange, this);
    this.handleEditorCancel = bind(this.handleEditorCancel, this);
    this.handleEditorOpen = bind(this.handleEditorOpen, this);
    ScalarExprComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      editorValue: null,
      editorOpen: false
    };
  }

  ScalarExprComponent.prototype.handleEditorOpen = function() {
    return this.setState({
      editorValue: this.props.value,
      editorOpen: true
    });
  };

  ScalarExprComponent.prototype.handleEditorCancel = function() {
    return this.setState({
      editorValue: null,
      editorOpen: false
    });
  };

  ScalarExprComponent.prototype.handleEditorChange = function(val) {
    var newVal;
    newVal = new ExpressionBuilder(this.props.schema).cleanScalarExpr(val);
    return this.setState({
      editorValue: newVal
    });
  };

  ScalarExprComponent.prototype.handleEditorSave = function() {
    this.props.onChange(this.state.editorValue);
    return this.setState({
      editorOpen: false,
      editorValue: null
    });
  };

  ScalarExprComponent.prototype.handleRemove = function() {
    return this.props.onChange(null);
  };

  ScalarExprComponent.prototype.render = function() {
    var editor, exprBuilder, summary;
    exprBuilder = new ExpressionBuilder(this.props.schema);
    if (this.state.editorOpen) {
      editor = React.createElement(ActionCancelModalComponent, {
        title: this.props.editorTitle,
        onAction: this.handleEditorSave,
        onCancel: this.handleEditorCancel
      }, React.createElement(ScalarExprEditorComponent, {
        schema: this.props.schema,
        table: this.props.table,
        types: this.props.types,
        includeCount: this.props.includeCount,
        value: this.state.editorValue,
        onChange: this.handleEditorChange
      }));
    }
    if (this.props.value) {
      if (this.props.includeCount && !exprBuilder.getExprType(this.props.value)) {
        summary = "Number of " + (this.props.schema.getTable(this.props.value.table).name);
      } else {
        summary = exprBuilder.summarizeExpr(this.props.value);
      }
    }
    return H.div({
      style: {
        display: "inline-block"
      }
    }, editor, React.createElement(EditableLinkComponent, {
      onClick: this.handleEditorOpen,
      onRemove: this.props.value ? this.handleRemove : void 0
    }, summary ? summary : H.i(null, "Select...")));
  };

  return ScalarExprComponent;

})(React.Component);
