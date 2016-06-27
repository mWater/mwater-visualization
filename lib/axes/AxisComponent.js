var AxisBuilder, AxisColorEditorComponent, AxisComponent, BinsComponent, ColorMapComponent, ExprCompiler, ExprComponent, ExprUtils, H, LinkComponent, R, RangesComponent, React, ui, update, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

uuid = require('node-uuid');

ExprComponent = require("mwater-expressions-ui").ExprComponent;

ExprUtils = require('mwater-expressions').ExprUtils;

ExprCompiler = require('mwater-expressions').ExprCompiler;

LinkComponent = require('mwater-expressions-ui').LinkComponent;

AxisBuilder = require('./AxisBuilder');

update = require('update-object');

ui = require('../UIComponents');

ColorMapComponent = require('./ColorMapComponent');

BinsComponent = require('./BinsComponent');

RangesComponent = require('./RangesComponent');

AxisColorEditorComponent = require('./AxisColorEditorComponent');

module.exports = AxisComponent = (function(superClass) {
  extend(AxisComponent, superClass);

  function AxisComponent() {
    this.handleXformChange = bind(this.handleXformChange, this);
    this.handleXformTypeChange = bind(this.handleXformTypeChange, this);
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
    required: React.PropTypes.bool,
    showColorMap: React.PropTypes.bool,
    colorMapOptional: React.PropTypes.bool
  };

  AxisComponent.defaultProps = {
    colorMapOptional: false
  };

  AxisComponent.contextTypes = {
    locale: React.PropTypes.string
  };

  AxisComponent.prototype.handleExprChange = function(expr) {
    if (!expr) {
      this.props.onChange(null);
      return;
    }
    return this.props.onChange(this.cleanAxis(_.extend({}, this.props.value, {
      expr: expr
    })));
  };

  AxisComponent.prototype.handleXformTypeChange = function(type) {
    var end, i, j, max, min, numBins, ranges, ref, ref1, start, xform;
    if (!type) {
      this.props.onChange(_.omit(this.props.value, "xform"));
    }
    if (type === "ranges" && ((ref = this.props.value.xform) != null ? ref.type : void 0) === "bin" && (this.props.value.xform.min != null) && (this.props.value.xform.max != null) && this.props.value.xform.min !== this.props.value.xform.max && this.props.value.xform.numBins) {
      min = this.props.value.xform.min;
      max = this.props.value.xform.max;
      numBins = this.props.value.xform.numBins;
      ranges = [
        {
          id: uuid.v4(),
          maxValue: min,
          minOpen: false,
          maxOpen: true
        }
      ];
      for (i = j = 1, ref1 = numBins; 1 <= ref1 ? j <= ref1 : j >= ref1; i = 1 <= ref1 ? ++j : --j) {
        start = (i - 1) / numBins * (max - min) + min;
        end = i / numBins * (max - min) + min;
        ranges.push({
          id: uuid.v4(),
          minValue: start,
          minOpen: false,
          maxValue: end,
          maxOpen: true
        });
      }
      ranges.push({
        id: uuid.v4(),
        minValue: max,
        minOpen: true,
        maxOpen: true
      });
      xform = {
        type: "ranges",
        ranges: ranges
      };
    } else {
      xform = {
        type: type
      };
    }
    return this.props.onChange(update(this.props.value, {
      xform: {
        $set: xform
      }
    }));
  };

  AxisComponent.prototype.handleXformChange = function(xform) {
    return this.props.onChange(this.cleanAxis(update(this.props.value, {
      xform: {
        $set: xform
      }
    })));
  };

  AxisComponent.prototype.cleanAxis = function(axis) {
    var axisBuilder;
    axisBuilder = new AxisBuilder({
      schema: this.props.schema
    });
    return axisBuilder.cleanAxis({
      axis: axis,
      table: this.props.table,
      aggrNeed: this.props.aggrNeed,
      types: this.props.types
    });
  };

  AxisComponent.prototype.renderXform = function(axis) {
    var comp, exprType, exprUtils, ref;
    if (!axis) {
      return;
    }
    if (axis.xform && ((ref = axis.xform.type) === "bin" || ref === "ranges")) {
      if (axis.xform.type === "ranges") {
        comp = R(RangesComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          expr: axis.expr,
          xform: axis.xform,
          onChange: this.handleXformChange
        });
      } else {
        comp = R(BinsComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          expr: axis.expr,
          xform: axis.xform,
          onChange: this.handleXformChange
        });
      }
      return H.div(null, R(ui.ButtonToggleComponent, {
        value: axis.xform ? axis.xform.type : null,
        options: [
          {
            value: "bin",
            label: "Equal Bins"
          }, {
            value: "ranges",
            label: "Custom Ranges"
          }
        ],
        onChange: this.handleXformTypeChange
      }), comp);
    }
    exprUtils = new ExprUtils(this.props.schema);
    exprType = exprUtils.getExprType(axis.expr);
    switch (exprType) {
      case "date":
        return R(ui.ButtonToggleComponent, {
          value: axis.xform ? axis.xform.type : null,
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
          value: axis.xform ? axis.xform.type : null,
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

  AxisComponent.prototype.renderColorMap = function(axis) {
    if (!this.props.showColorMap || !axis || !axis.expr) {
      return null;
    }
    return R(AxisColorEditorComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      axis: axis,
      onChange: this.props.onChange,
      colorMapOptional: this.props.colorMapOptional
    });
  };

  AxisComponent.prototype.render = function() {
    var aggrStatuses, axis, axisBuilder;
    axisBuilder = new AxisBuilder({
      schema: this.props.schema
    });
    axis = this.cleanAxis(this.props.value);
    switch (this.props.aggrNeed) {
      case "none":
        aggrStatuses = ["literal", "individual"];
        break;
      case "optional":
        aggrStatuses = ["literal", "individual", "aggregate"];
        break;
      case "required":
        aggrStatuses = ["literal", "aggregate"];
    }
    return H.div(null, H.div(null, React.createElement(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      types: axisBuilder.getExprTypes(this.props.types),
      onChange: this.handleExprChange,
      value: this.props.value ? this.props.value.expr : void 0,
      aggrStatuses: aggrStatuses
    })), this.renderXform(axis), H.br(), this.renderColorMap(axis));
  };

  return AxisComponent;

})(React.Component);
