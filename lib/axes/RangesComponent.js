var AxisBuilder, H, LinkComponent, NumberInputComponent, R, RangeComponent, RangesComponent, React, ReorderableListComponent, update, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

uuid = require('node-uuid');

update = require('update-object');

LinkComponent = require('mwater-expressions-ui').LinkComponent;

AxisBuilder = require('./AxisBuilder');

NumberInputComponent = require('react-library/lib/NumberInputComponent');

ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent");

module.exports = RangesComponent = (function(superClass) {
  extend(RangesComponent, superClass);

  function RangesComponent() {
    this.handleReorder = bind(this.handleReorder, this);
    this.renderRange = bind(this.renderRange, this);
    this.handleRemoveRange = bind(this.handleRemoveRange, this);
    this.handleAddRange = bind(this.handleAddRange, this);
    this.handleRangeChange = bind(this.handleRangeChange, this);
    return RangesComponent.__super__.constructor.apply(this, arguments);
  }

  RangesComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    expr: React.PropTypes.object.isRequired,
    xform: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  RangesComponent.prototype.handleRangeChange = function(index, range) {
    var ranges;
    ranges = this.props.xform.ranges.slice();
    ranges[index] = range;
    return this.props.onChange(update(this.props.xform, {
      ranges: {
        $set: ranges
      }
    }));
  };

  RangesComponent.prototype.handleAddRange = function() {
    var ranges;
    ranges = this.props.xform.ranges.slice();
    ranges.push({
      id: uuid.v4(),
      minOpen: false,
      maxOpen: true
    });
    return this.props.onChange(update(this.props.xform, {
      ranges: {
        $set: ranges
      }
    }));
  };

  RangesComponent.prototype.handleRemoveRange = function(index) {
    var ranges;
    ranges = this.props.xform.ranges.slice();
    ranges.splice(index, 1);
    return this.props.onChange(update(this.props.xform, {
      ranges: {
        $set: ranges
      }
    }));
  };

  RangesComponent.prototype.renderRange = function(range, index, connectDragSource, connectDragPreview, connectDropTarget) {
    return R(RangeComponent, {
      key: range.id,
      range: range,
      onChange: this.handleRangeChange.bind(null, index),
      onRemove: this.handleRemoveRange.bind(null, index),
      connectDragSource: connectDragSource,
      connectDragPreview: connectDragPreview,
      connectDropTarget: connectDropTarget
    });
  };

  RangesComponent.prototype.handleReorder = function(ranges) {
    return this.props.onChange(update(this.props.xform, {
      ranges: {
        $set: ranges
      }
    }));
  };

  RangesComponent.prototype.render = function() {
    return H.div(null, H.table(null, this.props.xform.ranges.length > 0 ? H.thead(null, H.tr(null, H.th(null, " "), H.th({
      key: "min",
      colSpan: 2,
      style: {
        textAlign: "center"
      }
    }, "From"), H.th({
      key: "and"
    }, ""), H.th({
      key: "max",
      colSpan: 2,
      style: {
        textAlign: "center"
      }
    }, "To"), H.th({
      key: "label",
      colSpan: 1,
      style: {
        textAlign: "center"
      }
    }, "Label"), H.th({
      key: "remove"
    }))) : void 0, React.createElement(ReorderableListComponent, {
      items: this.props.xform.ranges,
      onReorder: this.handleReorder,
      renderItem: this.renderRange,
      getItemId: (function(_this) {
        return function(range) {
          return range.id;
        };
      })(this),
      element: H.tbody(null)
    })), H.button({
      className: "btn btn-link btn-sm",
      type: "button",
      onClick: this.handleAddRange
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }), " Add Range"));
  };

  return RangesComponent;

})(React.Component);

RangeComponent = (function(superClass) {
  extend(RangeComponent, superClass);

  function RangeComponent() {
    this.handleMaxOpenChange = bind(this.handleMaxOpenChange, this);
    this.handleMinOpenChange = bind(this.handleMinOpenChange, this);
    return RangeComponent.__super__.constructor.apply(this, arguments);
  }

  RangeComponent.propTypes = {
    range: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func.isRequired,
    connectDragSource: React.PropTypes.func.isRequired,
    connectDragPreview: React.PropTypes.func.isRequired,
    connectDropTarget: React.PropTypes.func.isRequired
  };

  RangeComponent.prototype.handleMinOpenChange = function(minOpen) {
    return this.props.onChange(update(this.props.range, {
      minOpen: {
        $set: minOpen
      }
    }));
  };

  RangeComponent.prototype.handleMaxOpenChange = function(maxOpen) {
    return this.props.onChange(update(this.props.range, {
      maxOpen: {
        $set: maxOpen
      }
    }));
  };

  RangeComponent.prototype.render = function() {
    var placeholder;
    placeholder = "";
    if (this.props.range.minValue != null) {
      if (this.props.range.minOpen) {
        placeholder = "> " + this.props.range.minValue;
      } else {
        placeholder = ">= " + this.props.range.minValue;
      }
    }
    if (this.props.range.maxValue != null) {
      if (placeholder) {
        placeholder += " and ";
      }
      if (this.props.range.maxOpen) {
        placeholder += "< " + this.props.range.maxValue;
      } else {
        placeholder += "<= " + this.props.range.maxValue;
      }
    }
    return this.props.connectDragPreview(this.props.connectDropTarget(H.tr(null, H.td(null, this.props.connectDragSource(H.span({
      className: "fa fa-bars"
    }))), H.td({
      key: "minOpen"
    }, R(LinkComponent, {
      dropdownItems: [
        {
          id: true,
          name: "greater than"
        }, {
          id: false,
          name: "greater than or equal to"
        }
      ],
      onDropdownItemClicked: this.handleMinOpenChange
    }, this.props.range.minOpen ? "greater than" : "greater than or equal to")), H.td({
      key: "minValue"
    }, R(NumberInputComponent, {
      value: this.props.range.minValue,
      placeholder: "None",
      small: true,
      onChange: (function(_this) {
        return function(v) {
          return _this.props.onChange(update(_this.props.range, {
            minValue: {
              $set: v
            }
          }));
        };
      })(this)
    })), H.td({
      key: "and"
    }, "\u00A0and\u00A0"), H.td({
      key: "maxOpen"
    }, R(LinkComponent, {
      dropdownItems: [
        {
          id: true,
          name: "less than"
        }, {
          id: false,
          name: "less than or equal to"
        }
      ],
      onDropdownItemClicked: this.handleMaxOpenChange
    }, this.props.range.maxOpen ? "less than" : "less than or equal to")), H.td({
      key: "maxValue"
    }, R(NumberInputComponent, {
      value: this.props.range.maxValue,
      placeholder: "None",
      small: true,
      onChange: (function(_this) {
        return function(v) {
          return _this.props.onChange(update(_this.props.range, {
            maxValue: {
              $set: v
            }
          }));
        };
      })(this)
    })), H.td({
      key: "label"
    }, H.input({
      type: "text",
      className: "form-control input-sm",
      value: this.props.range.label || "",
      placeholder: placeholder,
      onChange: (function(_this) {
        return function(ev) {
          return _this.props.onChange(update(_this.props.range, {
            label: {
              $set: ev.target.value || null
            }
          }));
        };
      })(this)
    })), H.td({
      key: "remove"
    }, H.button({
      className: "btn btn-xs btn-link",
      type: "button",
      onClick: this.props.onRemove
    }, H.span({
      className: "glyphicon glyphicon-remove"
    }))))));
  };

  return RangeComponent;

})(React.Component);
