var H, React, ReactDOM, SimpleWidgetComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

ReactDOM = require('react-dom');

H = React.DOM;

module.exports = SimpleWidgetComponent = (function(superClass) {
  extend(SimpleWidgetComponent, superClass);

  function SimpleWidgetComponent() {
    this.closeMenu = bind(this.closeMenu, this);
    this.renderDropdownItem = bind(this.renderDropdownItem, this);
    return SimpleWidgetComponent.__super__.constructor.apply(this, arguments);
  }

  SimpleWidgetComponent.propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    standardWidth: React.PropTypes.number,
    highlighted: React.PropTypes.bool,
    dropdownItems: React.PropTypes.arrayOf(React.PropTypes.shape({
      label: React.PropTypes.node.isRequired,
      icon: React.PropTypes.string,
      onClick: React.PropTypes.func.isRequired
    })).isRequired
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
    if (this.props.dropdownItems.length === 0) {
      return null;
    }
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
    return $(ReactDOM.findDOMNode(this)).find('[data-toggle="dropdown"]').parent().removeClass('open');
  };

  SimpleWidgetComponent.prototype.render = function() {
    var contents, elem, style;
    style = {
      width: this.props.width,
      height: this.props.height,
      padding: 5
    };
    if (this.props.highlighted) {
      style.border = "dashed 2px #337ab7";
    }
    contents = H.div({
      style: {
        position: "absolute",
        left: 5,
        top: 5,
        right: 5,
        bottom: 5
      }
    }, React.cloneElement(React.Children.only(this.props.children), {
      width: this.props.width - 10,
      height: this.props.height - 10,
      standardWidth: this.props.standardWidth - 10
    }));
    elem = H.div({
      className: "mwater-visualization-simple-widget",
      style: style,
      onMouseLeave: this.closeMenu
    }, contents, this.renderDropdown());
    return elem;
  };

  return SimpleWidgetComponent;

})(React.Component);
