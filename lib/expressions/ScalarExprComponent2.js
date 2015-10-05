var EditableLinkComponent, ExpressionBuilder, H, R, React, ScalarExprComponent2, ScalarExprEditorComponent, ui,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

ScalarExprEditorComponent = require('./ScalarExprEditorComponent');

ExpressionBuilder = require('./ExpressionBuilder');

EditableLinkComponent = require('./../EditableLinkComponent');

ui = require('../UIComponents');

module.exports = ScalarExprComponent2 = (function(superClass) {
  extend(ScalarExprComponent2, superClass);

  ScalarExprComponent2.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    table: React.PropTypes.string.isRequired,
    types: React.PropTypes.array,
    includeCount: React.PropTypes.bool,
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    preventRemove: React.PropTypes.bool,
    editorInitiallyOpen: React.PropTypes.bool
  };

  function ScalarExprComponent2(props) {
    this.handleChange = bind(this.handleChange, this);
    this.handleRemove = bind(this.handleRemove, this);
    ScalarExprComponent2.__super__.constructor.apply(this, arguments);
    if (props.editorInitiallyOpen) {
      this.state = {
        editorValue: props.value,
        editorOpen: true
      };
    } else {
      this.state = {
        editorValue: null,
        editorOpen: false
      };
    }
  }

  ScalarExprComponent2.prototype.handleRemove = function() {
    this.refs.editToggle.close();
    return this.props.onChange(null);
  };

  ScalarExprComponent2.prototype.handleChange = function(value) {
    this.refs.editToggle.close();
    return this.props.onChange(value);
  };

  ScalarExprComponent2.prototype.render = function() {
    var editor, exprBuilder, summary;
    exprBuilder = new ExpressionBuilder(this.props.schema);
    if (this.props.value) {
      summary = exprBuilder.summarizeExpr(this.props.value);
    } else {
      summary = H.i(null, "None");
    }
    editor = React.createElement(ScalarExprEditorComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      types: this.props.types,
      includeCount: this.props.includeCount,
      value: this.props.value,
      onChange: this.handleChange
    });
    return R(ui.ToggleEditComponent, {
      ref: "editToggle",
      forceOpen: this.props.preventRemove && !this.props.value,
      initiallyOpen: this.props.editorInitiallyOpen || (this.props.preventRemove && !this.props.value),
      label: summary,
      onRemove: !this.preventRemove && this.props.value ? this.handleRemove : void 0,
      editor: editor
    });
  };

  return ScalarExprComponent2;

})(React.Component);
