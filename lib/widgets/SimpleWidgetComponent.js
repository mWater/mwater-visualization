var FloatingWindowComponent, H, React, SimpleWidgetComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

FloatingWindowComponent = require('../FloatingWindowComponent');

module.exports = SimpleWidgetComponent = (function(superClass) {
  extend(SimpleWidgetComponent, superClass);

  SimpleWidgetComponent.propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    highlighted: React.PropTypes.bool,
    connectMoveHandle: React.PropTypes.func,
    connectResizeHandle: React.PropTypes.func,
    editor: React.PropTypes.node,
    dropdownItems: React.PropTypes.arrayOf(React.PropTypes.shape({
      label: React.PropTypes.node.isRequired,
      icon: React.PropTypes.string,
      onClick: React.PropTypes.func.isRequired
    })).isRequired,
    editorInitiallyDisplayed: React.PropTypes.bool
  };

  function SimpleWidgetComponent() {
    this.closeMenu = bind(this.closeMenu, this);
    this.renderDropdownItem = bind(this.renderDropdownItem, this);
    this.handleCloseEditor = bind(this.handleCloseEditor, this);
    SimpleWidgetComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      editorInitialBounds: null
    };
  }

  SimpleWidgetComponent.prototype.componentDidMount = function() {
    if (this.props.editorInitiallyDisplayed) {
      return this.displayEditor();
    }
  };

  SimpleWidgetComponent.prototype.displayEditor = function() {
    var editorInitialBounds, height, myElem, spaceRight, width;
    myElem = React.findDOMNode(this);
    width = 500;
    height = 600;
    editorInitialBounds = {
      x: myElem.offsetLeft + myElem.offsetWidth - 5,
      y: myElem.offsetTop + 5,
      width: width,
      height: height
    };
    spaceRight = document.body.clientWidth - myElem.getBoundingClientRect().right;
    if (spaceRight < width) {
      editorInitialBounds.x -= width - spaceRight;
    }
    return this.setState({
      editorInitialBounds: editorInitialBounds
    });
  };

  SimpleWidgetComponent.prototype.handleCloseEditor = function() {
    return this.setState({
      editorInitialBounds: null
    });
  };

  SimpleWidgetComponent.prototype.renderEditor = function() {
    if (this.state.editorInitialBounds == null) {
      return;
    }
    return React.createElement(FloatingWindowComponent, {
      initialBounds: this.state.editorInitialBounds,
      title: "Designer",
      onClose: this.handleCloseEditor
    }, this.props.editor);
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

  SimpleWidgetComponent.prototype.renderDropdownItem = function(item, i) {
    return H.li({
      key: "" + i
    }, H.a({
      onClick: item.onClick
    }, item.icon ? H.span({
      className: "glyphicon glyphicon-" + item.icon + " text-muted"
    }) : void 0, item.icon ? " " : void 0, item.label));
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
    }, H.div({
      className: "mwater-visualization-simple-widget-gear-button"
    }, H.span({
      className: "glyphicon glyphicon-cog"
    })));
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
    if (this.props.highlighted) {
      style.border = "dashed 2px #337ab7";
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
    if (this.props.connectMoveHandle) {
      contents = this.props.connectMoveHandle(contents);
    }
    elem = H.div({
      className: "mwater-visualization-simple-widget",
      style: style,
      onClick: this.handleClick,
      onMouseLeave: this.closeMenu
    }, contents, this.renderResizeHandle(), this.renderDropdown(), this.renderEditor());
    return elem;
  };

  return SimpleWidgetComponent;

})(React.Component);
