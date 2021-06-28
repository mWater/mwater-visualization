let PaletteItemComponent;
import PropTypes from 'prop-types';
import React from 'react';
const R = React.createElement;

const DragSourceComponent = require('../DragSourceComponent')("block-move");

// Item in a palette that can be dragged to add a widget or other item
export default PaletteItemComponent = (function() {
  PaletteItemComponent = class PaletteItemComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        createItem: PropTypes.func.isRequired,   // Create the drag item
        title: PropTypes.any,
        subtitle: PropTypes.any
      };
    }

    render() {
      return R(DragSourceComponent, 
        {createDragItem: this.props.createItem},
          R('div', {className: "mwater-visualization-palette-item"},
            R('div', {className: "title", key: "title"},
              this.props.title),
            R('div', {className: "subtitle", key: "subtitle"},
              this.props.subtitle)
          )
      );
    }
  };
  PaletteItemComponent.initClass();
  return PaletteItemComponent;
})();
