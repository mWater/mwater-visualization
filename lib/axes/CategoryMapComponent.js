var AxisBuilder, CategoryMapComponent, ColorComponent, ExprCompiler, ExprUtils, PropTypes, R, React, ReorderableListComponent, _, update,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

ExprCompiler = require('mwater-expressions').ExprCompiler;

AxisBuilder = require('./AxisBuilder');

update = require('update-object');

ColorComponent = require('../ColorComponent');

ExprUtils = require('mwater-expressions').ExprUtils;

ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent");

module.exports = CategoryMapComponent = (function(superClass) {
  extend(CategoryMapComponent, superClass);

  CategoryMapComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    axis: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    categories: PropTypes.array,
    reorderable: PropTypes.bool,
    showColorMap: PropTypes.bool,
    allowExcludedValues: PropTypes.bool,
    initiallyExpanded: PropTypes.bool
  };

  function CategoryMapComponent(props) {
    this.renderCategory = bind(this.renderCategory, this);
    this.handleToggle = bind(this.handleToggle, this);
    this.handleNullLabelChange = bind(this.handleNullLabelChange, this);
    this.handleExcludeChange = bind(this.handleExcludeChange, this);
    this.handleColorChange = bind(this.handleColorChange, this);
    this.handleReorder = bind(this.handleReorder, this);
    CategoryMapComponent.__super__.constructor.call(this, props);
    this.state = {
      collapsed: !props.initiallyExpanded
    };
  }

  CategoryMapComponent.prototype.handleReorder = function(map) {
    var order;
    order = _.pluck(map, "value");
    return this.props.onChange(update(this.props.axis, {
      drawOrder: {
        $set: order
      }
    }));
  };

  CategoryMapComponent.prototype.handleColorChange = function(value, color) {
    var colorMap;
    colorMap = _.filter(this.props.axis.colorMap, (function(_this) {
      return function(item) {
        return item.value !== value;
      };
    })(this));
    if (color) {
      colorMap.push({
        value: value,
        color: color
      });
    }
    return this.props.onChange(update(this.props.axis, {
      colorMap: {
        $set: colorMap
      }
    }));
  };

  CategoryMapComponent.prototype.handleExcludeChange = function(value, ev) {
    var excludedValues;
    if (ev.target.checked) {
      excludedValues = _.difference(this.props.axis.excludedValues, [value]);
    } else {
      excludedValues = _.union(this.props.axis.excludedValues, [value]);
    }
    return this.props.onChange(update(this.props.axis, {
      excludedValues: {
        $set: excludedValues
      }
    }));
  };

  CategoryMapComponent.prototype.lookupColor = function(value) {
    var item;
    item = _.find(this.props.axis.colorMap, (function(_this) {
      return function(item) {
        return item.value === value;
      };
    })(this));
    if (item) {
      return item.color;
    }
    return null;
  };

  CategoryMapComponent.prototype.handleNullLabelChange = function(e) {
    var name;
    name = prompt("Enter label for none value", this.props.axis.nullLabel || ExprUtils.localizeString("None"));
    if (name) {
      return this.props.onChange(update(this.props.axis, {
        nullLabel: {
          $set: name
        }
      }));
    }
  };

  CategoryMapComponent.prototype.handleToggle = function() {
    return this.setState({
      collapsed: !this.state.collapsed
    });
  };

  CategoryMapComponent.prototype.renderLabel = function(category) {
    var label;
    label = ExprUtils.localizeString(category.label);
    if (category.value != null) {
      return label;
    } else {
      return R('a', {
        onClick: this.handleNullLabelChange,
        style: {
          cursor: 'pointer'
        }
      }, label, R('span', {
        style: {
          fontSize: 12,
          marginLeft: 4
        }
      }, "(click to change label for none value)"));
    }
  };

  CategoryMapComponent.prototype.renderCategory = function(category, index, connectDragSource, connectDragPreview, connectDropTarget) {
    var colorPickerStyle, elem, iconStyle, labelStyle;
    labelStyle = {
      verticalAlign: 'middle',
      marginLeft: 5
    };
    iconStyle = {
      cursor: "move",
      marginRight: 8,
      opacity: 0.5,
      fontSize: 12,
      height: 20
    };
    colorPickerStyle = {
      verticalAlign: 'middle',
      lineHeight: 1,
      display: 'inline-block',
      marginLeft: 5
    };
    elem = R('div', {
      key: category.value
    }, connectDragSource ? connectDragSource(R('i', {
      className: "fa fa-bars",
      style: iconStyle
    })) : void 0, this.props.allowExcludedValues ? R('input', {
      type: "checkbox",
      style: {
        marginLeft: 5,
        marginBottom: 5,
        verticalAlign: "middle"
      },
      checked: !_.includes(this.props.axis.excludedValues, category.value),
      onChange: this.handleExcludeChange.bind(null, category.value)
    }) : void 0, this.props.showColorMap ? R('div', {
      style: colorPickerStyle
    }, R(ColorComponent, {
      key: 'color',
      color: this.lookupColor(category.value),
      onChange: (function(_this) {
        return function(color) {
          return _this.handleColorChange(category.value, color);
        };
      })(this)
    })) : void 0, R('span', {
      style: labelStyle
    }, this.renderLabel(category)));
    if (connectDropTarget) {
      elem = connectDropTarget(elem);
    }
    if (connectDragPreview) {
      elem = connectDragPreview(elem);
    }
    return elem;
  };

  CategoryMapComponent.prototype.renderReorderable = function() {
    var drawOrder, orderedCategories;
    drawOrder = this.props.axis.drawOrder || _.pluck(this.props.axis.colorMap, "value");
    orderedCategories = _.sortBy(this.props.categories, (function(_this) {
      return function(category) {
        return _.indexOf(drawOrder, category.value);
      };
    })(this));
    return R('div', null, this.renderToggle(), R(ReorderableListComponent, {
      items: orderedCategories,
      onReorder: this.handleReorder,
      renderItem: this.renderCategory,
      getItemId: (function(_this) {
        return function(item) {
          return item.value;
        };
      })(this)
    }));
  };

  CategoryMapComponent.prototype.renderNonReorderable = function() {
    return R('div', null, this.renderToggle(), _.map(this.props.categories, (function(_this) {
      return function(category) {
        return _this.renderCategory(category);
      };
    })(this)));
  };

  CategoryMapComponent.prototype.renderToggle = function() {
    if (this.state.collapsed) {
      return R('div', null, R('a', {
        onClick: this.handleToggle
      }, "Show Values ", R('i', {
        className: "fa fa-caret-down"
      })));
    } else {
      return R('div', null, R('a', {
        onClick: this.handleToggle
      }, "Hide Values ", R('i', {
        className: "fa fa-caret-up"
      })));
    }
  };

  CategoryMapComponent.prototype.render = function() {
    if (this.state.collapsed) {
      return this.renderToggle();
    }
    if (this.props.reorderable) {
      return this.renderReorderable();
    } else {
      return this.renderNonReorderable();
    }
  };

  return CategoryMapComponent;

})(React.Component);
