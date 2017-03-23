var AxisComponent, ColorComponent, H, IntersectionDesignerComponent, R, Rcslider, React, _, ui, update,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

ui = require('react-library/lib/bootstrap');

update = require('react-library/lib/update');

Rcslider = require('rc-slider');

AxisComponent = require('../../../axes/AxisComponent');

ColorComponent = require('../../../ColorComponent');

module.exports = IntersectionDesignerComponent = (function(superClass) {
  extend(IntersectionDesignerComponent, superClass);

  function IntersectionDesignerComponent() {
    this.handleBackgroundColorOpacityChange = bind(this.handleBackgroundColorOpacityChange, this);
    this.handleBackgroundColorChange = bind(this.handleBackgroundColorChange, this);
    this.handleBackgroundColorAxisChange = bind(this.handleBackgroundColorAxisChange, this);
    this.update = bind(this.update, this);
    return IntersectionDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  IntersectionDesignerComponent.propTypes = {
    intersection: React.PropTypes.object.isRequired,
    table: React.PropTypes.string.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  IntersectionDesignerComponent.prototype.update = function() {
    return update(this.props.intersection, this.props.onChange, arguments);
  };

  IntersectionDesignerComponent.prototype.handleBackgroundColorAxisChange = function(backgroundColorAxis) {
    var opacity;
    opacity = this.props.intersection.backgroundColorOpacity || 0.3;
    return this.update({
      backgroundColorAxis: backgroundColorAxis,
      backgroundColorOpacity: opacity
    });
  };

  IntersectionDesignerComponent.prototype.handleBackgroundColorChange = function(backgroundColor) {
    var opacity;
    opacity = this.props.intersection.backgroundColorOpacity || 0.3;
    return this.update({
      backgroundColor: backgroundColor,
      backgroundColorOpacity: opacity
    });
  };

  IntersectionDesignerComponent.prototype.handleBackgroundColorOpacityChange = function(newValue) {
    return this.update({
      backgroundColorOpacity: newValue / 100
    });
  };

  IntersectionDesignerComponent.prototype.renderValueAxis = function() {
    return R(ui.FormGroup, {
      label: "Calculation",
      help: "This is the calculated value that is displayed. Leave as blank to make an empty section"
    }, R(AxisComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      types: ["enum", "text", "boolean", "date", "number"],
      aggrNeed: "required",
      value: this.props.intersection.valueAxis,
      onChange: this.update("valueAxis"),
      showFormat: true
    }));
  };

  IntersectionDesignerComponent.prototype.renderNullValue = function() {
    if (this.props.intersection.valueAxis) {
      return R(ui.FormGroup, {
        label: "Show Empty Cells as"
      }, R(ui.TextInput, {
        value: this.props.intersection.valueAxis.nullLabel,
        emptyNull: true,
        onChange: this.update("valueAxis.nullLabel"),
        placeholder: "Blank"
      }));
    }
  };

  IntersectionDesignerComponent.prototype.renderStyling = function() {
    return R(ui.FormGroup, {
      key: "styling",
      label: "Styling"
    }, R(ui.Checkbox, {
      key: "bold",
      inline: true,
      value: this.props.intersection.bold,
      onChange: this.update("bold")
    }, "Bold"), R(ui.Checkbox, {
      key: "italic",
      inline: true,
      value: this.props.intersection.italic,
      onChange: this.update("italic")
    }, "Italic"));
  };

  IntersectionDesignerComponent.prototype.renderBackgroundColorAxis = function() {
    return R(ui.FormGroup, {
      label: "Background Color From Values",
      help: "This is an optional background color to set on cells that is controlled by the data"
    }, R(AxisComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      types: ["enum", "text", "boolean", "date"],
      aggrNeed: "required",
      value: this.props.intersection.backgroundColorAxis,
      onChange: this.handleBackgroundColorAxisChange,
      showColorMap: true
    }));
  };

  IntersectionDesignerComponent.prototype.renderBackgroundColor = function() {
    if (this.props.intersection.backgroundColorAxis) {
      return;
    }
    return R(ui.FormGroup, {
      label: "Background Color",
      help: "This is an optional background color to set on all cells"
    }, R(ColorComponent, {
      color: this.props.intersection.backgroundColor,
      onChange: this.handleBackgroundColorChange
    }));
  };

  IntersectionDesignerComponent.prototype.renderBackgroundColorOpacityControl = function() {
    if (!this.props.intersection.backgroundColorAxis && !this.props.intersection.backgroundColor) {
      return;
    }
    return R(ui.FormGroup, {
      label: "Background Opacity: " + (Math.round(this.props.intersection.backgroundColorOpacity * 100)) + "%"
    }, R(Rcslider, {
      min: 0,
      max: 100,
      step: 1,
      tipTransitionName: "rc-slider-tooltip-zoom-down",
      value: this.props.intersection.backgroundColorOpacity * 100,
      onChange: this.handleBackgroundColorOpacityChange
    }));
  };

  IntersectionDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderValueAxis(), this.renderNullValue(), this.renderStyling(), this.renderBackgroundColorAxis(), this.renderBackgroundColor(), this.renderBackgroundColorOpacityControl());
  };

  return IntersectionDesignerComponent;

})(React.Component);
