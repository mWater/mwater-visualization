var AxisComponent, BorderComponent, ColorComponent, DashboardPopupSelectorComponent, FilterExprComponent, H, R, React, SegmentDesignerComponent, _, ui, update,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

ui = require('react-library/lib/bootstrap');

update = require('react-library/lib/update');

AxisComponent = require('../../../axes/AxisComponent');

ColorComponent = require('../../../ColorComponent');

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;

DashboardPopupSelectorComponent = require('../../../dashboards/DashboardPopupSelectorComponent');

module.exports = SegmentDesignerComponent = (function(superClass) {
  extend(SegmentDesignerComponent, superClass);

  SegmentDesignerComponent.propTypes = {
    segment: React.PropTypes.object.isRequired,
    table: React.PropTypes.string.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    widgetDataSource: React.PropTypes.object.isRequired,
    segmentType: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    popups: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
      design: React.PropTypes.object.isRequired
    })).isRequired,
    onPopupsChange: React.PropTypes.func,
    onSystemAction: React.PropTypes.func,
    namedStrings: React.PropTypes.object,
    filters: React.PropTypes.arrayOf(React.PropTypes.shape({
      table: React.PropTypes.string.isRequired,
      jsonql: React.PropTypes.object.isRequired
    }))
  };

  function SegmentDesignerComponent(props) {
    this.handleFilterChange = bind(this.handleFilterChange, this);
    this.handleLabelChange = bind(this.handleLabelChange, this);
    this.handleValueAxisChange = bind(this.handleValueAxisChange, this);
    this.handleMultipleMode = bind(this.handleMultipleMode, this);
    this.handleSingleMode = bind(this.handleSingleMode, this);
    this.update = bind(this.update, this);
    SegmentDesignerComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      mode: (props.segment.label == null) && !props.segment.valueAxis ? null : props.segment.valueAxis ? "multiple" : "single"
    };
  }

  SegmentDesignerComponent.prototype.update = function() {
    return update(this.props.segment, this.props.onChange, arguments);
  };

  SegmentDesignerComponent.prototype.componentDidMount = function() {
    var ref;
    return (ref = this.labelElem) != null ? ref.focus() : void 0;
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
    return R(ui.FormGroup, {
      labelMuted: true,
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
    return R(ui.FormGroup, {
      labelMuted: true,
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
    }), "Header Bold") : void 0, this.props.segment.valueAxis && this.props.segment.label ? H.div({
      style: {
        paddingTop: 5
      }
    }, "Shade filler cells: ", R(ColorComponent, {
      color: this.props.segment.fillerColor,
      onChange: this.update("fillerColor")
    })) : void 0);
  };

  SegmentDesignerComponent.prototype.renderBorders = function() {
    return R(ui.FormGroup, {
      labelMuted: true,
      label: "Borders"
    }, H.div({
      key: "before"
    }, this.props.segmentType === "row" ? "Top: " : "Left: "), R(BorderComponent, {
      value: this.props.segment.borderBefore,
      defaultValue: 2,
      onChange: this.update("borderBefore")
    }), H.div({
      key: "within"
    }, "Within: "), R(BorderComponent, {
      value: this.props.segment.borderWithin,
      defaultValue: 1,
      onChange: this.update("borderWithin")
    }), H.div({
      key: "after"
    }, this.props.segmentType === "row" ? "Bottom: " : "Right: "), R(BorderComponent, {
      value: this.props.segment.borderAfter,
      defaultValue: 2,
      onChange: this.update("borderAfter")
    }));
  };

  SegmentDesignerComponent.prototype.renderAdvanced = function() {
    if (this.props.segment.valueAxis) {
      return R(ui.CollapsibleSection, {
        label: "Advanced",
        labelMuted: true
      }, R(ui.FormGroup, {
        labelMuted: true,
        label: "When " + this.props.segmentType + " value is clicked:"
      }, R(ui.Select, {
        value: this.props.segment.clickAction || null,
        onChange: this.update("clickAction"),
        options: [
          {
            value: null,
            label: "Do nothing"
          }, {
            value: "scope",
            label: "Filter other widgets"
          }, {
            value: "popup",
            label: "Open popup"
          }
        ]
      })), this.props.segment.clickAction === "popup" ? R(DashboardPopupSelectorComponent, {
        popups: this.props.popups,
        onPopupsChange: this.props.onPopupsChange,
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        widgetDataSource: this.props.widgetDataSource,
        onSystemAction: this.props.onSystemAction,
        namedStrings: this.props.namedStrings,
        filters: this.props.filters,
        popupId: this.props.segment.clickActionPopup,
        onPopupIdChange: this.update("clickActionPopup")
      }) : void 0);
    }
  };

  SegmentDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderMode(), this.state.mode ? this.renderLabel() : void 0, this.state.mode === "multiple" ? this.renderValueAxis() : void 0, this.state.mode ? this.renderFilter() : void 0, this.state.mode ? this.renderStyling() : void 0, this.state.mode ? this.renderBorders() : void 0, this.state.mode ? this.renderAdvanced() : void 0);
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
