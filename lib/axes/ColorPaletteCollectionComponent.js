var ColorPaletteCollectionComponent, ColorPaletteComponent, H, R, React, c_c, d3,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

c_c = require('color-mixer');

d3 = require('d3-scale');

module.exports = ColorPaletteCollectionComponent = (function(superClass) {
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
