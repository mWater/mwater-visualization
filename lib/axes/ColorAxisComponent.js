var AxisComponent, ColorAxisComponent, ColorComponent, H, R, React, _, ui,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

ui = require('../UIComponents');

ColorComponent = require('../ColorComponent');

AxisComponent = require('./AxisComponent');

module.exports = ColorAxisComponent = (function(superClass) {
  extend(ColorAxisComponent, superClass);

  ColorAxisComponent.propTypes = {
    defaultColor: React.PropTypes.string,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    axis: React.PropTypes.object,
    onColorChange: React.PropTypes.func,
    onColorAxisChange: React.PropTypes.func,
    table: React.PropTypes.string,
    showColorMap: React.PropTypes.bool,
    colorMapOptional: React.PropTypes.bool,
    reorderable: React.PropTypes.bool,
    aggrNeed: React.PropTypes.oneOf(['none', 'optional', 'required']).isRequired,
    types: React.PropTypes.array,
    allowExcludedValues: React.PropTypes.bool
  };

  function ColorAxisComponent() {
    this.onModeChange = bind(this.onModeChange, this);
    ColorAxisComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      mode: this.props.axis ? "multicolor" : "single",
      axis: this.props.axis
    };
  }

  ColorAxisComponent.prototype.componentWillReceiveProps = function(nextProps) {
    if (!_.isEqual(nextProps.axis, this.props.axis)) {
      return this.setState({
        axis: nextProps.axis
      });
    }
  };

  ColorAxisComponent.prototype.onModeChange = function(mode) {
    if (mode === "single") {
      this.props.onColorAxisChange(null);
    } else {
      this.props.onColorAxisChange(this.state.axis);
    }
    return this.setState({
      mode: mode
    });
  };

  ColorAxisComponent.prototype.render = function() {
    return H.div(null, R(ui.ButtonToggleComponent, {
      value: this.props.axis ? 'multicolor' : this.state.mode,
      options: [
        {
          label: 'Single color',
          value: 'single'
        }, {
          label: 'Multiple Colors',
          value: 'multicolor'
        }
      ],
      onChange: this.onModeChange
    }), H.div({
      style: {
        marginTop: 8
      }
    }, !this.props.axis && this.state.mode === 'single' ? R(ColorComponent, {
      color: this.props.defaultColor,
      onChange: this.props.onColorChange
    }) : H.div(null, H.label({
      className: "text-muted",
      style: {
        fontSize: 12
      }
    }, "Color by"), R(AxisComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      types: this.props.types,
      aggrNeed: this.props.aggrNeed,
      value: this.state.axis,
      defaultColor: this.props.defaultColor,
      showColorMap: this.props.showColorMap,
      colorMapOptional: this.props.colorMapOptional,
      reorderable: this.props.reorderable,
      onChange: this.props.onColorAxisChange,
      allowExcludedValues: this.props.allowExcludedValues
    }))));
  };

  return ColorAxisComponent;

})(React.Component);
