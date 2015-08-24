var ActionCancelModalComponent, EditableLinkComponent, ExpressionBuilder, H, React, ScalarExprComponent, ScalarExprEditorComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

ActionCancelModalComponent = require('./../ActionCancelModalComponent');

ScalarExprEditorComponent = require('./ScalarExprEditorComponent');

ExpressionBuilder = require('./ExpressionBuilder');

EditableLinkComponent = require('./../EditableLinkComponent');

module.exports = ScalarExprComponent = (function(superClass) {
  extend(ScalarExprComponent, superClass);

  ScalarExprComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    table: React.PropTypes.string,
    types: React.PropTypes.array,
    includeCount: React.PropTypes.bool,
    editorTitle: React.PropTypes.any,
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    preventRemove: React.PropTypes.bool,
    editorInitiallyOpen: React.PropTypes.bool
  };

  function ScalarExprComponent(props) {
    this.handleDropdownItemClicked = bind(this.handleDropdownItemClicked, this);
    this.handleRemove = bind(this.handleRemove, this);
    this.handleEditorSave = bind(this.handleEditorSave, this);
    this.handleEditorChange = bind(this.handleEditorChange, this);
    this.handleEditorCancel = bind(this.handleEditorCancel, this);
    this.handleEditorOpen = bind(this.handleEditorOpen, this);
    ScalarExprComponent.__super__.constructor.call(this, props);
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

  ScalarExprComponent.prototype.handleDropdownItemClicked = function(expr) {
    if (!expr) {
      return this.handleEditorOpen();
    } else {
      return this.props.onChange(expr);
    }
  };

  ScalarExprComponent.prototype.renderEditableLink = function() {
    var exprBuilder, linkProps, namedExprs, summary;
    exprBuilder = new ExpressionBuilder(this.props.schema);
    if (this.props.value) {
      summary = exprBuilder.summarizeExpr(this.props.value);
    }
    namedExprs = this.props.schema.getNamedExprs(this.props.table);
    linkProps = {
      onRemove: this.props.value && !this.props.preventRemove ? this.handleRemove : void 0
    };
    if (namedExprs.length === 0) {
      linkProps.onClick = this.handleEditorOpen;
    } else {
      linkProps.dropdownItems = _.map(namedExprs, (function(_this) {
        return function(ne) {
          return {
            id: ne.expr,
            name: ne.name
          };
        };
      })(this));
      linkProps.dropdownItems.push({
        id: null,
        name: null
      });
      linkProps.dropdownItems.push({
        id: null,
        name: "Advanced..."
      });
      linkProps.onDropdownItemClicked = this.handleDropdownItemClicked;
    }
    return React.createElement(EditableLinkComponent, linkProps, summary ? summary : H.i(null, "None"));
  };

  ScalarExprComponent.prototype.render = function() {
    var editor;
    if (this.state.editorOpen) {
      editor = React.createElement(ActionCancelModalComponent, {
        title: this.props.editorTitle,
        onAction: this.handleEditorSave,
        onCancel: this.handleEditorCancel
      }, React.createElement(ScalarExprEditorComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        table: this.props.table,
        types: this.props.types,
        includeCount: this.props.includeCount,
        value: this.state.editorValue,
        onChange: this.handleEditorChange
      }));
    }
    return H.div({
      style: {
        display: "inline-block"
      }
    }, editor, this.renderEditableLink());
  };

  return ScalarExprComponent;

})(React.Component);
