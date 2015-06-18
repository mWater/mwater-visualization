var ActionCancelModalComponent, ExpressionBuilder, H, React, ScalarExprComponent, ScalarExprEditorComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

ActionCancelModalComponent = require('./ActionCancelModalComponent');

ScalarExprEditorComponent = require('./ScalarExprEditorComponent');

ExpressionBuilder = require('./ExpressionBuilder');

module.exports = ScalarExprComponent = (function(superClass) {
  extend(ScalarExprComponent, superClass);

  ScalarExprComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    table: React.PropTypes.string,
    types: React.PropTypes.array,
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
    var editor, exprBuilder;
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
        value: this.state.editorValue,
        onChange: this.handleEditorChange
      }));
    }
    return H.div({
      style: {
        display: "inline-block"
      }
    }, editor, H.input({
      type: "text",
      className: "form-control input-sm",
      readOnly: true,
      style: {
        backgroundColor: "white",
        cursor: "pointer",
        display: "inline-block",
        width: "auto"
      },
      value: this.props.value ? exprBuilder.summarizeExpr(this.props.value) : void 0,
      placeholder: "Click to select...",
      onClick: this.handleEditorOpen
    }), this.props.value ? H.button({
      type: "button",
      className: "btn btn-sm btn-link",
      onClick: this.handleRemove
    }, H.span({
      className: "glyphicon glyphicon-remove"
    })) : void 0);
  };

  return ScalarExprComponent;

})(React.Component);
