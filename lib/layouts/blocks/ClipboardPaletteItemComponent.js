var ClipboardPaletteItemComponent, DragSourceComponent, DropTarget, PropTypes, R, React, _, blockTargetSpec, collectTarget, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

uuid = require('uuid');

DragSourceComponent = require('../DragSourceComponent')("block");

DropTarget = require('react-dnd').DropTarget;

ClipboardPaletteItemComponent = (function(superClass) {
  extend(ClipboardPaletteItemComponent, superClass);

  function ClipboardPaletteItemComponent() {
    this.handleClear = bind(this.handleClear, this);
    this.createItem = bind(this.createItem, this);
    return ClipboardPaletteItemComponent.__super__.constructor.apply(this, arguments);
  }

  ClipboardPaletteItemComponent.propTypes = {
    clipboard: PropTypes.object,
    onClipboardChange: PropTypes.func,
    cantPasteMessage: PropTypes.string
  };

  ClipboardPaletteItemComponent.prototype.createItem = function() {
    return {
      block: _.extend({}, this.props.clipboard, {
        id: uuid()
      })
    };
  };

  ClipboardPaletteItemComponent.prototype.handleClear = function() {
    if (confirm("Clear clipboard?")) {
      return this.props.onClipboardChange(null);
    }
  };

  ClipboardPaletteItemComponent.prototype.render = function() {
    var elem;
    elem = this.props.connectDropTarget(R('div', {
      className: (this.props.clipboard && !this.props.cantPasteMessage ? "mwater-visualization-palette-item" : "mwater-visualization-palette-item disabled"),
      style: (this.props.isOver ? {
        backgroundColor: "#2485dd"
      } : void 0)
    }, R('div', {
      className: "title",
      key: "title"
    }, this.props.isOver ? R('i', {
      className: "fa fa-clone"
    }) : R('i', {
      className: "fa fa-clipboard"
    })), R('div', {
      className: "subtitle",
      key: "subtitle"
    }, this.props.isOver ? "Copy" : "Clipboard"), this.props.cantPasteMessage ? R('div', {
      className: "tooltiptext"
    }, this.props.cantPasteMessage) : R('div', {
      className: "tooltiptext"
    }, "Clipboard allows copying widgets even between dashboards. Drop a widget on it to copy."), this.props.clipboard ? R('div', {
      className: "clearclipboard",
      onClick: this.handleClear
    }, R('i', {
      className: "fa fa-trash-o"
    })) : void 0));
    if (this.props.clipboard && !this.props.cantPasteMessage) {
      elem = R(DragSourceComponent, {
        createDragItem: this.createItem
      }, elem);
    }
    return elem;
  };

  return ClipboardPaletteItemComponent;

})(React.Component);

blockTargetSpec = {
  canDrop: function(props, monitor) {
    return true;
  },
  drop: function(props, monitor, component) {
    if (monitor.didDrop()) {
      return;
    }
    props.onClipboardChange(monitor.getItem().block);
  }
};

collectTarget = function(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({
      shallow: true
    }),
    canDrop: monitor.canDrop()
  };
};

module.exports = _.flow(DropTarget("block", blockTargetSpec, collectTarget))(ClipboardPaletteItemComponent);
