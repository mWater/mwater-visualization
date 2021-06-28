// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let DropdownWidgetComponent;
import _ from 'lodash';
import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
const R = React.createElement;

// Widget wrapper that adds a dropdown menu in a gear floating
export default DropdownWidgetComponent = (function() {
  DropdownWidgetComponent = class DropdownWidgetComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        width: PropTypes.any,    // Width specification
        height: PropTypes.any,    // Height specification
  
        dropdownItems: PropTypes.arrayOf(PropTypes.shape({
          label: PropTypes.node.isRequired,
          icon: PropTypes.string, // Glyphicon string. e.g. "remove"
          onClick: PropTypes.func.isRequired
          })).isRequired
      };
       // A list of {label, icon, onClick} actions for the dropdown
    }

    renderDropdownItem = (item, i) => {
      return R('li', {key: `${i}`},
        R('a', {onClick: item.onClick},
          item.icon ? R('span', {className: `glyphicon glyphicon-${item.icon} text-muted`}) : undefined,
          item.icon ? " " : undefined,
          item.label)
      );
    };

    renderDropdown() {
      if (this.props.dropdownItems.length === 0) {
        return null;
      }

      const dropdownStyle = {
        position: "absolute",
        right: 3,
        top: 3,
        cursor: "pointer",
        zIndex: 1029
      };

      const elem = R('div', {style: dropdownStyle, "data-toggle": "dropdown"},
        R('div', {className: "mwater-visualization-simple-widget-gear-button"},
          R('span', {className: "glyphicon glyphicon-cog"}))
      );

      return R('div', {style: dropdownStyle},
        elem,
        R('ul', {className: "dropdown-menu dropdown-menu-right", style: { top: 25 }},
          _.map(this.props.dropdownItems, this.renderDropdownItem))
      );
    }

    closeMenu = () => {
      return $(ReactDOM.findDOMNode(this)).find('[data-toggle="dropdown"]').parent().removeClass('open');
    };

    render() {
      return R('div', {className: "mwater-visualization-simple-widget", onMouseLeave: this.closeMenu, style: { width: this.props.width, height: this.props.height }},
        this.props.children,
        this.renderDropdown());
    }
  };
  DropdownWidgetComponent.initClass();
  return DropdownWidgetComponent;
})();
