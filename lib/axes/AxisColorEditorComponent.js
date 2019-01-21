var AxisBuilder, AxisColorEditorComponent, CategoryMapComponent, ColorPaletteCollectionComponent, ColorSchemeFactory, PropTypes, R, React, _, update,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

CategoryMapComponent = require('./CategoryMapComponent');

ColorSchemeFactory = require('../ColorSchemeFactory');

ColorPaletteCollectionComponent = require('./ColorPaletteCollectionComponent');

update = require('update-object');

AxisBuilder = require('./AxisBuilder');

module.exports = AxisColorEditorComponent = (function(superClass) {
  extend(AxisColorEditorComponent, superClass);

  AxisColorEditorComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    axis: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    categories: PropTypes.array,
    reorderable: PropTypes.bool,
    defaultColor: PropTypes.string,
    allowExcludedValues: PropTypes.bool,
    initiallyExpanded: PropTypes.bool,
    autosetColors: PropTypes.bool
  };

  AxisColorEditorComponent.defaultProps = {
    reorderable: false,
    autosetColors: true
  };

  function AxisColorEditorComponent(props) {
    this.handleCancelCustomize = bind(this.handleCancelCustomize, this);
    this.handlePaletteChange = bind(this.handlePaletteChange, this);
    this.handleResetPalette = bind(this.handleResetPalette, this);
    this.handleSelectPalette = bind(this.handleSelectPalette, this);
    AxisColorEditorComponent.__super__.constructor.call(this, props);
    this.state = {
      mode: "normal"
    };
  }

  AxisColorEditorComponent.prototype.componentWillMount = function() {
    return this.updateColorMap();
  };

  AxisColorEditorComponent.prototype.componentDidUpdate = function() {
    return this.updateColorMap();
  };

  AxisColorEditorComponent.prototype.updateColorMap = function() {
    var axisBuilder, colorMap, existing;
    axisBuilder = new AxisBuilder({
      schema: this.props.schema
    });
    if (!this.props.categories) {
      return;
    }
    if (!this.props.axis.colorMap || !_.isEqual(_.pluck(this.props.axis.colorMap, "value").sort(), _.pluck(this.props.categories, "value").sort())) {
      if (this.props.autosetColors) {
        colorMap = ColorSchemeFactory.createColorMapForCategories(this.props.categories, axisBuilder.isCategorical(this.props.axis));
      } else {
        existing = _.indexBy(this.props.axis.colorMap || [], "value");
        colorMap = _.map(this.props.categories, function(category, i) {
          return {
            value: category.value,
            color: existing[category.value] ? existing[category.value].color : null
          };
        });
      }
      this.handlePaletteChange(colorMap);
      return this.setState({
        mode: "normal"
      });
    }
  };

  AxisColorEditorComponent.prototype.handleSelectPalette = function() {
    return this.setState({
      mode: "palette"
    });
  };

  AxisColorEditorComponent.prototype.handleResetPalette = function() {
    var colorMap;
    colorMap = _.map(this.props.categories, function(category, i) {
      return {
        value: category.value,
        color: null
      };
    });
    this.handlePaletteChange(colorMap);
    return this.setState({
      mode: "normal"
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
    return R('div', {
      className: "axis-palette"
    }, _.map(this.props.categories.slice(0, 6), (function(_this) {
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
        return R('div', {
          style: cellStyle,
          key: i
        }, " ");
      };
    })(this)));
  };

  AxisColorEditorComponent.prototype.render = function() {
    return R('div', null, this.state.mode === "palette" ? this.props.categories ? R(ColorPaletteCollectionComponent, {
      onPaletteSelected: this.handlePaletteChange,
      axis: this.props.axis,
      categories: this.props.categories,
      onCancel: this.handleCancelCustomize
    }) : void 0 : void 0, this.state.mode === "normal" ? R('div', null, R('p', null, R('a', {
      style: {
        cursor: "pointer"
      },
      onClick: this.handleSelectPalette,
      key: "select-palette"
    }, "Change color scheme"), !this.props.autosetColors ? R('a', {
      style: {
        cursor: "pointer",
        marginLeft: 10
      },
      onClick: this.handleResetPalette,
      key: "reset-palette"
    }, "Reset colors") : void 0), this.props.axis.colorMap ? R('div', {
      key: "selected-palette"
    }, R('div', null, R(CategoryMapComponent, {
      schema: this.props.schema,
      axis: this.props.axis,
      onChange: this.props.onChange,
      categories: this.props.categories,
      key: "colorMap",
      reorderable: this.props.reorderable,
      allowExcludedValues: this.props.allowExcludedValues,
      showColorMap: true,
      initiallyExpanded: this.props.initiallyExpanded
    }))) : void 0) : void 0);
  };

  return AxisColorEditorComponent;

})(React.Component);
