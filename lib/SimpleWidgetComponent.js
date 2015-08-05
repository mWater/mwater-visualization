var H, React, SimpleWidgetComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

module.exports = SimpleWidgetComponent = (function(superClass) {
  extend(SimpleWidgetComponent, superClass);

  function SimpleWidgetComponent() {
    this.closeMenu = bind(this.closeMenu, this);
    this.renderDropdownItem = bind(this.renderDropdownItem, this);
    this.handleRemove = bind(this.handleRemove, this);
    this.handleClick = bind(this.handleClick, this);
    return SimpleWidgetComponent.__super__.constructor.apply(this, arguments);
  }

  SimpleWidgetComponent.propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    selected: React.PropTypes.bool,
    onSelect: React.PropTypes.func,
    onRemove: React.PropTypes.func,
    connectMoveHandle: React.PropTypes.func,
    connectResizeHandle: React.PropTypes.func,
    dropdownItems: React.PropTypes.arrayOf(React.PropTypes.shape({
      node: React.PropTypes.node.isRequired,
      onClick: React.PropTypes.func.isRequired
    })).isRequired
  };

  SimpleWidgetComponent.prototype.handleClick = function(ev) {
    ev.stopPropagation();
    return this.props.onSelect();
  };

  SimpleWidgetComponent.prototype.handleRemove = function(ev) {
    ev.stopPropagation();
    return this.props.onRemove();
  };

  SimpleWidgetComponent.prototype.renderResizeHandle = function() {
    var resizeHandleStyle;
    resizeHandleStyle = {
      position: "absolute",
      right: 0,
      bottom: 0,
      backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAB3RJTUUH2AkPCjIF90dj7QAAAAlwSFlzAAAPYQAAD2EBqD+naQAAAARnQU1BAACxjwv8YQUAAABISURBVHjaY2QgABwcHMSBlAETEYpagPgIIxGKCg4cOPCVkZAiIObBajUWRZhW41CEajUuRShWE1AEsZoIRWCrQSbawDh42AwAdwQtJBOblO0AAAAASUVORK5CYII=')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right bottom",
      width: 30,
      height: 30,
      cursor: "nwse-resize"
    };
    if (this.props.connectResizeHandle) {
      return this.props.connectResizeHandle(H.div({
        style: resizeHandleStyle,
        className: "mwater-visualization-simple-widget-resize-handle"
      }));
    }
  };

  SimpleWidgetComponent.prototype.renderDropdownItem = function(item) {
    return H.li({
      key: item.node
    }, H.a({
      onClick: item.onClick
    }, item.node));
  };

  SimpleWidgetComponent.prototype.renderDropdown = function() {
    var dropdownStyle, elem;
    dropdownStyle = {
      position: "absolute",
      right: 5,
      top: 5,
      cursor: "pointer"
    };
    elem = H.div({
      style: dropdownStyle,
      "data-toggle": "dropdown"
    }, H.div({}, H.div({
      className: "mwater-visualization-simple-widget-gear-button",
      onClick: this.handleGear
    }, H.span({
      className: "glyphicon glyphicon-cog"
    }))));
    return H.div({
      style: dropdownStyle
    }, elem, H.ul({
      className: "dropdown-menu dropdown-menu-right",
      style: {
        top: 25
      }
    }, _.map(this.props.dropdownItems, this.renderDropdownItem)));
  };

  SimpleWidgetComponent.prototype.closeMenu = function() {
    return $(React.findDOMNode(this)).find('[data-toggle="dropdown"]').parent().removeClass('open');
  };

  SimpleWidgetComponent.prototype.render = function() {
    var contents, elem, style;
    style = {
      width: this.props.width,
      height: this.props.height,
      padding: 10
    };
    if (this.props.selected) {
      style.border = "dashed 2px #AAA";
    }
    contents = H.div({
      style: {
        position: "absolute",
        left: 10,
        top: 10,
        right: 10,
        bottom: 10
      }
    }, React.cloneElement(React.Children.only(this.props.children), {
      width: this.props.width - 20,
      height: this.props.height - 20
    }));
    elem = H.div({
      className: "mwater-visualization-simple-widget",
      style: style,
      onClick: this.handleClick,
      onMouseLeave: this.closeMenu
    }, contents, this.renderResizeHandle(), this.renderDropdown());
    if (this.props.connectMoveHandle) {
      elem = this.props.connectMoveHandle(elem);
    }
    return elem;
  };

  return SimpleWidgetComponent;

})(React.Component);
