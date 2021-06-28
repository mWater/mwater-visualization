let TextWidgetComponent;
import PropTypes from 'prop-types';
import React from 'react';
const R = React.createElement;
import _ from 'lodash';
import TextComponent from './TextComponent';
import TextWidget from './TextWidget';
import AsyncLoadComponent from 'react-library/lib/AsyncLoadComponent';

// Widget which displays styled text with embedded expressions
export default TextWidgetComponent = (function() {
  TextWidgetComponent = class TextWidgetComponent extends AsyncLoadComponent {
    static initClass() {
      this.propTypes = { 
        design: PropTypes.object.isRequired,
        onDesignChange: PropTypes.func, // Called with new design. null/undefined for readonly
        filters: PropTypes.array,
      
        schema: PropTypes.object.isRequired,
        dataSource: PropTypes.object.isRequired, // Data source to use for chart
        widgetDataSource: PropTypes.object.isRequired,
  
        width: PropTypes.number,
        height: PropTypes.number,
  
        singleRowTable: PropTypes.string,  // Table that is filtered to have one row
        namedStrings: PropTypes.object
      };
       // Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget
    }

    constructor(props) {
      super(props);

      this.state = {
        // Map of expression id to expression value
        exprValues: {},
        error: null,
        cacheExpiry: props.dataSource.getCacheExpiry()  // Save cache expiry to see if changes
      };
    }

    // Override to determine if a load is needed. Not called on mounting
    isLoadNeeded(newProps, oldProps) { 
      // Get expression items recursively
      var getExprItems = function(items) {
        let exprItems = [];
        for (let item of (items || [])) {
          if (item.type === "expr") {
            exprItems.push(item);
          }
          if (item.items) {
            exprItems = exprItems.concat(getExprItems(item.items));
          }
        }
        return exprItems;    
      };

      // Reload if filters or expressions have changed or cache expiry
      return !_.isEqual(newProps.filters, oldProps.filters) || !_.isEqual(getExprItems(newProps.design.items), getExprItems(oldProps.design.items)) || (newProps.dataSource.getCacheExpiry() !== this.state.cacheExpiry);
    }

    // Call callback with state changes
    load(props, prevProps, callback) {
      // Shortcut if no expressions in text widget
      const widget = new TextWidget();
      if (widget.getExprItems(props.design.items).length === 0) {
        callback({error: null, exprValues: {}}, props.dataSource.getCacheExpiry());
        return;
      }

      // Get data
      return props.widgetDataSource.getData(props.design, props.filters, (error, data) => {
        return callback({error, exprValues: data || {}, cacheExpiry: props.dataSource.getCacheExpiry()});
      });
    }

    scrollToTOCEntry(entryId) {
      // Find entry in divComp
      const entries = this.divComp.querySelectorAll("h1,h2,h3,h4,h5,h6,h7,h8,h9");

      const entry = entries[entryId];
      if (entry) {
        return entry.scrollIntoView(true);
      }
    }

    render() {
      // If loading, don't display old values
      const exprValues = !this.state.loading ? this.state.exprValues : {};

      return R('div', 
        {ref: (c => { return this.divComp = c; })},
          R(TextComponent, {
            design: this.props.design,
            onDesignChange: this.props.onDesignChange,
            filters: this.props.filters,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            exprValues,
            width: this.props.width,
            height: this.props.height,
            singleRowTable: this.props.singleRowTable,
            namedStrings: this.props.namedStrings
          }
          )
      );
    }
  };
  TextWidgetComponent.initClass();
  return TextWidgetComponent;
})();
