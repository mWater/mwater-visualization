var ActionCancelModalComponent, ExprComponent, ExprItemEditorComponent, ExprUpdateModalComponent, ExprUtils, H, PropTypes, R, React, TableSelectComponent,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

R = React.createElement;

ExprUtils = require("mwater-expressions").ExprUtils;

ExprComponent = require("mwater-expressions-ui").ExprComponent;

ActionCancelModalComponent = require("react-library/lib/ActionCancelModalComponent");

TableSelectComponent = require('../../TableSelectComponent');

ExprItemEditorComponent = require('./ExprItemEditorComponent');

module.exports = ExprUpdateModalComponent = (function(superClass) {
  extend(ExprUpdateModalComponent, superClass);

  ExprUpdateModalComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    singleRowTable: PropTypes.string
  };

  function ExprUpdateModalComponent() {
    ExprUpdateModalComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      open: false,
      exprItem: null,
      onUpdate: null
    };
  }

  ExprUpdateModalComponent.prototype.open = function(item, onUpdate) {
    return this.setState({
      open: true,
      exprItem: item,
      onUpdate: onUpdate
    });
  };

  ExprUpdateModalComponent.prototype.render = function() {
    if (!this.state.open) {
      return null;
    }
    return R(ActionCancelModalComponent, {
      actionLabel: "Update",
      onAction: (function(_this) {
        return function() {
          return _this.setState({
            open: false
          }, function() {
            return _this.state.onUpdate(_this.state.exprItem);
          });
        };
      })(this),
      onCancel: (function(_this) {
        return function() {
          return _this.setState({
            open: false
          });
        };
      })(this),
      title: "Update Field"
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

  return ExprUpdateModalComponent;

})(React.Component);
