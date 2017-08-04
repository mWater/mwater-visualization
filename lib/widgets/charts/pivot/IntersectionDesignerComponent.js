var AxisComponent, BackgroundColorConditionComponent, BackgroundColorConditionsComponent, ColorComponent, ExprComponent, FilterExprComponent, H, IntersectionDesignerComponent, PropTypes, R, Rcslider, React, _, ui, update,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

ui = require('react-library/lib/bootstrap');

update = require('react-library/lib/update');

Rcslider = require('rc-slider');

AxisComponent = require('../../../axes/AxisComponent');

ColorComponent = require('../../../ColorComponent');

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;

ExprComponent = require("mwater-expressions-ui").ExprComponent;

module.exports = IntersectionDesignerComponent = (function(superClass) {
  extend(IntersectionDesignerComponent, superClass);

  function IntersectionDesignerComponent() {
    this.handleFilterChange = bind(this.handleFilterChange, this);
    this.handleBackgroundColorOpacityChange = bind(this.handleBackgroundColorOpacityChange, this);
    this.handleBackgroundColorConditionsChange = bind(this.handleBackgroundColorConditionsChange, this);
    this.handleBackgroundColorChange = bind(this.handleBackgroundColorChange, this);
    this.handleBackgroundColorAxisChange = bind(this.handleBackgroundColorAxisChange, this);
    this.update = bind(this.update, this);
    return IntersectionDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  IntersectionDesignerComponent.propTypes = {
    intersection: PropTypes.object.isRequired,
    table: PropTypes.string.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    filters: PropTypes.array
  };

  IntersectionDesignerComponent.prototype.update = function() {
    return update(this.props.intersection, this.props.onChange, arguments);
  };

  IntersectionDesignerComponent.prototype.handleBackgroundColorAxisChange = function(backgroundColorAxis) {
    var opacity;
    opacity = this.props.intersection.backgroundColorOpacity || 1;
    return this.update({
      backgroundColorAxis: backgroundColorAxis,
      backgroundColorOpacity: opacity
    });
  };

  IntersectionDesignerComponent.prototype.handleBackgroundColorChange = function(backgroundColor) {
    var opacity;
    opacity = this.props.intersection.backgroundColorOpacity || 1;
    return this.update({
      backgroundColor: backgroundColor,
      backgroundColorOpacity: opacity
    });
  };

  IntersectionDesignerComponent.prototype.handleBackgroundColorConditionsChange = function(backgroundColorConditions) {
    var opacity;
    opacity = this.props.intersection.backgroundColorOpacity || 1;
    return this.update({
      backgroundColorConditions: backgroundColorConditions,
      backgroundColorOpacity: opacity
    });
  };

  IntersectionDesignerComponent.prototype.handleBackgroundColorOpacityChange = function(newValue) {
    return this.update({
      backgroundColorOpacity: newValue / 100
    });
  };

  IntersectionDesignerComponent.prototype.handleFilterChange = function(filter) {
    return this.update({
      filter: filter
    });
  };

  IntersectionDesignerComponent.prototype.renderValueAxis = function() {
    return R(ui.FormGroup, {
      labelMuted: true,
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
      showFormat: true,
      filters: this.props.filters
    }));
  };

  IntersectionDesignerComponent.prototype.renderNullValue = function() {
    if (this.props.intersection.valueAxis) {
      return R(ui.FormGroup, {
        labelMuted: true,
        label: "Show Empty Cells as"
      }, R(ui.TextInput, {
        value: this.props.intersection.valueAxis.nullLabel,
        emptyNull: true,
        onChange: this.update("valueAxis.nullLabel"),
        placeholder: "Blank"
      }));
    }
  };

  IntersectionDesignerComponent.prototype.renderFilter = function() {
    return R(ui.FormGroup, {
      labelMuted: true,
      label: [
        R(ui.Icon, {
          id: "glyphicon-filter"
        }), " Filters"
      ]
    }, R(FilterExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: this.handleFilterChange,
      table: this.props.table,
      value: this.props.intersection.filter
    }));
  };

  IntersectionDesignerComponent.prototype.renderStyling = function() {
    return R(ui.FormGroup, {
      labelMuted: true,
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

  IntersectionDesignerComponent.prototype.renderBackgroundColorConditions = function() {
    return R(BackgroundColorConditionsComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      colorConditions: this.props.intersection.backgroundColorConditions,
      onChange: this.handleBackgroundColorConditionsChange
    });
  };

  IntersectionDesignerComponent.prototype.renderBackgroundColorAxis = function() {
    return R(ui.FormGroup, {
      labelMuted: true,
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
      showColorMap: true,
      filters: this.props.filters
    }));
  };

  IntersectionDesignerComponent.prototype.renderBackgroundColor = function() {
    if (this.props.intersection.backgroundColorAxis) {
      return;
    }
    return R(ui.FormGroup, {
      labelMuted: true,
      label: "Background Color",
      help: "This is an optional background color to set on all cells"
    }, R(ColorComponent, {
      color: this.props.intersection.backgroundColor,
      onChange: this.handleBackgroundColorChange
    }));
  };

  IntersectionDesignerComponent.prototype.renderBackgroundColorOpacityControl = function() {
    var ref;
    if (!this.props.intersection.backgroundColorAxis && !this.props.intersection.backgroundColor && !((ref = this.props.intersection.backgroundColorConditions) != null ? ref[0] : void 0)) {
      return;
    }
    return R(ui.FormGroup, {
      labelMuted: true,
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
    return H.div(null, this.renderValueAxis(), this.renderNullValue(), this.renderFilter(), this.renderStyling(), this.renderBackgroundColorAxis(), this.renderBackgroundColorConditions(), this.renderBackgroundColor(), this.renderBackgroundColorOpacityControl());
  };

  return IntersectionDesignerComponent;

})(React.Component);

BackgroundColorConditionsComponent = (function(superClass) {
  extend(BackgroundColorConditionsComponent, superClass);

  function BackgroundColorConditionsComponent() {
    this.handleRemove = bind(this.handleRemove, this);
    this.handleChange = bind(this.handleChange, this);
    this.handleAdd = bind(this.handleAdd, this);
    return BackgroundColorConditionsComponent.__super__.constructor.apply(this, arguments);
  }

  BackgroundColorConditionsComponent.propTypes = {
    colorConditions: PropTypes.array,
    table: PropTypes.string.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  };

  BackgroundColorConditionsComponent.prototype.handleAdd = function() {
    var colorConditions;
    colorConditions = (this.props.colorConditions || []).slice();
    colorConditions.push({});
    return this.props.onChange(colorConditions);
  };

  BackgroundColorConditionsComponent.prototype.handleChange = function(index, colorCondition) {
    var colorConditions;
    colorConditions = this.props.colorConditions.slice();
    colorConditions[index] = colorCondition;
    return this.props.onChange(colorConditions);
  };

  BackgroundColorConditionsComponent.prototype.handleRemove = function(index) {
    var colorConditions;
    colorConditions = this.props.colorConditions.slice();
    colorConditions.splice(index, 1);
    return this.props.onChange(colorConditions);
  };

  BackgroundColorConditionsComponent.prototype.render = function() {
    return R(ui.FormGroup, {
      label: "Color Conditions",
      labelMuted: true,
      help: "Add conditions that, if met, set the color of the cell. Useful for flagging certain values"
    }, _.map(this.props.colorConditions, (function(_this) {
      return function(colorCondition, i) {
        return R(BackgroundColorConditionComponent, {
          key: i,
          colorCondition: colorCondition,
          table: _this.props.table,
          schema: _this.props.schema,
          dataSource: _this.props.dataSource,
          onChange: _this.handleChange.bind(null, i),
          onRemove: _this.handleRemove.bind(null, i)
        });
      };
    })(this)), R(ui.Button, {
      type: "link",
      size: "sm",
      onClick: this.handleAdd
    }, R(ui.Icon, {
      id: "fa-plus"
    }), " Add Condition"));
  };

  return BackgroundColorConditionsComponent;

})(React.Component);

BackgroundColorConditionComponent = (function(superClass) {
  extend(BackgroundColorConditionComponent, superClass);

  function BackgroundColorConditionComponent() {
    this.update = bind(this.update, this);
    return BackgroundColorConditionComponent.__super__.constructor.apply(this, arguments);
  }

  BackgroundColorConditionComponent.propTypes = {
    colorCondition: PropTypes.object.isRequired,
    table: PropTypes.string.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  };

  BackgroundColorConditionComponent.prototype.update = function() {
    return update(this.props.colorCondition, this.props.onChange, arguments);
  };

  BackgroundColorConditionComponent.prototype.render = function() {
    return H.div({
      className: "panel panel-default"
    }, H.div({
      className: "panel-body"
    }, R(ui.FormGroup, {
      labelMuted: true,
      label: "Condition"
    }, R(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: this.update("condition"),
      types: ['boolean'],
      aggrStatuses: ["aggregate", "literal"],
      table: this.props.table,
      value: this.props.colorCondition.condition
    })), R(ui.FormGroup, {
      labelMuted: true,
      label: "Color",
      hint: "Color to display when condition is met"
    }, R(ColorComponent, {
      color: this.props.colorCondition.color,
      onChange: this.update("color")
    }))));
  };

  return BackgroundColorConditionComponent;

})(React.Component);
