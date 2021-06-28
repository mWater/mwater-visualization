let GridLayoutComponent;
import PropTypes from 'prop-types';
import _ from 'lodash';
import React from 'react';
const R = React.createElement;

import WidgetContainerComponent from './WidgetContainerComponent';
import LegoLayoutEngine from './LegoLayoutEngine';

export default GridLayoutComponent = (function() {
  GridLayoutComponent = class GridLayoutComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        width: PropTypes.number.isRequired,
        items: PropTypes.any,
        onItemsChange: PropTypes.func,
        renderWidget: PropTypes.func.isRequired
      };
    }

    renderPageBreaks(layoutEngine, layouts) {
      // Get height
      const height = layoutEngine.calculateHeight(layouts);

      // Page breaks are 8.5x11 with 0.5" margin 
      const pageHeight = (this.props.width / 7.5) * 10;

      const number = Math.floor(height/pageHeight);

      const elems = [];
      if (number > 0) {
        for (let i = 1, end = number, asc = 1 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
          elems.push(R('div', {className: "mwater-visualization-page-break", key: `page${i}`, style: { position: "absolute", top: i * pageHeight }}));
        }
      }

      return elems;
    }

    render() {
      // Create layout engine
      const layoutEngine = new LegoLayoutEngine(this.props.width, 24);

      // Get layouts indexed by id
      const layouts = _.mapValues(this.props.items, "layout");

      const style = {
        height: "100%",
        position: "relative"
      };

      // Render widget container
      return R('div', {style},
        R(WidgetContainerComponent, { 
          layoutEngine,
          items: this.props.items,
          onItemsChange: this.props.onItemsChange,
          renderWidget: this.props.renderWidget,
          width: this.props.width
        }
        ), 
        this.renderPageBreaks(layoutEngine, layouts));
    }
  };
  GridLayoutComponent.initClass();
  return GridLayoutComponent;
})();

