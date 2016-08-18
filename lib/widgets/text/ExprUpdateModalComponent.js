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
    dataSource: React.PropTypes.object.isRequired,
    singleRowTable: React.PropTypes.string
  };

  function ExprUpdateModalComponent() {
    this.handleTableChange = bind(this.handleTableChange, this);
    ExprUpdateModalComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      open: false,
      id: null,
      expr: null,
      table: null,
      includeLabel: false,
      labelText: null
    };
  }

  ExprUpdateModalComponent.prototype.open = function(item, onUpdate) {
    return this.setState({
      open: true,
      id: item.id,
      expr: item.expr,
      table: item.expr.table,
      includeLabel: item.includeLabel,
      labelText: item.labelText,
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
    }), H.br(), this.state.table ? H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Field"), ": ", R(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.state.table,
      types: ['text', 'number', 'enum', 'date', 'datetime', 'boolean'],
      value: this.state.expr,
      aggrStatuses: this.state.table === this.props.singleRowTable ? ["individual", "literal"] : ['literal', "aggregate"],
      onChange: (function(_this) {
        return function(expr) {
          return _this.setState({
            expr: expr
          });
        };
      })(this)
    })) : void 0, this.state.table && this.state.expr ? H.label({
      key: "includeLabel"
    }, H.input({
      type: "checkbox",
      checked: this.state.includeLabel,
      onChange: (function(_this) {
        return function(ev) {
          return _this.setState({
            includeLabel: ev.target.checked
          });
        };
      })(this)
    }), " Include Label") : void 0, this.state.table && this.state.expr && this.state.includeLabel ? H.input({
      key: "labelText",
      className: "form-control",
      type: "text",
      value: this.state.labelText || "",
      onChange: (function(_this) {
        return function(ev) {
          return _this.setState({
            labelText: ev.target.value || null
          });
        };
      })(this),
      placeholder: new ExprUtils(this.props.schema).summarizeExpr(this.state.expr) + ": "
    }) : void 0);
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
            return _this.state.onUpdate({
              type: "expr",
              id: _this.state.id,
              expr: _this.state.expr,
              includeLabel: _this.state.includeLabel,
              labelText: _this.state.labelText
            });
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
