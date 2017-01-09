var ColorPaletteCollectionComponent, ColorPaletteComponent, ColorSchemeFactory, H, R, React, c_c, d3,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

ColorSchemeFactory = require('../ColorSchemeFactory');

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
    categories: React.PropTypes.array.isRequired,
    onCancel: React.PropTypes.func.isRequired
  };

  ColorPaletteCollectionComponent.palettes = [
    {
      type: "schemeSet1",
      reversed: false
    }, {
      type: "schemeSet2",
      reversed: false
    }, {
      type: "schemeSet3",
      reversed: false
    }, {
      type: "schemeAccent",
      reversed: false
    }, {
      type: "schemeDark2",
      reversed: false
    }, {
      type: "schemePaired",
      reversed: false
    }, {
      type: "schemePastel1",
      reversed: false
    }, {
      type: "schemePastel2",
      reversed: false
    }, {
      type: "interpolateSpectral",
      reversed: false
    }, {
      type: "interpolateSpectral",
      reversed: true
    }, {
      type: "interpolateBlues",
      reversed: false
    }, {
      type: "interpolateBlues",
      reversed: true
    }, {
      type: "interpolateGreens",
      reversed: false
    }, {
      type: "interpolateGreens",
      reversed: true
    }, {
      type: "interpolateGreys",
      reversed: false
    }, {
      type: "interpolateGreys",
      reversed: true
    }, {
      type: "interpolateOranges",
      reversed: false
    }, {
      type: "interpolateOranges",
      reversed: true
    }, {
      type: "interpolatePurples",
      reversed: false
    }, {
      type: "interpolatePurples",
      reversed: true
    }, {
      type: "interpolateReds",
      reversed: false
    }, {
      type: "interpolateReds",
      reversed: true
    }, {
      type: "interpolateBuGn",
      reversed: false
    }, {
      type: "interpolateBuGn",
      reversed: true
    }, {
      type: "interpolateBuPu",
      reversed: false
    }, {
      type: "interpolateBuPu",
      reversed: true
    }, {
      type: "interpolateGnBu",
      reversed: false
    }, {
      type: "interpolateGnBu",
      reversed: true
    }, {
      type: "interpolateOrRd",
      reversed: false
    }, {
      type: "interpolateOrRd",
      reversed: true
    }, {
      type: "interpolatePuBuGn",
      reversed: false
    }, {
      type: "interpolatePuBuGn",
      reversed: true
    }, {
      type: "interpolatePuBu",
      reversed: false
    }, {
      type: "interpolatePuBu",
      reversed: true
    }, {
      type: "interpolatePuRd",
      reversed: false
    }, {
      type: "interpolatePuRd",
      reversed: true
    }, {
      type: "interpolateRdPu",
      reversed: false
    }, {
      type: "interpolateRdPu",
      reversed: true
    }, {
      type: "interpolateYlGnBu",
      reversed: false
    }, {
      type: "interpolateYlGnBu",
      reversed: true
    }, {
      type: "interpolateYlGn",
      reversed: false
    }, {
      type: "interpolateYlGn",
      reversed: true
    }, {
      type: "interpolateYlOrBr",
      reversed: false
    }, {
      type: "interpolateYlOrBr",
      reversed: true
    }, {
      type: "interpolateYlOrRd",
      reversed: false
    }, {
      type: "interpolateYlOrRd",
      reversed: true
    }, {
      type: "interpolateBrBG",
      reversed: false
    }, {
      type: "interpolateBrBG",
      reversed: true
    }, {
      type: "interpolatePRGn",
      reversed: false
    }, {
      type: "interpolatePRGn",
      reversed: true
    }, {
      type: "interpolatePiYG",
      reversed: false
    }, {
      type: "interpolatePiYG",
      reversed: true
    }, {
      type: "interpolatePuOr",
      reversed: false
    }, {
      type: "interpolatePuOr",
      reversed: true
    }, {
      type: "interpolateRdBu",
      reversed: false
    }, {
      type: "interpolateRdBu",
      reversed: true
    }, {
      type: "interpolateRdGy",
      reversed: false
    }, {
      type: "interpolateRdGy",
      reversed: true
    }, {
      type: "interpolateRdYlBu",
      reversed: false
    }, {
      type: "interpolateRdYlBu",
      reversed: true
    }, {
      type: "interpolateRdYlGn",
      reversed: false
    }, {
      type: "interpolateRdYlGn",
      reversed: true
    }
  ];

  ColorPaletteCollectionComponent.prototype.onPaletteSelected = function(index) {
    var colorMap, scheme;
    scheme = ColorSchemeFactory.createColorScheme({
      type: ColorPaletteCollectionComponent.palettes[index].type,
      number: _.any(this.props.categories, function(c) {
        return c.value == null;
      }) ? this.props.categories.length - 1 : this.props.categories.length,
      reversed: ColorPaletteCollectionComponent.palettes[index].reversed
    });
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
    return H.div(null, H.p(null, "Please select a color scheme"), _.map(ColorPaletteCollectionComponent.palettes, (function(_this) {
      return function(config, index) {
        return R(ColorPaletteComponent, {
          key: index,
          index: index,
          colorSet: ColorSchemeFactory.createColorScheme({
            type: config.type,
            number: Math.min(_this.props.categories.length - 1, 6),
            reversed: config.reversed
          }),
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
    }, _.map(this.props.colorSet.slice(0, this.props.number), (function(_this) {
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
