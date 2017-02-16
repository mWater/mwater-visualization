var ActionCancelModalComponent, ExprComponent, ExprInsertModalComponent, ExprItemEditorComponent, ExprUtils, H, R, React, TableSelectComponent, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

uuid = require('uuid');

ExprUtils = require("mwater-expressions").ExprUtils;

ExprComponent = require("mwater-expressions-ui").ExprComponent;

ActionCancelModalComponent = require("react-library/lib/ActionCancelModalComponent");

TableSelectComponent = require('../../TableSelectComponent');

ExprItemEditorComponent = require('./ExprItemEditorComponent');

module.exports = ExprInsertModalComponent = (function(superClass) {
  extend(ExprInsertModalComponent, superClass);

  ExprInsertModalComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    onInsert: React.PropTypes.func.isRequired,
    singleRowTable: React.PropTypes.string
  };

  function ExprInsertModalComponent() {
    this.handleInsert = bind(this.handleInsert, this);
    ExprInsertModalComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      open: false,
      exprItem: null
    };
  }

  ExprInsertModalComponent.prototype.open = function() {
    return this.setState({
      open: true,
      exprItem: {
        type: "expr",
        id: uuid()
      }
    });
  };

  ExprInsertModalComponent.prototype.handleInsert = function(ev) {
    if (!this.state.exprItem) {
      return;
    }
    return this.setState({
      open: false
    }, (function(_this) {
      return function() {
        return _this.props.onInsert(_this.state.exprItem);
      };
    })(this));
  };

  ExprInsertModalComponent.prototype.render = function() {
    if (!this.state.open) {
      return null;
    }
    return R(ActionCancelModalComponent, {
      actionLabel: "Insert",
      onAction: this.handleInsert,
      onCancel: (function(_this) {
        return function() {
          return _this.setState({
            open: false
          });
        };
      })(this),
      title: "Insert Field"
    }, R(ExprItemEditorComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      exprItem: this.state.exprItem,
      onChange: (function(_this) {
        return function(exprItem) {
          return _this.setState({
            exprItem: exprItem
          });
        };
      })(this),
      singleRowTable: this.props.singleRowTable
    }));
  };

  return ExprInsertModalComponent;

})(React.Component);
