var Draggable, FloatingWindowComponent, H, React, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

_ = require('lodash');

Draggable = require('react-draggable');

module.exports = FloatingWindowComponent = (function(superClass) {
  extend(FloatingWindowComponent, superClass);

  function FloatingWindowComponent() {
    return FloatingWindowComponent.__super__.constructor.apply(this, arguments);
  }

  FloatingWindowComponent.propTypes = {
    initialBounds: React.PropTypes.object.isRequired,
    title: React.PropTypes.string,
    onClose: React.PropTypes.func
  };

  FloatingWindowComponent.prototype.componentWillReceiveProps = function(nextProps) {
    if (!_.isEqual(nextProps.initialBounds, this.props.initialBounds)) {
      return this.refs.draggable.resetState();
    }
  };

  FloatingWindowComponent.prototype.renderHeader = function() {
    var closeStyle, headerStyle;
    headerStyle = {
      height: 30,
      backgroundColor: "#DDD",
      padding: 5,
      textAlign: "center",
      borderBottom: "solid 1px #AAA",
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      fontWeight: "bold",
      cursor: "move"
    };
    closeStyle = {
      position: "absolute",
      right: 8,
      top: 6,
      color: "#888",
      cursor: "pointer"
    };
    return H.div({
      style: headerStyle
    }, this.props.onClose ? H.div({
      style: closeStyle,
      onClick: this.props.onClose
    }, H.span({
      className: "glyphicon glyphicon-remove"
    })) : void 0, this.props.title);
  };

  FloatingWindowComponent.prototype.render = function() {
    var contentsStyle, windowStyle;
    windowStyle = {
      width: this.props.initialBounds.width,
      height: this.props.initialBounds.height,
      borderRadius: 10,
      border: "solid 1px #aaa",
      backgroundColor: "#FFF",
      boxShadow: "5px 5px 12px 0px rgba(0,0,0,0.5)",
      position: "absolute",
      left: this.props.initialBounds.x,
      top: this.props.initialBounds.y,
      zIndex: 1000
    };
    contentsStyle = {
      overflowY: "auto",
      padding: 10,
      height: this.props.initialBounds.height - 35
    };
    return React.createElement(Draggable, {
      ref: "draggable",
      zIndex: 1001
    }, H.div({
      style: windowStyle
    }, this.renderHeader(), H.div({
      style: contentsStyle
    }, this.props.children)));
  };

  return FloatingWindowComponent;

})(React.Component);
