var AsyncLoadComponent, AxisBuilder, AxisColorEditorComponent, CategoryMapComponent, ColorPaletteCollectionComponent, H, R, React, _, update,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

CategoryMapComponent = require('./CategoryMapComponent');

ColorPaletteCollectionComponent = require('./ColorPaletteCollectionComponent');

update = require('update-object');

AxisBuilder = require('./AxisBuilder');

AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent');

module.exports = AxisColorEditorComponent = (function(superClass) {
  extend(AxisColorEditorComponent, superClass);

  AxisColorEditorComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    axis: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    colorMapOptional: React.PropTypes.bool,
    reorderable: React.PropTypes.bool,
    defaultColor: React.PropTypes.string,
    table: React.PropTypes.string.isRequired,
    types: React.PropTypes.array,
    aggrNeed: React.PropTypes.oneOf(['none', 'optional', 'required']).isRequired,
    allowExcludedValues: React.PropTypes.bool
  };

  AxisColorEditorComponent.defaultProps = {
    colorMapOptional: false,
    reorderable: false
  };

  function AxisColorEditorComponent(props) {
    this.handleCancelCustomize = bind(this.handleCancelCustomize, this);
    this.handlePaletteChange = bind(this.handlePaletteChange, this);
    this.handleSelectPalette = bind(this.handleSelectPalette, this);
    AxisColorEditorComponent.__super__.constructor.call(this, props);
    this.state = {
      error: null,
      mode: props.axis.colorMap || props.colorMapOptional ? "normal" : "palette",
      categories: []
    };
  }

  AxisColorEditorComponent.prototype.componentWillReceiveProps = function(nextProps) {
    AxisColorEditorComponent.__super__.componentWillReceiveProps.call(this, nextProps);
    return this.setState({
      mode: nextProps.axis.colorMap || nextProps.colorMapOptional ? "normal" : "palette"
    });
  };

  AxisColorEditorComponent.prototype.isLoadNeeded = function(newProps, oldProps) {
    return !_.isEqual(_.omit(newProps.axis, ["colorMap", "drawOrder"]), _.omit(oldProps.axis, ["colorMap", "drawOrder"]));
  };

  AxisColorEditorComponent.prototype.load = function(props, prevProps, callback) {
    var axis, axisBuilder, axisCompiledExpr, categories, colorMap, newState, valuesQuery;
    axisBuilder = new AxisBuilder({
      schema: props.schema
    });
    categories = axisBuilder.getCategories(props.axis);
    if (categories.length > 1) {
      newState = {
        categories: categories
      };
      if (!props.axis.colorMap || !_.isEqual(_.pluck(props.axis.colorMap, "value").sort(), _.pluck(categories, "value").sort())) {
        colorMap = ColorPaletteCollectionComponent.getColorMapForCategories(categories, axisBuilder.isCategorical(props.axis));
        this.handlePaletteChange(colorMap);
        newState.mode = "normal";
      }
      callback(newState);
      return;
    }
    axis = axisBuilder.cleanAxis({
      axis: props.axis,
      table: this.props.table,
      types: this.props.types,
      aggrNeed: this.props.aggrNeed
    });
    if (!axis || axisBuilder.validateAxis({
      axis: axis
    })) {
      return;
    }
    if (axisBuilder.isAxisAggr(axis)) {
      return;
    }
    axisCompiledExpr = axisBuilder.compileAxis({
      axis: axis,
      tableAlias: "main"
    });
    valuesQuery = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: axisCompiledExpr,
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
    return props.dataSource.performQuery(valuesQuery, (function(_this) {
      return function(error, rows) {
        if (_this.unmounted) {
          return;
        }
        if (error) {
          return;
        }
        categories = axisBuilder.getCategories(props.axis, _.pluck(rows, "val"));
        newState = {
          categories: categories
        };
        if (!props.axis.colorMap || !_.isEqual(_.pluck(props.axis.colorMap, "value").sort(), _.pluck(categories, "value").sort())) {
          colorMap = ColorPaletteCollectionComponent.getColorMapForCategories(categories, axisBuilder.isCategorical(axis));
          _this.handlePaletteChange(colorMap);
          newState.mode = "normal";
        }
        return callback(newState);
      };
    })(this));
  };

  AxisColorEditorComponent.prototype.componentWillUnmount = function() {
    return this.unmounted = true;
  };

  AxisColorEditorComponent.prototype.handleSelectPalette = function() {
    return this.setState({
      mode: "palette"
    });
  };

  AxisColorEditorComponent.prototype.handlePaletteChange = function(palette) {
    this.props.onChange(update(this.props.axis, {
      colorMap: {
        $set: palette
      },
      drawOrder: {
        $set: _.pluck(palette, "value")
      }
    }));
    return this.setState({
      mode: "normal"
    });
  };

  AxisColorEditorComponent.prototype.handleCancelCustomize = function() {
    return this.setState({
      mode: "normal"
    });
  };

  AxisColorEditorComponent.prototype.renderPreview = function() {
    return H.div({
      className: "axis-palette"
    }, _.map(this.state.categories.slice(0, 6), (function(_this) {
      return function(category, i) {
        var cellStyle, color;
        color = _.find(_this.props.axis.colorMap, {
          value: category.value
        });
        cellStyle = {
          display: 'inline-block',
          height: 20,
          width: 20,
          backgroundColor: color ? color.color : _this.props.defaultColor
        };
        return H.div({
          style: cellStyle,
          key: i
        }, " ");
      };
    })(this)));
  };

  AxisColorEditorComponent.prototype.render = function() {
    return H.div(null, this.state.mode === "palette" ? this.state.loading ? H.span(null, "Loading...") : R(ColorPaletteCollectionComponent, {
      onPaletteSelected: this.handlePaletteChange,
      axis: this.props.axis,
      categories: this.state.categories,
      onCancel: this.handleCancelCustomize
    }) : void 0, this.state.mode === "normal" ? H.div(null, H.p(null, H.a({
      style: {
        cursor: "pointer"
      },
      onClick: this.handleSelectPalette,
      key: "select-palette"
    }, "Change color scheme")), this.props.axis.colorMap ? H.div({
      key: "selected-palette"
    }, H.div(null, R(CategoryMapComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      axis: this.props.axis,
      onChange: this.props.onChange,
      categories: this.state.categories,
      key: "colorMap",
      reorderable: this.props.reorderable,
      allowExcludedValues: this.props.allowExcludedValues,
      showColorMap: true
    }))) : void 0) : void 0);
  };

  return AxisColorEditorComponent;

})(AsyncLoadComponent);
