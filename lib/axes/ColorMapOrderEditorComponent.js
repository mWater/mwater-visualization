var ColorMapOrderEditorComponent, H, R, React, ReorderableListComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent");

module.exports = ColorMapOrderEditorComponent = (function(superClass) {
  extend(ColorMapOrderEditorComponent, superClass);

  ColorMapOrderEditorComponent.propTypes = {
    colorMap: React.PropTypes.array.isRequired,
    categories: React.PropTypes.array.isRequired,
    order: React.PropTypes.array.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  function ColorMapOrderEditorComponent() {
    this.renderItem = bind(this.renderItem, this);
    this.handleDone = bind(this.handleDone, this);
    this.handleEdit = bind(this.handleEdit, this);
    this.handleReorder = bind(this.handleReorder, this);
    this.state = {
      editing: false
    };
  }

  ColorMapOrderEditorComponent.prototype.handleReorder = function(map) {
    return this.props.onChange(_.pluck(map, "value"));
  };

  ColorMapOrderEditorComponent.prototype.handleEdit = function() {
    return this.setState({
      editing: true
    });
  };

  ColorMapOrderEditorComponent.prototype.handleDone = function() {
    return this.setState({
      editing: false
    });
  };

  ColorMapOrderEditorComponent.prototype.renderItem = function(item, index, connectDragSource, connectDragPreview, connectDropTarget) {
    var colorStyle, iconStyle, label, labelStyle, ref;
    colorStyle = {
      height: 16,
      width: 16,
      display: 'inline-block',
      background: item.color,
      marginRight: 4,
      verticalAlign: 'middle'
    };
    labelStyle = {
      verticalAlign: 'middle'
    };
    iconStyle = {
      cursor: "move",
      marginRight: 8,
      opacity: 0.5,
      fontSize: 12
    };
    label = (ref = _.find(this.props.categories, {
      value: item.value
    })) != null ? ref.label : void 0;
    return connectDragPreview(connectDropTarget(H.div(null, connectDragSource(H.i({
      className: "fa fa-bars",
      style: iconStyle
    })), H.span({
      style: colorStyle
    }), H.span({
      style: labelStyle
    }, label))));
  };

  ColorMapOrderEditorComponent.prototype.renderControl = function() {
    return H.p(null, H.a({
      style: {
        cursor: "pointer"
      },
      onClick: this.handleEdit
    }, "Set color priorities"));
  };

  ColorMapOrderEditorComponent.prototype.render = function() {
    var items;
    if (this.state.editing) {
      items = _.sortBy(this.props.colorMap, (function(_this) {
        return function(item) {
          return _.indexOf(_this.props.order, item.value);
        };
      })(this));
      return H.div(null, R(ReorderableListComponent, {
        items: items,
        onReorder: this.handleReorder,
        renderItem: this.renderItem,
        getItemId: (function(_this) {
          return function(item) {
            return item.value;
          };
        })(this)
      }), H.p(null, H.a({
        style: {
          cursor: "pointer"
        },
        onClick: this.handleDone
      }, "Done")));
    } else {
      return this.renderControl();
    }
  };

  return ColorMapOrderEditorComponent;

})(React.Component);
