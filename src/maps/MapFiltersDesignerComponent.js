let MapFiltersDesignerComponent;
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
const R = React.createElement;
import { FilterExprComponent } from "mwater-expressions-ui";
import { ExprCleaner } from 'mwater-expressions';
import { ExprUtils } from 'mwater-expressions';
import PopoverHelpComponent from 'react-library/lib/PopoverHelpComponent';
import FiltersDesignerComponent from '../FiltersDesignerComponent';
import MapUtils from './MapUtils';

// Designer for filters for a map
export default MapFiltersDesignerComponent = (function() {
  MapFiltersDesignerComponent = class MapFiltersDesignerComponent extends React.Component {
    constructor(...args) {
      super(...args);
      this.handleFiltersChange = this.handleFiltersChange.bind(this);
      this.handleGlobalFiltersChange = this.handleGlobalFiltersChange.bind(this);
    }

    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired, // Schema to use
        dataSource: PropTypes.object.isRequired, // Data source to use
        design: PropTypes.object.isRequired,  // See Map Design.md
        onDesignChange: PropTypes.func.isRequired // Called with new design
      };
  
      this.contextTypes =
        {globalFiltersElementFactory: PropTypes.func};
       // Call with props { schema, dataSource, globalFilters, filterableTables, onChange, nullIfIrrelevant }. Displays a component to edit global filters
    }

    handleFiltersChange(filters) {
      const design = _.extend({}, this.props.design, {filters});
      return this.props.onDesignChange(design);
    }

    handleGlobalFiltersChange(globalFilters) {
      const design = _.extend({}, this.props.design, {globalFilters});
      return this.props.onDesignChange(design);
    }

    render() {
      // Get filterable tables
      const filterableTables = MapUtils.getFilterableTables(this.props.design, this.props.schema);
      if (filterableTables.length === 0) {
        return null;
      }

      return R('div', null,
        R('div', {className: "form-group"},
          R('label', {className: "text-muted"}, 
            "Filters ",
            R(PopoverHelpComponent, {placement: "left"},
              'Filters all layers in the map. Individual layers can be filtered by clicking on Customize...')
          ),

          R('div', {style: { margin: 5 }}, 
            R(FiltersDesignerComponent, { 
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              filters: this.props.design.filters,
              onFiltersChange: this.handleFiltersChange,
              filterableTables
            }
            )
          )
        ),

        this.context.globalFiltersElementFactory ?
          R('div', {className: "form-group"},
            R('label', {className: "text-muted"}, 
              "Global Filters "),

            R('div', {style: { margin: 5 }}, 
              this.context.globalFiltersElementFactory({ 
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                filterableTables,
                globalFilters: this.props.design.globalFilters || [],
                onChange: this.handleGlobalFiltersChange
              })
            )
          ) : undefined
      );
    }
  };
  MapFiltersDesignerComponent.initClass();
  return MapFiltersDesignerComponent;
})();
