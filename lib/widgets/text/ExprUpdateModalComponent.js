var ActionCancelModalComponent, ExprComponent, ExprUpdateModalComponent, ExprUtils, H, R, React, TableSelectComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

ExprUtils = require("mwater-expressions").ExprUtils;

ExprComponent = require("mwater-expressions-ui").ExprComponent;

ActionCancelModalComponent = require("react-library/lib/ActionCancelModalComponent");

TableSelectComponent = require('../../TableSelectComponent');

module.exports = ExprUpdateModalComponent = (function(superClass) {
  extend(ExprUpdateModalComponent, superClass);

  ExprUpdateModalComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired
  };

  function ExprUpdateModalComponent() {
    this.handleTableChange = bind(this.handleTableChange, this);
    ExprUpdateModalComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      open: false,
      expr: null,
      table: null,
      onUpdate: null
    };
  }

  ExprUpdateModalComponent.prototype.open = function(expr, onUpdate) {
    return this.setState({
      open: true,
      table: expr.table,
      expr: expr,
      onUpdate: onUpdate
    });
  };

  ExprUpdateModalComponent.prototype.handleTableChange = function(table) {
    return this.setState({
      table: table
    });
  };

  ExprUpdateModalComponent.prototype.renderContents = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.i({
      className: "fa fa-database"
    }), " ", "Data Source"), ": ", R(TableSelectComponent, {
      schema: this.props.schema,
      value: this.state.table,
      onChange: this.handleTableChange
    }), this.state.table ? H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Field"), ": ", R(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.state.table,
      types: ['text', 'number', 'enum', 'date', 'datetime', 'boolean'],
      value: this.state.expr,
      aggrStatuses: ["literal", "aggregate"],
      onChange: (function(_this) {
        return function(expr) {
          return _this.setState({
            expr: expr
          });
        };
      })(this)
    })) : void 0);
  };

  ExprUpdateModalComponent.prototype.render = function() {
    if (!this.state.open) {
      return null;
    }
    return R(ActionCancelModalComponent, {
      size: "large",
      actionLabel: "Update",
      onAction: (function(_this) {
        return function() {
          return _this.setState({
            open: false
          }, function() {
            return _this.state.onUpdate(_this.state.expr);
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
    }, this.renderContents());
  };

  return ExprUpdateModalComponent;

})(React.Component);
