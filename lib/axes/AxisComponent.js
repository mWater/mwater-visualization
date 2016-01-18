var AxisBuilder, AxisComponent, BinsComponent, ExprCompiler, ExprComponent, ExprUtils, H, LinkComponent, NumberComponent, R, React, ui, update,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

ExprComponent = require("mwater-expressions-ui").ExprComponent;

ExprUtils = require('mwater-expressions').ExprUtils;

ExprCompiler = require('mwater-expressions').ExprCompiler;

LinkComponent = require('mwater-expressions-ui').LinkComponent;

AxisBuilder = require('./AxisBuilder');

update = require('update-object');

ui = require('../UIComponents');

module.exports = AxisComponent = (function(superClass) {
  extend(AxisComponent, superClass);

  function AxisComponent() {
    this.handleXformChange = bind(this.handleXformChange, this);
    this.handleXformTypeChange = bind(this.handleXformTypeChange, this);
    this.handleAggrChange = bind(this.handleAggrChange, this);
    this.handleExprChange = bind(this.handleExprChange, this);
    return AxisComponent.__super__.constructor.apply(this, arguments);
  }

  AxisComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    table: React.PropTypes.string.isRequired,
    types: React.PropTypes.array,
    aggrNeed: React.PropTypes.oneOf(['none', 'optional', 'required']).isRequired,
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    required: React.PropTypes.bool
  };

  AxisComponent.contextTypes = {
    locale: React.PropTypes.string
  };

  AxisComponent.prototype.handleExprChange = function(expr) {
    if (!expr) {
      this.props.onChange(null);
      return;
    }
    return this.props.onChange({
      expr: expr,
      xform: null,
      aggr: null
    });
  };

  AxisComponent.prototype.handleAggrChange = function(aggr) {
    return this.props.onChange(update(this.props.value, {
      $merge: {
        aggr: aggr
      }
    }));
  };

  AxisComponent.prototype.handleXformTypeChange = function(type) {
    if (type) {
      return this.props.onChange(update(this.props.value, {
        $merge: {
          xform: {
            type: type
          }
        }
      }));
    } else {
      return this.props.onChange(_.omit(this.props.value, "xform"));
    }
  };

  AxisComponent.prototype.handleXformChange = function(xform) {
    return this.props.onChange(update(this.props.value, {
      xform: {
        $set: xform
      }
    }));
  };

  AxisComponent.prototype.renderAggr = function() {
    var aggrs, currentAggr, exprUtils;
    if (this.props.aggrNeed === "none") {
      return;
    }
    exprUtils = new ExprUtils(this.props.schema);
    if (this.props.value && exprUtils.getExprType(this.props.value.expr) !== "count") {
      exprUtils = new ExprUtils(this.props.schema);
      aggrs = exprUtils.getAggrs(this.props.value.expr);
      aggrs = _.filter(aggrs, function(aggr) {
        return aggr.id !== "last";
      });
      currentAggr = _.findWhere(aggrs, {
        id: this.props.value.aggr
      });
      return React.createElement(LinkComponent, {
        dropdownItems: aggrs,
        onDropdownItemClicked: this.handleAggrChange
      }, currentAggr ? currentAggr.name : void 0);
    }
  };

  AxisComponent.prototype.renderBins = function() {
    return R(BinsComponent, {
      value: this.props.value.xform,
      onChange: this.handleXformChange
    });
  };

  AxisComponent.prototype.renderXform = function() {
    var exprType, exprUtils;
    if (!this.props.value) {
      return;
    }
    if (this.props.value.xform && this.props.value.xform.type === "bin") {
      return R(BinsComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        expr: this.props.value.expr,
        xform: this.props.value.xform,
        onChange: this.handleXformChange
      });
    }
    exprUtils = new ExprUtils(this.props.schema);
    exprType = exprUtils.getExprType(this.props.value.expr);
    switch (exprType) {
      case "date":
        return R(ui.ButtonToggleComponent, {
          value: this.props.value.xform ? this.props.value.xform.type : null,
          options: [
            {
              value: null,
              label: "Exact Date"
            }, {
              value: "year",
              label: "Year"
            }, {
              value: "yearmonth",
              label: "Year/Month"
            }, {
              value: "month",
              label: "Month"
            }
          ],
          onChange: this.handleXformTypeChange
        });
      case "datetime":
        return R(ui.ButtonToggleComponent, {
          value: this.props.value.xform ? this.props.value.xform.type : null,
          options: [
            {
              value: "date",
              label: "Date"
            }, {
              value: "year",
              label: "Year"
            }, {
              value: "yearmonth",
              label: "Year/Month"
            }, {
              value: "month",
              label: "Month"
            }
          ],
          onChange: this.handleXformTypeChange
        });
    }
  };

  AxisComponent.prototype.render = function() {
    var axisBuilder;
    axisBuilder = new AxisBuilder({
      schema: this.props.schema
    });
    return H.div(null, H.div(null, this.renderAggr(), React.createElement(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      types: axisBuilder.getExprTypes(this.props.types, this.props.aggrNeed),
      onChange: this.handleExprChange,
      includeCount: this.props.aggrNeed !== "none",
      value: this.props.value ? this.props.value.expr : void 0
    })), this.renderXform());
  };

  return AxisComponent;

})(React.Component);

BinsComponent = (function(superClass) {
  extend(BinsComponent, superClass);

  function BinsComponent() {
    return BinsComponent.__super__.constructor.apply(this, arguments);
  }

  BinsComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    expr: React.PropTypes.object.isRequired,
    xform: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  BinsComponent.prototype.componentDidMount = function() {
    var axisBuilder, minMaxQuery;
    if ((this.props.xform.min == null) || (this.props.xform.max == null)) {
      axisBuilder = new AxisBuilder({
        schema: this.props.schema
      });
      minMaxQuery = axisBuilder.compileBinMinMax(this.props.expr, this.props.expr.table, null, this.props.xform.numBins);
      return this.props.dataSource.performQuery(minMaxQuery, (function(_this) {
        return function(error, rows) {
          var max, min;
          if (_this.unmounted) {
            return;
          }
          if (error) {
            return;
          }
          if (rows[0].min != null) {
            min = parseFloat(rows[0].min);
            max = parseFloat(rows[0].max);
          }
          return _this.props.onChange(update(_this.props.xform, {
            min: {
              $set: min
            },
            max: {
              $set: max
            }
          }));
        };
      })(this));
    }
  };

  BinsComponent.prototype.componentWillUnmount = function() {
    return this.unmounted = true;
  };

  BinsComponent.prototype.render = function() {
    return H.div(null, R(NumberComponent, {
      key: "min",
      label: "Min:",
      value: this.props.xform.min,
      onChange: (function(_this) {
        return function(v) {
          return _this.props.onChange(update(_this.props.xform, {
            min: {
              $set: v
            }
          }));
        };
      })(this)
    }), " ", R(NumberComponent, {
      key: "max",
      label: "Max:",
      value: this.props.xform.max,
      onChange: (function(_this) {
        return function(v) {
          return _this.props.onChange(update(_this.props.xform, {
            max: {
              $set: v
            }
          }));
        };
      })(this)
    }), " ", R(NumberComponent, {
      key: "numBins",
      label: "Bins:",
      value: this.props.xform.numBins,
      onChange: (function(_this) {
        return function(v) {
          return _this.props.onChange(update(_this.props.xform, {
            numBins: {
              $set: v
            }
          }));
        };
      })(this)
    }));
  };

  return BinsComponent;

})(React.Component);

NumberComponent = (function(superClass) {
  extend(NumberComponent, superClass);

  function NumberComponent() {
    this.handleChange = bind(this.handleChange, this);
    return NumberComponent.__super__.constructor.apply(this, arguments);
  }

  NumberComponent.propTypes = {
    label: React.PropTypes.node,
    value: React.PropTypes.number,
    onChange: React.PropTypes.func.isRequired,
    integer: React.PropTypes.bool
  };

  NumberComponent.prototype.handleChange = function(ev) {
    var number;
    if (this.props.integer) {
      number = parseInt(ev.target.value);
    } else {
      number = parseFloat(ev.target.value);
    }
    if (_.isNaN(number)) {
      return this.props.onChange(null);
    } else {
      return this.props.onChange(number);
    }
  };

  NumberComponent.prototype.render = function() {
    return H.div({
      style: {
        display: "inline-block"
      }
    }, H.label({
      className: "text-muted"
    }, this.props.label), H.input({
      type: "number",
      step: (this.props.integer ? "1" : "any"),
      value: this.props.value,
      onChange: this.handleChange,
      className: "form-control input-sm",
      style: {
        width: "8em",
        display: "inline-block",
        marginLeft: 5
      }
    }));
  };

  return NumberComponent;

})(React.Component);
