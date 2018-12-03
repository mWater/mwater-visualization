var AxisBuilder, LinkComponent, NumberInputComponent, PropTypes, R, RangeComponent, RangesComponent, React, ReorderableListComponent, update, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

uuid = require('uuid');

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
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    expr: PropTypes.object.isRequired,
    xform: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
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
      id: uuid(),
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
    return R('div', null, R('table', null, this.props.xform.ranges.length > 0 ? R('thead', null, R('tr', null, R('th', null, " "), R('th', {
      key: "min",
      colSpan: 2,
      style: {
        textAlign: "center"
      }
    }, "From"), R('th', {
      key: "and"
    }, ""), R('th', {
      key: "max",
      colSpan: 2,
      style: {
        textAlign: "center"
      }
    }, "To"), R('th', {
      key: "label",
      colSpan: 1,
      style: {
        textAlign: "center"
      }
    }, "Label"), R('th', {
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
      element: R('tbody', null)
    })), R('button', {
      className: "btn btn-link btn-sm",
      type: "button",
      onClick: this.handleAddRange
    }, R('span', {
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
    range: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired
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
    return this.props.connectDragPreview(this.props.connectDropTarget(R('tr', null, R('td', null, this.props.connectDragSource(R('span', {
      className: "fa fa-bars"
    }))), R('td', {
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
    }, this.props.range.minOpen ? "greater than" : "greater than or equal to")), R('td', {
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
    })), R('td', {
      key: "and"
    }, "\u00A0and\u00A0"), R('td', {
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
    }, this.props.range.maxOpen ? "less than" : "less than or equal to")), R('td', {
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
    })), R('td', {
      key: "label"
    }, R('input', {
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
    })), R('td', {
      key: "remove"
    }, R('button', {
      className: "btn btn-xs btn-link",
      type: "button",
      onClick: this.props.onRemove
    }, R('span', {
      className: "glyphicon glyphicon-remove"
    }))))));
  };

  return RangeComponent;

})(React.Component);
