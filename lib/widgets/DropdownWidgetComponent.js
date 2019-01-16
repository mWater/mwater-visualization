var $, DropdownWidgetComponent, PropTypes, R, React, ReactDOM,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

PropTypes = require('prop-types');

React = require('react');

ReactDOM = require('react-dom');

R = React.createElement;

module.exports = DropdownWidgetComponent = (function(superClass) {
  extend(DropdownWidgetComponent, superClass);

  function DropdownWidgetComponent() {
    this.closeMenu = bind(this.closeMenu, this);
    this.renderDropdownItem = bind(this.renderDropdownItem, this);
    return DropdownWidgetComponent.__super__.constructor.apply(this, arguments);
  }

  DropdownWidgetComponent.propTypes = {
    width: PropTypes.any,
    height: PropTypes.any,
    dropdownItems: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.node.isRequired,
      icon: PropTypes.string,
      onClick: PropTypes.func.isRequired
    })).isRequired
  };

  DropdownWidgetComponent.prototype.renderDropdownItem = function(item, i) {
    return R('li', {
      key: "" + i
    }, R('a', {
      onClick: item.onClick
    }, item.icon ? R('span', {
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
      right: 3,
      top: 3,
      cursor: "pointer",
      zIndex: 10000
    };
    elem = R('div', {
      style: dropdownStyle,
      "data-toggle": "dropdown"
    }, R('div', {
      className: "mwater-visualization-simple-widget-gear-button"
    }, R('span', {
      className: "glyphicon glyphicon-cog"
    })));
    return R('div', {
      style: dropdownStyle
    }, elem, R('ul', {
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
    return R('div', {
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
