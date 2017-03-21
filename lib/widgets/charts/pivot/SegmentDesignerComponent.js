var AxisComponent, BorderComponent, FormGroup, H, R, React, SegmentDesignerComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

AxisComponent = require('../../../axes/AxisComponent');

module.exports = SegmentDesignerComponent = (function(superClass) {
  extend(SegmentDesignerComponent, superClass);

  SegmentDesignerComponent.propTypes = {
    segment: React.PropTypes.object.isRequired,
    table: React.PropTypes.string.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    segmentType: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  function SegmentDesignerComponent(props) {
    this.handleLabelChange = bind(this.handleLabelChange, this);
    this.handleValueAxisChange = bind(this.handleValueAxisChange, this);
    this.handleMultipleMode = bind(this.handleMultipleMode, this);
    this.handleSingleMode = bind(this.handleSingleMode, this);
    SegmentDesignerComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      mode: !props.segment.label && !props.segment.valueAxis ? "multiple" : props.segment.valueAxis ? "multiple" : "single"
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

  SegmentDesignerComponent.prototype.renderMode = function() {
    return R(FormGroup, {
      label: "Type"
    }, H.div({
      key: "single",
      className: "radio"
    }, H.label(null, H.input({
      type: "radio",
      checked: this.state.mode === "single",
      onChange: this.handleSingleMode
    }), "Single " + this.props.segmentType, H.span({
      className: "text-muted"
    }, " - used for summary " + this.props.segmentType + "s and empty " + this.props.segmentType + "s"))), H.div({
      key: "multiple",
      className: "radio"
    }, H.label(null, H.input({
      type: "radio",
      checked: this.state.mode === "multiple",
      onChange: this.handleMultipleMode
    }), "Multiple " + this.props.segmentType + "s", H.span({
      className: "text-muted"
    }, " - disaggregate data by a field"))));
  };

  SegmentDesignerComponent.prototype.renderLabel = function() {
    return R(FormGroup, {
      label: "Label",
      help: (this.state.mode === "multiple" ? "Optional label for the " + this.props.segmentType + "s" : void 0)
    }, H.input({
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
    return R(FormGroup, {
      label: "Field",
      help: "Field to disaggregate data by"
    }, H.div({
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
      allowExcludedValues: true
    })));
  };

  SegmentDesignerComponent.prototype.renderStyling = function() {
    return R(FormGroup, {
      label: "Styling"
    }, H.label({
      className: "checkbox-inline",
      key: "bold"
    }, H.input({
      type: "checkbox",
      checked: this.props.segment.bold === true,
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
      checked: this.props.segment.italic === true,
      onChange: (function(_this) {
        return function(ev) {
          return _this.update({
            italic: ev.target.checked
          });
        };
      })(this)
    }), "Italic"), this.props.segment.valueAxis && this.props.segment.label ? H.label({
      className: "checkbox-inline",
      key: "valueLabelBold"
    }, H.input({
      type: "checkbox",
      checked: this.props.segment.valueLabelBold === true,
      onChange: (function(_this) {
        return function(ev) {
          return _this.update({
            valueLabelBold: ev.target.checked
          });
        };
      })(this)
    }), "Header Bold") : void 0);
  };

  SegmentDesignerComponent.prototype.renderBorders = function() {
    return R(FormGroup, {
      label: "Borders"
    }, H.div({
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
    }), H.div({
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
    }), H.div({
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
    return H.div(null, this.renderMode(), this.renderLabel(), this.state.mode === "multiple" ? this.renderValueAxis() : void 0, this.renderStyling(), this.renderBorders());
  };

  return SegmentDesignerComponent;

})(React.Component);

BorderComponent = (function(superClass) {
  extend(BorderComponent, superClass);

  function BorderComponent() {
    return BorderComponent.__super__.constructor.apply(this, arguments);
  }

  BorderComponent.propTypes = {
    value: React.PropTypes.number,
    defaultValue: React.PropTypes.number,
    onChange: React.PropTypes.func.isRequired
  };

  BorderComponent.prototype.render = function() {
    var value;
    value = this.props.value != null ? this.props.value : this.props.defaultValue;
    return H.span(null, H.label({
      className: "radio-inline"
    }, H.input({
      type: "radio",
      checked: value === 0,
      onClick: (function(_this) {
        return function() {
          return _this.props.onChange(0);
        };
      })(this)
    }), "None"), H.label({
      className: "radio-inline"
    }, H.input({
      type: "radio",
      checked: value === 1,
      onClick: (function(_this) {
        return function() {
          return _this.props.onChange(1);
        };
      })(this)
    }), "Light"), H.label({
      className: "radio-inline"
    }, H.input({
      type: "radio",
      checked: value === 2,
      onClick: (function(_this) {
        return function() {
          return _this.props.onChange(2);
        };
      })(this)
    }), "Medium"), H.label({
      className: "radio-inline"
    }, H.input({
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
