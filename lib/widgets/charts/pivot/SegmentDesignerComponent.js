var AxisComponent, BorderComponent, ColorComponent, FilterExprComponent, PropTypes, R, React, SegmentDesignerComponent, _, ui,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

ui = require('react-library/lib/bootstrap');

AxisComponent = require('../../../axes/AxisComponent');

ColorComponent = require('../../../ColorComponent');

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;

module.exports = SegmentDesignerComponent = (function(superClass) {
  extend(SegmentDesignerComponent, superClass);

  SegmentDesignerComponent.propTypes = {
    segment: PropTypes.object.isRequired,
    table: PropTypes.string.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    segmentType: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    filters: PropTypes.array
  };

  function SegmentDesignerComponent(props) {
    this.handleFilterChange = bind(this.handleFilterChange, this);
    this.handleLabelChange = bind(this.handleLabelChange, this);
    this.handleValueAxisChange = bind(this.handleValueAxisChange, this);
    this.handleMultipleMode = bind(this.handleMultipleMode, this);
    this.handleSingleMode = bind(this.handleSingleMode, this);
    SegmentDesignerComponent.__super__.constructor.call(this, props);
    this.state = {
      mode: (props.segment.label == null) && !props.segment.valueAxis ? null : props.segment.valueAxis ? "multiple" : "single"
    };
  }

  SegmentDesignerComponent.prototype.componentDidMount = function() {
    var ref;
    return (ref = this.labelElem) != null ? ref.focus() : void 0;
  };

  SegmentDesignerComponent.prototype.update = function(changes) {
    var segment;
    segment = _.extend({}, this.props.segment, changes);
    return this.props.onChange(segment);
  };

  SegmentDesignerComponent.prototype.handleSingleMode = function() {
    this.update({
      valueAxis: null
    });
    return this.setState({
      mode: "single"
    });
  };

  SegmentDesignerComponent.prototype.handleMultipleMode = function() {
    return this.setState({
      mode: "multiple"
    });
  };

  SegmentDesignerComponent.prototype.handleValueAxisChange = function(valueAxis) {
    return this.update({
      valueAxis: valueAxis
    });
  };

  SegmentDesignerComponent.prototype.handleLabelChange = function(ev) {
    return this.update({
      label: ev.target.value
    });
  };

  SegmentDesignerComponent.prototype.handleFilterChange = function(filter) {
    return this.update({
      filter: filter
    });
  };

  SegmentDesignerComponent.prototype.renderMode = function() {
    return R(ui.FormGroup, {
      labelMuted: true,
      label: "Type"
    }, R('div', {
      key: "single",
      className: "radio"
    }, R('label', null, R('input', {
      type: "radio",
      checked: this.state.mode === "single",
      onChange: this.handleSingleMode
    }), "Single " + this.props.segmentType, R('span', {
      className: "text-muted"
    }, " - used for summary " + this.props.segmentType + "s and empty " + this.props.segmentType + "s"))), R('div', {
      key: "multiple",
      className: "radio"
    }, R('label', null, R('input', {
      type: "radio",
      checked: this.state.mode === "multiple",
      onChange: this.handleMultipleMode
    }), "Multiple " + this.props.segmentType + "s", R('span', {
      className: "text-muted"
    }, " - disaggregate data by a field"))));
  };

  SegmentDesignerComponent.prototype.renderLabel = function() {
    return R(ui.FormGroup, {
      labelMuted: true,
      label: "Label",
      help: (this.state.mode === "multiple" ? "Optional label for the " + this.props.segmentType + "s" : void 0)
    }, R('input', {
      ref: (function(_this) {
        return function(elem) {
          return _this.labelElem = elem;
        };
      })(this),
      type: "text",
      className: "form-control",
      value: this.props.segment.label || "",
      onChange: this.handleLabelChange
    }));
  };

  SegmentDesignerComponent.prototype.renderValueAxis = function() {
    return R(ui.FormGroup, {
      labelMuted: true,
      label: "Field",
      help: "Field to disaggregate data by"
    }, R('div', {
      style: {
        marginLeft: 8
      }
    }, R(AxisComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      types: ["enum", "text", "boolean", "date"],
      aggrNeed: "none",
      value: this.props.segment.valueAxis,
      onChange: this.handleValueAxisChange,
      allowExcludedValues: true,
      filters: this.props.filters
    })));
  };

  SegmentDesignerComponent.prototype.renderFilter = function() {
    return R(ui.FormGroup, {
      labelMuted: true,
      label: [
        R(ui.Icon, {
          id: "glyphicon-filter"
        }), " Filters"
      ],
      hint: "Filters all data associated with this " + this.props.segmentType
    }, R(FilterExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: this.handleFilterChange,
      table: this.props.table,
      value: this.props.segment.filter
    }));
  };

  SegmentDesignerComponent.prototype.renderStyling = function() {
    return R(ui.FormGroup, {
      labelMuted: true,
      label: "Styling"
    }, R('label', {
      className: "checkbox-inline",
      key: "bold"
    }, R('input', {
      type: "checkbox",
      checked: this.props.segment.bold === true,
      onChange: (function(_this) {
        return function(ev) {
          return _this.update({
            bold: ev.target.checked
          });
        };
      })(this)
    }), "Bold"), R('label', {
      className: "checkbox-inline",
      key: "italic"
    }, R('input', {
      type: "checkbox",
      checked: this.props.segment.italic === true,
      onChange: (function(_this) {
        return function(ev) {
          return _this.update({
            italic: ev.target.checked
          });
        };
      })(this)
    }), "Italic"), this.props.segment.valueAxis && this.props.segment.label ? R('label', {
      className: "checkbox-inline",
      key: "valueLabelBold"
    }, R('input', {
      type: "checkbox",
      checked: this.props.segment.valueLabelBold === true,
      onChange: (function(_this) {
        return function(ev) {
          return _this.update({
            valueLabelBold: ev.target.checked
          });
        };
      })(this)
    }), "Header Bold") : void 0, this.props.segment.valueAxis && this.props.segment.label ? R('div', {
      style: {
        paddingTop: 5
      }
    }, "Shade filler cells: ", R(ColorComponent, {
      color: this.props.segment.fillerColor,
      onChange: (function(_this) {
        return function(color) {
          return _this.update({
            fillerColor: color
          });
        };
      })(this)
    })) : void 0);
  };

  SegmentDesignerComponent.prototype.renderBorders = function() {
    return R(ui.FormGroup, {
      labelMuted: true,
      label: "Borders"
    }, R('div', {
      key: "before"
    }, this.props.segmentType === "row" ? "Top: " : "Left: "), R(BorderComponent, {
      value: this.props.segment.borderBefore,
      defaultValue: 2,
      onChange: (function(_this) {
        return function(value) {
          return _this.update({
            borderBefore: value
          });
        };
      })(this)
    }), R('div', {
      key: "within"
    }, "Within: "), R(BorderComponent, {
      value: this.props.segment.borderWithin,
      defaultValue: 1,
      onChange: (function(_this) {
        return function(value) {
          return _this.update({
            borderWithin: value
          });
        };
      })(this)
    }), R('div', {
      key: "after"
    }, this.props.segmentType === "row" ? "Bottom: " : "Right: "), R(BorderComponent, {
      value: this.props.segment.borderAfter,
      defaultValue: 2,
      onChange: (function(_this) {
        return function(value) {
          return _this.update({
            borderAfter: value
          });
        };
      })(this)
    }));
  };

  SegmentDesignerComponent.prototype.render = function() {
    return R('div', null, this.renderMode(), this.state.mode ? this.renderLabel() : void 0, this.state.mode === "multiple" ? this.renderValueAxis() : void 0, this.state.mode ? this.renderFilter() : void 0, this.state.mode ? this.renderStyling() : void 0, this.state.mode ? this.renderBorders() : void 0);
  };

  return SegmentDesignerComponent;

})(React.Component);

BorderComponent = (function(superClass) {
  extend(BorderComponent, superClass);

  function BorderComponent() {
    return BorderComponent.__super__.constructor.apply(this, arguments);
  }

  BorderComponent.propTypes = {
    value: PropTypes.number,
    defaultValue: PropTypes.number,
    onChange: PropTypes.func.isRequired
  };

  BorderComponent.prototype.render = function() {
    var value;
    value = this.props.value != null ? this.props.value : this.props.defaultValue;
    return R('span', null, R('label', {
      className: "radio-inline"
    }, R('input', {
      type: "radio",
      checked: value === 0,
      onClick: (function(_this) {
        return function() {
          return _this.props.onChange(0);
        };
      })(this)
    }), "None"), R('label', {
      className: "radio-inline"
    }, R('input', {
      type: "radio",
      checked: value === 1,
      onClick: (function(_this) {
        return function() {
          return _this.props.onChange(1);
        };
      })(this)
    }), "Light"), R('label', {
      className: "radio-inline"
    }, R('input', {
      type: "radio",
      checked: value === 2,
      onClick: (function(_this) {
        return function() {
          return _this.props.onChange(2);
        };
      })(this)
    }), "Medium"), R('label', {
      className: "radio-inline"
    }, R('input', {
      type: "radio",
      checked: value === 3,
      onClick: (function(_this) {
        return function() {
          return _this.props.onChange(3);
        };
      })(this)
    }), "Heavy"));
  };

  return BorderComponent;

})(React.Component);
