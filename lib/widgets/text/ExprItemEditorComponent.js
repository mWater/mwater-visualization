var ExprComponent, ExprItemEditorComponent, ExprUtils, H, PropTypes, R, React, TableSelectComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

ExprUtils = require("mwater-expressions").ExprUtils;

ExprComponent = require("mwater-expressions-ui").ExprComponent;

TableSelectComponent = require('../../TableSelectComponent');

module.exports = ExprItemEditorComponent = (function(superClass) {
  extend(ExprItemEditorComponent, superClass);

  ExprItemEditorComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    exprItem: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    singleRowTable: PropTypes.string
  };

  function ExprItemEditorComponent(props) {
    this.handleFormatChange = bind(this.handleFormatChange, this);
    this.handleLabelTextChange = bind(this.handleLabelTextChange, this);
    this.handleIncludeLabelChange = bind(this.handleIncludeLabelChange, this);
    this.handleExprChange = bind(this.handleExprChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    var ref;
    ExprItemEditorComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      table: ((ref = props.exprItem.expr) != null ? ref.table : void 0) || props.singleRowTable
    };
  }

  ExprItemEditorComponent.prototype.handleTableChange = function(table) {
    return this.setState({
      table: table
    });
  };

  ExprItemEditorComponent.prototype.handleExprChange = function(expr) {
    var exprItem;
    exprItem = _.extend({}, this.props.exprItem, {
      expr: expr
    });
    return this.props.onChange(exprItem);
  };

  ExprItemEditorComponent.prototype.handleIncludeLabelChange = function(ev) {
    var exprItem;
    exprItem = _.extend({}, this.props.exprItem, {
      includeLabel: ev.target.checked,
      labelText: ev.target.checked ? this.props.exprItem.labelText : void 0
    });
    return this.props.onChange(exprItem);
  };

  ExprItemEditorComponent.prototype.handleLabelTextChange = function(ev) {
    var exprItem;
    exprItem = _.extend({}, this.props.exprItem, {
      labelText: ev.target.value || null
    });
    return this.props.onChange(exprItem);
  };

  ExprItemEditorComponent.prototype.handleFormatChange = function(ev) {
    var exprItem;
    exprItem = _.extend({}, this.props.exprItem, {
      format: ev.target.value || null
    });
    return this.props.onChange(exprItem);
  };

  ExprItemEditorComponent.prototype.render = function() {
    var exprUtils, formats;
    formats = [
      {
        value: "",
        label: "Normal: 1234.567"
      }, {
        value: ",.0f",
        label: "Rounded: 1,234"
      }, {
        value: ",.2f",
        label: "Two decimals: 1,234.56"
      }, {
        value: "$,.2f",
        label: "Currency: $1,234.56"
      }, {
        value: "$,.0f",
        label: "Currency rounded: $1,234"
      }, {
        value: ".0%",
        label: "Percent rounded: 12%"
      }
    ];
    exprUtils = new ExprUtils(this.props.schema);
    return H.div({
      style: {
        paddingBottom: 200
      }
    }, H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.i({
      className: "fa fa-database"
    }), " ", "Data Source"), ": ", R(TableSelectComponent, {
      schema: this.props.schema,
      value: this.state.table,
      onChange: this.handleTableChange
    }), H.br()), this.state.table ? H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Field"), ": ", R(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.state.table,
      types: ['text', 'number', 'enum', 'date', 'datetime', 'boolean', 'enumset'],
      value: this.props.exprItem.expr,
      aggrStatuses: ["individual", "literal", "aggregate"],
      onChange: this.handleExprChange
    })) : void 0, this.state.table && this.props.exprItem.expr ? H.div({
      className: "form-group"
    }, H.label({
      key: "includeLabel"
    }, H.input({
      type: "checkbox",
      checked: this.props.exprItem.includeLabel,
      onChange: this.handleIncludeLabelChange
    }), " Include Label"), this.props.exprItem.includeLabel ? H.input({
      key: "labelText",
      className: "form-control",
      type: "text",
      value: this.props.exprItem.labelText || "",
      onChange: this.handleLabelTextChange,
      placeholder: new ExprUtils(this.props.schema).summarizeExpr(this.props.exprItem.expr) + ": "
    }) : void 0) : void 0, this.props.exprItem.expr && exprUtils.getExprType(this.props.exprItem.expr) === "number" ? H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Format"), ": ", H.select({
      value: this.props.exprItem.format || "",
      className: "form-control",
      style: {
        width: "auto",
        display: "inline-block"
      },
      onChange: this.handleFormatChange
    }, _.map(formats, function(format) {
      return H.option({
        key: format.value,
        value: format.value
      }, format.label);
    }))) : void 0);
  };

  return ExprItemEditorComponent;

})(React.Component);
