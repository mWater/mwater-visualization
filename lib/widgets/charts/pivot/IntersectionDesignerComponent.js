var AxisComponent, H, IntersectionDesignerComponent, R, Rcslider, React, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

Rcslider = require('rc-slider');

AxisComponent = require('../../../axes/AxisComponent');

module.exports = IntersectionDesignerComponent = (function(superClass) {
  extend(IntersectionDesignerComponent, superClass);

  function IntersectionDesignerComponent() {
    this.handleBackgroundColorOpacityChange = bind(this.handleBackgroundColorOpacityChange, this);
    this.handleBackgroundColorAxisChange = bind(this.handleBackgroundColorAxisChange, this);
    this.handleValueAxisChange = bind(this.handleValueAxisChange, this);
    return IntersectionDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  IntersectionDesignerComponent.propTypes = {
    intersection: React.PropTypes.object.isRequired,
    table: React.PropTypes.string.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  IntersectionDesignerComponent.prototype.update = function(changes) {
    var intersection;
    intersection = _.extend({}, this.props.intersection, changes);
    return this.props.onChange(intersection);
  };

  IntersectionDesignerComponent.prototype.handleValueAxisChange = function(valueAxis) {
    return this.update({
      valueAxis: valueAxis
    });
  };

  IntersectionDesignerComponent.prototype.handleBackgroundColorAxisChange = function(backgroundColorAxis) {
    var opacity;
    opacity = this.props.intersection.backgroundColorOpacity || 0.3;
    return this.update({
      backgroundColorAxis: backgroundColorAxis,
      backgroundColorOpacity: opacity
    });
  };

  IntersectionDesignerComponent.prototype.handleBackgroundColorOpacityChange = function(newValue) {
    return this.update({
      backgroundColorOpacity: newValue / 100
    });
  };

  IntersectionDesignerComponent.prototype.renderValueAxis = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Calculation"), H.div({
      style: {
        marginLeft: 8
      }
    }, R(AxisComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      types: ["enum", "text", "boolean", "date", "number"],
      aggrNeed: "required",
      value: this.props.intersection.valueAxis,
      onChange: this.handleValueAxisChange
    })), H.p({
      className: "help-block"
    }, "This is the calculated value that is displayed. Leave as blank to make an empty section"));
  };

  IntersectionDesignerComponent.prototype.renderStyling = function() {
    return H.div({
      className: 'form-group',
      style: {
        paddingTop: 10
      },
      key: "styling"
    }, H.label({
      className: 'text-muted'
    }, "Styling"), H.div(null, H.label({
      className: "checkbox-inline",
      key: "bold"
    }, H.input({
      type: "checkbox",
      checked: this.props.intersection.bold === true,
      onChange: (function(_this) {
        return function(ev) {
          return _this.update({
            bold: ev.target.checked
          });
        };
      })(this)
    }), "Bold"), H.label({
      className: "checkbox-inline",
      key: "italic"
    }, H.input({
      type: "checkbox",
      checked: this.props.intersection.italic === true,
      onChange: (function(_this) {
        return function(ev) {
          return _this.update({
            italic: ev.target.checked
          });
        };
      })(this)
    }), "Italic")));
  };

  IntersectionDesignerComponent.prototype.renderBackgroundColorAxis = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Background Color"), H.div({
      style: {
        marginLeft: 8
      }
    }, R(AxisComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      types: ["enum", "text", "boolean", "date"],
      aggrNeed: "required",
      value: this.props.intersection.backgroundColorAxis,
      onChange: this.handleBackgroundColorAxisChange,
      showColorMap: true
    })), H.p({
      className: "help-block"
    }, "This is an optional background color to set on cells that is controlled by the data"));
  };

  IntersectionDesignerComponent.prototype.renderBackgroundColorOpacityControl = function() {
    if (!this.props.intersection.backgroundColorAxis) {
      return;
    }
    return H.div({
      className: 'form-group',
      style: {
        paddingTop: 10
      }
    }, H.label({
      className: 'text-muted'
    }, H.span(null, "Background Opacity: " + (Math.round(this.props.intersection.backgroundColorOpacity * 100)) + "%")), H.div({
      style: {
        padding: '10px'
      }
    }, R(Rcslider, {
      min: 0,
      max: 100,
      step: 1,
      tipTransitionName: "rc-slider-tooltip-zoom-down",
      value: this.props.intersection.backgroundColorOpacity * 100,
      onChange: this.handleBackgroundColorOpacityChange
    })));
  };

  IntersectionDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderValueAxis(), this.renderStyling(), this.renderBackgroundColorAxis(), this.renderBackgroundColorOpacityControl());
  };

  return IntersectionDesignerComponent;

})(React.Component);
