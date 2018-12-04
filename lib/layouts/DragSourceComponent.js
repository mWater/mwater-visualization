var DragSource, DragSourceComponent, PropTypes, R, React, _, collectSource, sourceSpec,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

DragSource = require('react-dnd').DragSource;

sourceSpec = {
  beginDrag: function(props, monitor, component) {
    return props.createDragItem();
  }
};

collectSource = function(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview()
  };
};

DragSourceComponent = (function(superClass) {
  extend(DragSourceComponent, superClass);

  function DragSourceComponent() {
    return DragSourceComponent.__super__.constructor.apply(this, arguments);
  }

  DragSourceComponent.propTypes = {
    createDragItem: PropTypes.func.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired
  };

  DragSourceComponent.prototype.render = function() {
    return this.props.connectDragPreview(this.props.connectDragSource(this.props.children));
  };

  return DragSourceComponent;

})(React.Component);

module.exports = function(type) {
  return DragSource(type, sourceSpec, collectSource)(DragSourceComponent);
};
