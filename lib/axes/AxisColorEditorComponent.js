var AsyncLoadComponent, AxisBuilder, AxisColorEditorComponent, ColorMapComponent, ColorMapOrderEditorComponent, ColorPaletteCollectionComponent, ColorPaletteComponent, H, R, React, _, c_c, update,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

ColorMapComponent = require('./ColorMapComponent');

update = require('update-object');

AxisBuilder = require('./AxisBuilder');

c_c = require('color-mixer');

ColorMapOrderEditorComponent = require('./ColorMapOrderEditorComponent');

AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent');

module.exports = AxisColorEditorComponent = (function(superClass) {
  extend(AxisColorEditorComponent, superClass);

  AxisColorEditorComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    axis: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    colorMapOptional: React.PropTypes.bool,
    colorMapReorderable: React.PropTypes.bool,
    defaultColor: React.PropTypes.string,
    table: React.PropTypes.string.isRequired,
    types: React.PropTypes.array,
    aggrNeed: React.PropTypes.oneOf(['none', 'optional', 'required']).isRequired
  };

  AxisColorEditorComponent.defaultProps = {
    colorMapOptional: false,
    colorMapReorderable: false
  };

  function AxisColorEditorComponent(props) {
    this.handleCancelCustomize = bind(this.handleCancelCustomize, this);
    this.handleDrawOrderChange = bind(this.handleDrawOrderChange, this);
    this.onPaletteChange = bind(this.onPaletteChange, this);
    this.handleSelectPalette = bind(this.handleSelectPalette, this);
    this.handleCustomizePalette = bind(this.handleCustomizePalette, this);
    AxisColorEditorComponent.__super__.constructor.call(this, props);
    this.state = {
      error: null,
      mode: props.axis.colorMap || props.colorMapOptional ? "normal" : "palette",
      categories: []
    };
  }

  AxisColorEditorComponent.prototype.componentWillReceiveProps = function(nextProps) {
    AxisColorEditorComponent.__super__.componentWillReceiveProps.call(this, nextProps);
    if (!this.state.mode === "customize") {
      return this.setState({
        mode: nextProps.axis.colorMap || nextProps.colorMapOptional ? "normal" : "palette"
      });
    }
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
      if (!props.axis.colorMap) {
        colorMap = ColorPaletteCollectionComponent.getColorMapForCategories(categories, axisBuilder.isCategorical(props.axis));
        this.onPaletteChange(colorMap);
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
        if (!props.axis.colorMap) {
          colorMap = ColorPaletteCollectionComponent.getColorMapForCategories(categories, axisBuilder.isCategorical(axis));
          _this.onPaletteChange(colorMap);
          newState.mode = "normal";
        }
        return callback(newState);
      };
    })(this));
  };

  AxisColorEditorComponent.prototype.componentWillUnmount = function() {
    return this.unmounted = true;
  };

  AxisColorEditorComponent.prototype.handleCustomizePalette = function() {
    return this.setState({
      mode: "customize"
    });
  };

  AxisColorEditorComponent.prototype.handleSelectPalette = function() {
    return this.setState({
      mode: "palette"
    });
  };

  AxisColorEditorComponent.prototype.onPaletteChange = function(palette) {
    return this.props.onChange(update(this.props.axis, {
      colorMap: {
        $set: palette
      },
      drawOrder: {
        $set: _.pluck(palette, "value")
      }
    }));
  };

  AxisColorEditorComponent.prototype.handleDrawOrderChange = function(order) {
    return this.props.onChange(update(this.props.axis, {
      drawOrder: {
        $set: order
      }
    }));
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
    var drawOrder;
    drawOrder = this.props.axis.drawOrder || _.pluck(this.props.axis.colorMap, "value");
    return H.div(null, this.state.mode === "palette" ? this.state.loading ? H.span(null, "Loading...") : R(ColorPaletteCollectionComponent, {
      onPaletteSelected: this.onPaletteChange,
      axis: this.props.axis,
      categories: this.state.categories,
      onCancel: this.handleCancelCustomize
    }) : void 0, this.state.mode === "customize" ? H.div(null, R(ColorMapComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      axis: this.props.axis,
      onChange: this.props.onChange,
      categories: this.state.categories,
      key: "colorMap"
    }), H.a({
      style: {
        cursor: "pointer"
      },
      onClick: this.handleCancelCustomize,
      key: "cancel-customize"
    }, "Close")) : void 0, this.state.mode === "normal" ? H.div(null, H.p(null, H.a({
      style: {
        cursor: "pointer"
      },
      onClick: this.handleSelectPalette,
      key: "select-palette"
    }, "Change color scheme")), this.props.axis.colorMap ? H.div({
      key: "selected-palette"
    }, this.renderPreview(), H.p({
      style: {
        fontSize: 12
      }
    }, H.a({
      style: {
        cursor: "pointer"
      },
      onClick: this.handleCustomizePalette,
      key: "customize-palette",
      style: {
        marginRight: 10
      }
    }, "Choose colors manually"))) : void 0, drawOrder && this.props.colorMapReorderable ? R(ColorMapOrderEditorComponent, {
      colorMap: this.props.axis.colorMap,
      order: drawOrder,
      categories: this.state.categories,
      defaultColor: this.props.defaultColor,
      onChange: this.handleDrawOrderChange
    }) : void 0) : void 0);
  };

  return AxisColorEditorComponent;

})(AsyncLoadComponent);

ColorPaletteCollectionComponent = (function(superClass) {
  extend(ColorPaletteCollectionComponent, superClass);

  function ColorPaletteCollectionComponent() {
    this.renderCancel = bind(this.renderCancel, this);
    this.onPaletteSelected = bind(this.onPaletteSelected, this);
    return ColorPaletteCollectionComponent.__super__.constructor.apply(this, arguments);
  }

  ColorPaletteCollectionComponent.propTypes = {
    onPaletteSelected: React.PropTypes.func.isRequired,
    axis: React.PropTypes.object.isRequired,
    categories: React.PropTypes.array,
    onCancel: React.PropTypes.func.isRequired
  };

  ColorPaletteCollectionComponent.generateColorFadeScheme = function(baseColor, number) {
    var base;
    base = new c_c.Color(baseColor);
    return _.map(base.darken_set(number), function(subcolor, i) {
      return subcolor.hex();
    });
  };

  ColorPaletteCollectionComponent.getColorMapForCategories = function(categories, isCategorical) {
    var scheme;
    if (isCategorical == null) {
      isCategorical = true;
    }
    if (isCategorical) {
      scheme = this.categoricalColorSet[0];
    } else {
      scheme = ColorPaletteCollectionComponent.generateColorFadeScheme({
        hex: this.colorFadesSet[0][0]
      }, categories.length);
    }
    return _.map(categories, function(category, i) {
      return {
        value: category.value,
        color: category.value === null ? "#aaaaaa" : scheme[i % scheme.length]
      };
    });
  };

  ColorPaletteCollectionComponent.categoricalColorSet = [["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"], ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"], ["#9c9ede", "#7375b5", "#4a5584", "#cedb9c", "#b5cf6b", "#8ca252", "#637939", "#e7cb94", "#e7ba52", "#bd9e39", "#8c6d31", "#e7969c", "#d6616b", "#ad494a", "#843c39", "#de9ed6", "#ce6dbd", "#a55194", "#7b4173"]];

  ColorPaletteCollectionComponent.colorFadesSet = [
    ColorPaletteCollectionComponent.generateColorFadeScheme({
      hex: '#D49097'
    }, 6), ColorPaletteCollectionComponent.generateColorFadeScheme({
      hex: '#C1CCE6'
    }, 6), ColorPaletteCollectionComponent.generateColorFadeScheme({
      hex: '#C8E6C1'
    }, 6), ColorPaletteCollectionComponent.generateColorFadeScheme({
      hex: '#E6D6C1'
    }, 6), ColorPaletteCollectionComponent.generateColorFadeScheme({
      hex: '#C1E6E6'
    }, 6), ColorPaletteCollectionComponent.generateColorFadeScheme({
      hex: '#DFC1E6'
    }, 6)
  ];

  ColorPaletteCollectionComponent.collection = ColorPaletteCollectionComponent.categoricalColorSet.concat(ColorPaletteCollectionComponent.colorFadesSet);

  ColorPaletteCollectionComponent.prototype.onPaletteSelected = function(index) {
    var colorMap, scheme;
    scheme = ColorPaletteCollectionComponent.collection[index];
    if (index > 2) {
      scheme = ColorPaletteCollectionComponent.generateColorFadeScheme({
        hex: scheme[0]
      }, this.props.categories.length);
    }
    colorMap = _.map(this.props.categories, function(category, i) {
      return {
        value: category.value,
        color: category.value === null ? "#aaaaaa" : scheme[i % scheme.length]
      };
    });
    return this.props.onPaletteSelected(colorMap);
  };

  ColorPaletteCollectionComponent.prototype.renderCancel = function() {
    if (this.props.axis.colorMap) {
      return H.div(null, H.a({
        style: {
          cursor: "pointer"
        },
        onClick: this.props.onCancel,
        key: "cancel-customize"
      }, "Cancel"));
    }
  };

  ColorPaletteCollectionComponent.prototype.render = function() {
    return H.div(null, H.p(null, "Please select a color scheme"), _.map(ColorPaletteCollectionComponent.collection, (function(_this) {
      return function(collection, index) {
        return R(ColorPaletteComponent, {
          key: index,
          index: index,
          colorSet: collection,
          onPaletteSelected: _this.onPaletteSelected,
          number: _this.props.categories.length
        });
      };
    })(this)), this.renderCancel());
  };

  return ColorPaletteCollectionComponent;

})(React.Component);

ColorPaletteComponent = (function(superClass) {
  extend(ColorPaletteComponent, superClass);

  function ColorPaletteComponent() {
    this.handleSelect = bind(this.handleSelect, this);
    return ColorPaletteComponent.__super__.constructor.apply(this, arguments);
  }

  ColorPaletteComponent.propTypes = {
    index: React.PropTypes.number.isRequired,
    colorSet: React.PropTypes.array.isRequired,
    onPaletteSelected: React.PropTypes.func.isRequired,
    number: React.PropTypes.number
  };

  ColorPaletteComponent.defaultProps = {
    number: 6
  };

  ColorPaletteComponent.prototype.handleSelect = function() {
    return this.props.onPaletteSelected(this.props.index);
  };

  ColorPaletteComponent.prototype.render = function() {
    return H.div({
      onClick: this.handleSelect,
      className: "axis-palette"
    }, _.map(this.props.colorSet.slice(0, Math.min(this.props.number, 6)), (function(_this) {
      return function(color, i) {
        var cellStyle;
        cellStyle = {
          display: 'inline-block',
          height: 20,
          width: 20,
          backgroundColor: color
        };
        return H.div({
          style: cellStyle,
          key: i
        }, " ");
      };
    })(this)));
  };

  return ColorPaletteComponent;

})(React.Component);
