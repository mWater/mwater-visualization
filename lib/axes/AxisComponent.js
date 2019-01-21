var AsyncLoadComponent, AxisBuilder, AxisColorEditorComponent, AxisComponent, BinsComponent, CategoryMapComponent, ExprCompiler, ExprComponent, ExprUtils, LinkComponent, PropTypes, R, RangesComponent, React, injectTableAlias, ui, update, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

uuid = require('uuid');

AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent');

ExprComponent = require("mwater-expressions-ui").ExprComponent;

ExprUtils = require('mwater-expressions').ExprUtils;

ExprCompiler = require('mwater-expressions').ExprCompiler;

LinkComponent = require('mwater-expressions-ui').LinkComponent;

AxisBuilder = require('./AxisBuilder');

update = require('update-object');

ui = require('../UIComponents');

BinsComponent = require('./BinsComponent');

RangesComponent = require('./RangesComponent');

AxisColorEditorComponent = require('./AxisColorEditorComponent');

CategoryMapComponent = require('./CategoryMapComponent');

injectTableAlias = require('mwater-expressions').injectTableAlias;

module.exports = AxisComponent = (function(superClass) {
  extend(AxisComponent, superClass);

  AxisComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    table: PropTypes.string.isRequired,
    types: PropTypes.array,
    aggrNeed: PropTypes.oneOf(['none', 'optional', 'required']).isRequired,
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    required: PropTypes.bool,
    showColorMap: PropTypes.bool,
    reorderable: PropTypes.bool,
    autosetColors: PropTypes.bool,
    allowExcludedValues: PropTypes.bool,
    defaultColor: PropTypes.string,
    showFormat: PropTypes.bool,
    filters: PropTypes.array
  };

  AxisComponent.defaultProps = {
    reorderable: false,
    allowExcludedValues: false,
    autosetColors: true
  };

  AxisComponent.contextTypes = {
    locale: PropTypes.string
  };

  function AxisComponent(props) {
    this.handleXformChange = bind(this.handleXformChange, this);
    this.handleXformTypeChange = bind(this.handleXformTypeChange, this);
    this.handleFormatChange = bind(this.handleFormatChange, this);
    this.handleExprChange = bind(this.handleExprChange, this);
    AxisComponent.__super__.constructor.call(this, props);
    this.state = {
      categories: null
    };
  }

  AxisComponent.prototype.isLoadNeeded = function(newProps, oldProps) {
    var filtersChanged, hasColorChanged;
    hasColorChanged = !_.isEqual(_.omit(newProps.value, ["colorMap", "drawOrder"]), _.omit(oldProps.value, ["colorMap", "drawOrder"]));
    filtersChanged = !_.isEqual(newProps.filters, oldProps.filters);
    return hasColorChanged || filtersChanged;
  };

  AxisComponent.prototype.load = function(props, prevProps, callback) {
    var axis, axisBuilder, categories, filters, valuesQuery, whereClauses;
    axisBuilder = new AxisBuilder({
      schema: props.schema
    });
    axis = axisBuilder.cleanAxis({
      axis: props.value,
      table: props.table,
      types: props.types,
      aggrNeed: props.aggrNeed
    });
    if (!axis || axisBuilder.validateAxis({
      axis: axis
    })) {
      return;
    }
    categories = axisBuilder.getCategories(axis);
    if (_.any(categories, function(category) {
      return category.value != null;
    })) {
      callback({
        categories: categories
      });
      return;
    }
    if (axisBuilder.isAxisAggr(axis)) {
      callback({
        categories: []
      });
      return;
    }
    if (!axis.expr.table) {
      callback({
        categories: []
      });
      return;
    }
    valuesQuery = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: axisBuilder.compileAxis({
            axis: axis,
            tableAlias: "main"
          }),
          alias: "val"
        }
      ],
      from: {
        type: "table",
        table: axis.expr.table,
        alias: "main"
      },
      groupBy: [1],
      limit: 50
    };
    filters = _.where(this.props.filters || [], {
      table: axis.expr.table
    });
    whereClauses = _.map(filters, function(f) {
      return injectTableAlias(f.jsonql, "main");
    });
    whereClauses = _.compact(whereClauses);
    if (whereClauses.length > 1) {
      valuesQuery.where = {
        type: "op",
        op: "and",
        exprs: whereClauses
      };
    } else {
      valuesQuery.where = whereClauses[0];
    }
    return props.dataSource.performQuery(valuesQuery, (function(_this) {
      return function(error, rows) {
        if (error) {
          return;
        }
        categories = axisBuilder.getCategories(axis, _.pluck(rows, "val"));
        return callback({
          categories: categories
        });
      };
    })(this));
  };

  AxisComponent.prototype.handleExprChange = function(expr) {
    if (!expr) {
      this.props.onChange(null);
      return;
    }
    return this.props.onChange(this.cleanAxis(_.extend({}, _.omit(this.props.value, ["drawOrder"]), {
      expr: expr
    })));
  };

  AxisComponent.prototype.handleFormatChange = function(ev) {
    return this.props.onChange(_.extend({}, this.props.value, {
      format: ev.target.value
    }));
  };

  AxisComponent.prototype.handleXformTypeChange = function(type) {
    var end, i, j, max, min, numBins, ranges, ref, ref1, start, xform;
    if (!type) {
      this.props.onChange(_.omit(this.props.value, ["xform", "colorMap", "drawOrder"]));
    }
    if (type === "ranges" && ((ref = this.props.value.xform) != null ? ref.type : void 0) === "bin" && (this.props.value.xform.min != null) && (this.props.value.xform.max != null) && this.props.value.xform.min !== this.props.value.xform.max && this.props.value.xform.numBins) {
      min = this.props.value.xform.min;
      max = this.props.value.xform.max;
      numBins = this.props.value.xform.numBins;
      ranges = [
        {
          id: uuid(),
          maxValue: min,
          minOpen: false,
          maxOpen: true
        }
      ];
      for (i = j = 1, ref1 = numBins; 1 <= ref1 ? j <= ref1 : j >= ref1; i = 1 <= ref1 ? ++j : --j) {
        start = (i - 1) / numBins * (max - min) + min;
        end = i / numBins * (max - min) + min;
        ranges.push({
          id: uuid(),
          minValue: start,
          minOpen: false,
          maxValue: end,
          maxOpen: true
        });
      }
      ranges.push({
        id: uuid(),
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
    return this.props.onChange(update(_.omit(this.props.value, ["colorMap", "drawOrder"]), {
      xform: {
        $set: xform
      }
    }));
  };

  AxisComponent.prototype.handleXformChange = function(xform) {
    return this.props.onChange(this.cleanAxis(update(_.omit(this.props.value, ["drawOrder"]), {
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
      return R('div', null, R(ui.ButtonToggleComponent, {
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
            }, {
              value: "week",
              label: "Week"
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
            }, {
              value: "week",
              label: "Week"
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
    return [
      R('br'), R(AxisColorEditorComponent, {
        schema: this.props.schema,
        axis: axis,
        categories: this.state.categories,
        onChange: this.props.onChange,
        reorderable: this.props.reorderable,
        defaultColor: this.props.defaultColor,
        allowExcludedValues: this.props.allowExcludedValues,
        autosetColors: this.props.autosetColors,
        initiallyExpanded: true
      })
    ];
  };

  AxisComponent.prototype.renderExcludedValues = function(axis) {
    if (this.props.showColorMap || !axis || !axis.expr || !this.props.allowExcludedValues) {
      return null;
    }
    if (!this.state.categories || this.state.categories.length < 1) {
      return null;
    }
    return [
      R('br'), R(CategoryMapComponent, {
        schema: this.props.schema,
        axis: axis,
        onChange: this.props.onChange,
        categories: this.state.categories,
        reorderable: false,
        showColorMap: false,
        allowExcludedValues: true,
        initiallyExpanded: true
      })
    ];
  };

  AxisComponent.prototype.renderFormat = function(axis) {
    var formats;
    formats = [
      {
        value: ",",
        label: "Normal: 1,234.567"
      }, {
        value: "",
        label: "Plain: 1234.567"
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
    return R('div', {
      className: "form-group"
    }, R('label', {
      className: "text-muted"
    }, "Format"), ": ", R('select', {
      value: (axis.format != null ? axis.format : ","),
      className: "form-control",
      style: {
        width: "auto",
        display: "inline-block"
      },
      onChange: this.handleFormatChange
    }, _.map(formats, function(format) {
      return R('option', {
        key: format.value,
        value: format.value
      }, format.label);
    })));
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
    return R('div', null, R('div', null, R(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      types: axisBuilder.getExprTypes(this.props.types),
      onChange: this.handleExprChange,
      value: this.props.value ? this.props.value.expr : void 0,
      aggrStatuses: aggrStatuses
    })), this.renderXform(axis), this.props.showFormat && axisBuilder.getAxisType(axis) === "number" ? this.renderFormat(axis) : void 0, this.renderColorMap(axis), this.renderExcludedValues(axis));
  };

  return AxisComponent;

})(AsyncLoadComponent);
