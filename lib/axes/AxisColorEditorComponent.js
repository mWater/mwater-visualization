var AsyncLoadComponent, AxisBuilder, AxisColorEditorComponent, ColorMapComponent, ColorMapOrderEditorComponent, ColorPaletteCollectionComponent, ColorPaletteComponent, H, R, React, _, c_c, d3, update,
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

d3 = require('d3-scale');

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
    }, this.renderPreview(), H.a({
      style: {
        fontSize: 12,
        cursor: "pointer",
        paddingTop: 5,
        display: "inline-block",
        verticalAlign: "top"
      },
      onClick: this.handleCustomizePalette,
      key: "customize-palette"
    }, "Customize these colors")) : void 0, drawOrder && this.props.colorMapReorderable ? R(ColorMapOrderEditorComponent, {
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

  ColorPaletteCollectionComponent.generatePolyLinearScheme = function(startColor, midColor, endColor, number) {
    var color, colors, i;
    color = d3.scaleLinear().domain([-parseInt(number / 2), 0, parseInt(number / 2)]).range([startColor, midColor, endColor]);
    colors = (function() {
      var j, ref, ref1, results;
      results = [];
      for (i = j = ref = -parseInt(number / 2), ref1 = parseInt(number / 2); ref <= ref1 ? j <= ref1 : j >= ref1; i = ref <= ref1 ? ++j : --j) {
        results.push(color(i));
      }
      return results;
    })();
    return _.map(colors, (function(_this) {
      return function(rgb) {
        var _color, rgbArray;
        rgbArray = rgb.substring(4, rgb.length - 1).split(',').map(function(item) {
          return parseInt(item);
        });
        _color = new c_c.Color({
          rgb: rgbArray
        });
        return _color.hex();
      };
    })(this));
  };

  ColorPaletteCollectionComponent.generateLinearScheme = function(startColor, endColor, number) {
    var color, colors, i;
    color = d3.scaleLinear().domain([0, number]).range([startColor, endColor]);
    colors = (function() {
      var j, ref, results;
      results = [];
      for (i = j = 0, ref = number; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        results.push(color(i));
      }
      return results;
    })();
    return _.map(colors, (function(_this) {
      return function(rgb) {
        var _color, rgbArray;
        rgbArray = rgb.substring(4, rgb.length - 1).split(',').map(function(item) {
          return parseInt(item);
        });
        _color = new c_c.Color({
          rgb: rgbArray
        });
        return _color.hex();
      };
    })(this));
  };

  ColorPaletteCollectionComponent.getColorMapForCategories = function(categories, isCategorical) {
    var config, scheme;
    if (isCategorical == null) {
      isCategorical = true;
    }
    if (isCategorical) {
      config = _.find(ColorPaletteCollectionComponent._collection, {
        type: 'static'
      });
    } else {
      config = _.find(ColorPaletteCollectionComponent._collection, function(item) {
        return item.type !== "static";
      });
    }
    console.log(config);
    scheme = ColorPaletteCollectionComponent.generateColorSet(config, categories.length);
    return _.map(categories, function(category, i) {
      return {
        value: category.value,
        color: category.value === null ? "#aaaaaa" : scheme[i % scheme.length]
      };
    });
  };

  ColorPaletteCollectionComponent._collection = [
    {
      type: "static",
      set: ["#2ca02c", "#1f77b4", "#ff7f0e", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]
    }, {
      type: "static",
      set: ["#ff7f0e", "#1f77b4", "#aec7e8", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"]
    }, {
      type: "static",
      set: ["#9c9ede", "#7375b5", "#4a5584", "#cedb9c", "#b5cf6b", "#8ca252", "#637939", "#e7cb94", "#e7ba52", "#bd9e39", "#8c6d31", "#e7969c", "#d6616b", "#ad494a", "#843c39", "#de9ed6", "#ce6dbd", "#a55194", "#7b4173"]
    }, {
      type: "poly-linear",
      args: ['red', 'yellow', 'green']
    }, {
      type: "poly-linear",
      args: ['green', 'yellow', 'red']
    }, {
      type: "fade",
      args: [
        {
          hex: '#D49097'
        }
      ]
    }, {
      type: "fade",
      args: [
        {
          hex: '#C1CCE6'
        }
      ]
    }, {
      type: "fade",
      args: [
        {
          hex: '#C8E6C1'
        }
      ]
    }, {
      type: "fade",
      args: [
        {
          hex: '#E6D6C1'
        }
      ]
    }, {
      type: "fade",
      args: [
        {
          hex: '#C1E6E6'
        }
      ]
    }, {
      type: "fade",
      args: [
        {
          hex: '#DFC1E6'
        }
      ]
    }
  ];

  ColorPaletteCollectionComponent.generateColorSet = function(config, length) {
    var i, j, ref, results;
    switch (config.type) {
      case "fade":
        return ColorPaletteCollectionComponent.generateColorFadeScheme.apply(void 0, config.args.concat(length));
      case "poly-linear":
        return ColorPaletteCollectionComponent.generatePolyLinearScheme.apply(void 0, config.args.concat(length));
      case "linear":
        return ColorPaletteCollectionComponent.generateLinearScheme.apply(void 0, config.args.concat(length));
      default:
        if (!config.set) {
          throw "Color set which is not fade or poly-linear must have a 'set' property";
        }
        results = [];
        for (i = j = 0, ref = length; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
          results.push(config.set[i % config.set.length]);
        }
        return results;
    }
  };

  ColorPaletteCollectionComponent.prototype.onPaletteSelected = function(index) {
    var colorMap, scheme;
    scheme = ColorPaletteCollectionComponent.generateColorSet(ColorPaletteCollectionComponent._collection[index], this.props.categories.length);
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
    return H.div(null, H.p(null, "Please select a color scheme"), _.map(ColorPaletteCollectionComponent._collection, (function(_this) {
      return function(config, index) {
        return R(ColorPaletteComponent, {
          key: index,
          index: index,
          colorSet: ColorPaletteCollectionComponent.generateColorSet(config, 6),
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
