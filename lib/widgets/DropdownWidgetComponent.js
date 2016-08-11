var DropdownWidgetComponent, H, React, ReactDOM,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

ReactDOM = require('react-dom');

H = React.DOM;

module.exports = DropdownWidgetComponent = (function(superClass) {
  extend(DropdownWidgetComponent, superClass);

  function DropdownWidgetComponent() {
    this.closeMenu = bind(this.closeMenu, this);
    this.renderDropdownItem = bind(this.renderDropdownItem, this);
    return DropdownWidgetComponent.__super__.constructor.apply(this, arguments);
  }

  DropdownWidgetComponent.propTypes = {
    width: React.PropTypes.any,
    height: React.PropTypes.any,
    dropdownItems: React.PropTypes.arrayOf(React.PropTypes.shape({
      label: React.PropTypes.node.isRequired,
      icon: React.PropTypes.string,
      onClick: React.PropTypes.func.isRequired
    })).isRequired
  };

  DropdownWidgetComponent.prototype.renderDropdownItem = function(item, i) {
    return H.li({
      key: "" + i
    }, H.a({
      onClick: item.onClick
    }, item.icon ? H.span({
      className: "glyphicon glyphicon-" + item.icon + " text-muted"
    }) : void 0, item.icon ? " " : void 0, item.label));
  };

  DropdownWidgetComponent.prototype.renderDropdown = function() {
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

  DropdownWidgetComponent.prototype.closeMenu = function() {
    return $(ReactDOM.findDOMNode(this)).find('[data-toggle="dropdown"]').parent().removeClass('open');
  };

  DropdownWidgetComponent.prototype.render = function() {
    return H.div({
      className: "mwater-visualization-simple-widget",
      onMouseLeave: this.closeMenu,
      style: {
        width: this.props.width,
        height: this.props.height
      }
    }, this.props.children, this.renderDropdown());
  };

  return DropdownWidgetComponent;

})(React.Component);