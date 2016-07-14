var AxisBuilder, AxisColorEditorComponent, ColorMapComponent, ColorPaletteCollectionComponent, ColorPaletteComponent, H, R, React, _, c_c, update,
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

module.exports = AxisColorEditorComponent = (function(superClass) {
  extend(AxisColorEditorComponent, superClass);

  AxisColorEditorComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    axis: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    colorMapOptional: React.PropTypes.bool
  };

  AxisColorEditorComponent.defaultProps = {
    colorMapOptional: false
  };

  function AxisColorEditorComponent() {
    this.handleCancelCustomize = bind(this.handleCancelCustomize, this);
    this.onPaletteChange = bind(this.onPaletteChange, this);
    this.handleSelectPalette = bind(this.handleSelectPalette, this);
    this.handleCustomizePalette = bind(this.handleCustomizePalette, this);
    AxisColorEditorComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      mode: this.props.axis.colorMap || this.props.colorMapOptional ? "normal" : "palette",
      categories: []
    };
  }

  AxisColorEditorComponent.prototype.componentDidMount = function() {
    return this.loadCategories(this.props);
  };

  AxisColorEditorComponent.prototype.componentWillReceiveProps = function(nextProps) {
    if (!_.isEqual(nextProps.axis, this.props.axis)) {
      return this.loadCategories(nextProps);
    }
  };

  AxisColorEditorComponent.prototype.componentWillUnmount = function() {
    return this.unmounted = true;
  };

  AxisColorEditorComponent.prototype.loadCategories = function(props) {
    var axis, axisBuilder, axisCompiledExpr, categories, valuesQuery;
    axisBuilder = new AxisBuilder({
      schema: props.schema
    });
    categories = axisBuilder.getCategories(props.axis);
    if (categories.length > 0) {
      this.setState({
        categories: categories
      });
      return;
    }
    axis = axisBuilder.cleanAxis({
      axis: props.axis
    });
    if (!axis || axisBuilder.validateAxis({
      axis: axis
    })) {
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
        return _this.setState({
          categories: categories
        });
      };
    })(this));
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

  AxisColorEditorComponent.prototype.render = function() {
    return H.div(null, this.state.mode === "palette" ? R(ColorPaletteCollectionComponent, {
      onPaletteSelected: this.onPaletteChange,
      axis: this.props.axis,
      categories: this.state.categories,
      onCancel: this.handleCancelCustomize
    }) : void 0, this.state.mode === "customize" ? [
      R(ColorMapComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        axis: this.props.axis,
        onChange: this.props.onChange,
        categories: this.state.categories,
        key: "colormap"
      }), H.a({
        style: {
          cursor: "pointer"
        },
        onClick: this.handleCancelCustomize,
        key: "cancel-customize"
      }, "Close")
    ] : void 0, this.state.mode === "normal" ? [
      this.props.axis.colorMap ? [
        H.div({
          key: "selected-palette"
        }, H.div({
          className: "axis-palette"
        }, _.map(this.props.axis.colorMap.slice(0, 6), (function(_this) {
          return function(map, i) {
            var cellStyle;
            cellStyle = {
              display: 'inline-block',
              height: 20,
              width: 20,
              backgroundColor: map.color
            };
            return H.div({
              style: cellStyle,
              key: i
            }, " ");
          };
        })(this)))), H.a({
          style: {
            cursor: "pointer"
          },
          onClick: this.handleCustomizePalette,
          key: "customize-palette",
          style: {
            marginRight: 10
          }
        }, "Customize color scheme")
      ] : void 0, H.a({
        style: {
          cursor: "pointer"
        },
        onClick: this.handleSelectPalette,
        key: "select-palette"
      }, "Select color scheme")
    ] : void 0);
  };

  return AxisColorEditorComponent;

})(React.Component);

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

  ColorPaletteCollectionComponent.defaultProps = {
    collection: [
      ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"], ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"], ["#9c9ede", "#7375b5", "#4a5584", "#cedb9c", "#b5cf6b", "#8ca252", "#637939", "#e7cb94", "#e7ba52", "#bd9e39", "#8c6d31", "#e7969c", "#d6616b", "#ad494a", "#843c39", "#de9ed6", "#ce6dbd", "#a55194", "#7b4173"], ColorPaletteCollectionComponent.generateColorFadeScheme({
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
    ]
  };

  ColorPaletteCollectionComponent.prototype.onPaletteSelected = function(index) {
    var colormap, scheme;
    scheme = this.props.collection[index];
    if (index > 2) {
      scheme = ColorPaletteCollectionComponent.generateColorFadeScheme({
        hex: scheme[0]
      }, this.props.categories.length);
    }
    colormap = _.map(this.props.categories, function(category, i) {
      return {
        value: category.value,
        color: scheme[i % scheme.length]
      };
    });
    return this.props.onPaletteSelected(colormap);
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
    return H.div(null, H.p(null, "Please select a color scheme"), _.map(this.props.collection, (function(_this) {
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
