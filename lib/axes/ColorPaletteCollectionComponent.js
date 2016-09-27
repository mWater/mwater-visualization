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
    categories: React.PropTypes.array,
    onCancel: React.PropTypes.func.isRequired
  };

  ColorPaletteCollectionComponent.getColorMapForCategories = function(categories, isCategorical) {
    var scheme, type;
    if (isCategorical == null) {
      isCategorical = true;
    }
    if (isCategorical) {
      type = "schemeAccent";
    } else {
      type = "interpolateBlues";
    }
    scheme = ColorPaletteCollectionComponent.generateColorSet(type, categories.length - 1);
    return _.map(categories, function(category, i) {
      return {
        value: category.value,
        color: category.value === null ? "#aaaaaa" : scheme[i % scheme.length]
      };
    });
  };

  ColorPaletteCollectionComponent._collection = ["schemeSet1", "schemeSet2", "schemeSet3", "schemeAccent", "schemeDark2", "schemePaired", "schemePastel1", "schemePastel2", "interpolateSpectral", "interpolateBlues", "interpolateGreens", "interpolateGreys", "interpolateOranges", "interpolatePurples", "interpolateReds", "interpolateBuGn", "interpolateBuPu", "interpolateGnBu", "interpolateOrRd", "interpolatePuBuGn", "interpolatePuBu", "interpolatePuRd", "interpolateRdPu", "interpolateYlGnBu", "interpolateYlGn", "interpolateYlOrBr", "interpolateYlOrRd", "interpolateBrBG", "interpolatePRGn", "interpolatePiYG", "interpolatePuOr", "interpolateRdBu", "interpolateRdGy", "interpolateRdYlBu", "interpolateRdYlGn"];

  ColorPaletteCollectionComponent.generateColorSet = function(type, length) {
    return ColorSchemeFactory.createColorScheme({
      type: type,
      number: length
    });
  };

  ColorPaletteCollectionComponent.prototype.onPaletteSelected = function(index) {
    var colorMap, scheme;
    scheme = ColorPaletteCollectionComponent.generateColorSet(ColorPaletteCollectionComponent._collection[index], this.props.categories.length - 1);
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
          colorSet: ColorPaletteCollectionComponent.generateColorSet(config, Math.min(_this.props.categories.length - 1, 6)),
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
