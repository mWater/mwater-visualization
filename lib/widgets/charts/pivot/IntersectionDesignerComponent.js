var AxisComponent, ColorComponent, FormGroup, H, IntersectionDesignerComponent, R, Rcslider, React, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

Rcslider = require('rc-slider');

AxisComponent = require('../../../axes/AxisComponent');

ColorComponent = require('../../../ColorComponent');

module.exports = IntersectionDesignerComponent = (function(superClass) {
  extend(IntersectionDesignerComponent, superClass);

  function IntersectionDesignerComponent() {
    this.handleNullLabelChange = bind(this.handleNullLabelChange, this);
    this.handleBackgroundColorOpacityChange = bind(this.handleBackgroundColorOpacityChange, this);
    this.handleBackgroundColorChange = bind(this.handleBackgroundColorChange, this);
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

  IntersectionDesignerComponent.prototype.handleNullLabelChange = function(ev) {
    var valueAxis;
    valueAxis = _.extend({}, this.props.intersection.valueAxis, {
      nullLabel: ev.target.value || null
    });
    return this.update({
      valueAxis: valueAxis
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
      onChange: this.handleValueAxisChange,
      showFormat: true
    })), H.p({
      className: "help-block"
    }, "This is the calculated value that is displayed. Leave as blank to make an empty section"));
  };

  IntersectionDesignerComponent.prototype.renderNullValue = function() {
    if (!this.props.intersection.valueAxis) {
      return null;
    }
    return R(FormGroup, {
      label: "Show Empty Cells as"
    }, H.input({
      type: "text",
      className: "form-control",
      value: this.props.intersection.valueAxis.nullLabel || "",
      onChange: this.handleNullLabelChange,
      placeholder: "Blank"
    }));
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
    return R(FormGroup, {
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
    return R(FormGroup, {
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
    return H.div(null, this.renderValueAxis(), this.renderNullValue(), this.renderStyling(), this.renderBackgroundColorAxis(), this.renderBackgroundColor(), this.renderBackgroundColorOpacityControl());
  };

  return IntersectionDesignerComponent;

})(React.Component);

FormGroup = function(props) {
  return H.div({
    className: "form-group"
  }, H.label({
    className: "text-muted"
  }, props.label), H.div({
    style: {
      marginLeft: 5
    }
  }, props.children), props.help ? H.p({
    className: "help-block",
    style: {
      marginLeft: 5
    }
  }, props.help) : void 0);
};
