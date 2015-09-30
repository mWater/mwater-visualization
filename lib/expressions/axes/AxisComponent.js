var AxisBuilder, AxisComponent, ButtonToggleComponent, EditableLinkComponent, ExpressionBuilder, ExpressionCompiler, H, R, React, ScalarExprComponent, update,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

ScalarExprComponent = require('../ScalarExprComponent');

ExpressionBuilder = require('../ExpressionBuilder');

ExpressionCompiler = require('../ExpressionCompiler');

EditableLinkComponent = require('../../EditableLinkComponent');

AxisBuilder = require('./AxisBuilder');

update = require('update-object');

module.exports = AxisComponent = (function(superClass) {
  extend(AxisComponent, superClass);

  function AxisComponent() {
    this.handleXformTypeChange = bind(this.handleXformTypeChange, this);
    this.handleAggrChange = bind(this.handleAggrChange, this);
    this.handleExprChange = bind(this.handleExprChange, this);
    return AxisComponent.__super__.constructor.apply(this, arguments);
  }

  AxisComponent.propTypes = {
    editorTitle: React.PropTypes.any.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    table: React.PropTypes.string.isRequired,
    types: React.PropTypes.array,
    aggrNeed: React.PropTypes.oneOf(['none', 'optional', 'required']).isRequired,
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired
  };

  AxisComponent.prototype.componentDidMount = function() {
    return this.checkMinMaxComputation(this.props);
  };

  AxisComponent.prototype.componentWillReceiveProps = function(nextProps) {
    return this.checkMinMaxComputation(nextProps);
  };

  AxisComponent.prototype.checkMinMaxComputation = function(props) {
    var expr, exprCompiler, numBins, query, value;
    exprCompiler = new ExpressionCompiler(props.schema);
    value = props.value;
    if (value && value.xform && value.xform.type === "bin" && ((value.xform.min == null) || (value.xform.max == null))) {
      numBins = value.xform.numBins;
      expr = exprCompiler.compileExpr({
        expr: value.expr,
        tableAlias: "main"
      });
      query = {
        type: "query",
        selects: [
          {
            type: "select",
            expr: {
              type: "op",
              op: "min",
              exprs: [
                {
                  type: "field",
                  tableAlias: "inner",
                  column: "val"
                }
              ]
            },
            alias: "min"
          }, {
            type: "select",
            expr: {
              type: "op",
              op: "max",
              exprs: [
                {
                  type: "field",
                  tableAlias: "inner",
                  column: "val"
                }
              ]
            },
            alias: "max"
          }
        ],
        from: {
          type: "subquery",
          query: {
            type: "query",
            selects: [
              {
                type: "select",
                expr: expr,
                alias: "val"
              }, {
                type: "select",
                expr: {
                  type: "op",
                  op: "ntile",
                  exprs: [numBins + 2]
                },
                over: {
                  orderBy: [
                    {
                      expr: expr,
                      direction: "asc"
                    }
                  ]
                },
                alias: "ntilenum"
              }
            ],
            from: {
              type: "table",
              table: props.table,
              alias: "main"
            },
            where: {
              type: "op",
              op: "is not null",
              exprs: [expr]
            }
          },
          alias: "inner"
        },
        where: {
          type: "op",
          op: "between",
          exprs: [
            {
              type: "field",
              tableAlias: "inner",
              column: "ntilenum"
            }, 2, numBins + 1
          ]
        }
      };
      return props.dataSource.performQuery(query, (function(_this) {
        return function(error, rows) {
          if (!error && rows.length > 0) {
            if (value === props.value && rows[0].min && rows[0].min !== rows[0].max) {
              return props.onChange(update(value, {
                xform: {
                  min: {
                    $set: parseFloat(rows[0].min)
                  },
                  max: {
                    $set: parseFloat(rows[0].max)
                  }
                }
              }));
            }
          }
        };
      })(this));
    }
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

  AxisComponent.prototype.renderAggr = function() {
    var aggrs, currentAggr, exprBuilder;
    if (this.props.aggrNeed === "none") {
      return;
    }
    exprBuilder = new ExpressionBuilder(this.props.schema);
    if (this.props.value && exprBuilder.getExprType(this.props.value.expr) !== "count") {
      exprBuilder = new ExpressionBuilder(this.props.schema);
      aggrs = exprBuilder.getAggrs(this.props.value.expr);
      aggrs = _.filter(aggrs, function(aggr) {
        return aggr.id !== "last";
      });
      currentAggr = _.findWhere(aggrs, {
        id: this.props.value.aggr
      });
      return React.createElement(EditableLinkComponent, {
        dropdownItems: aggrs,
        onDropdownItemClicked: this.handleAggrChange
      }, currentAggr ? currentAggr.name : void 0);
    }
  };

  AxisComponent.prototype.renderXform = function() {
    var exprBuilder, exprType;
    if (!this.props.value) {
      return;
    }
    exprBuilder = new ExpressionBuilder(this.props.schema);
    exprType = exprBuilder.getExprType(this.props.value.expr);
    switch (exprType) {
      case "date":
        return R(ButtonToggleComponent, {
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
        return R(ButtonToggleComponent, {
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
    return H.div({
      style: {
        display: "inline-block"
      }
    }, H.div(null, this.renderAggr(), React.createElement(ScalarExprComponent, {
      editorTitle: this.props.editorTitle,
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

ButtonToggleComponent = (function(superClass) {
  extend(ButtonToggleComponent, superClass);

  function ButtonToggleComponent() {
    return ButtonToggleComponent.__super__.constructor.apply(this, arguments);
  }

  ButtonToggleComponent.propTypes = {
    value: React.PropTypes.any,
    options: React.PropTypes.arrayOf(React.PropTypes.shape({
      label: React.PropTypes.node.isRequired,
      value: React.PropTypes.any
    })).isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  ButtonToggleComponent.prototype.render = function() {
    return H.div({
      className: "btn-group btn-group-xs"
    }, _.map(this.props.options, (function(_this) {
      return function(option, i) {
        return H.button({
          type: "button",
          className: (option.value === _this.props.value ? "btn btn-primary active" : "btn btn-default"),
          onClick: _this.props.onChange.bind(null, option.value)
        }, option.label);
      };
    })(this)));
  };

  return ButtonToggleComponent;

})(React.Component);
