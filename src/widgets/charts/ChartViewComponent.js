// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let ChartViewComponent;
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
const R = React.createElement;
import asyncLatest from 'async-latest';

// Inner view part of the chart widget. Uses a query data loading component
// to handle loading and continues to display old data if design becomes
// invalid
export default ChartViewComponent = (function() {
  ChartViewComponent = class ChartViewComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        chart: PropTypes.object.isRequired, // Chart object to use
        design: PropTypes.object.isRequired, // Design of chart
        onDesignChange: PropTypes.func,      // When design change
  
        schema: PropTypes.object.isRequired,
        dataSource: PropTypes.object.isRequired, // Data source to use for chart
        widgetDataSource: PropTypes.object.isRequired,
  
        width: PropTypes.number,
        height: PropTypes.number,
  
        scope: PropTypes.any, // scope of the widget (when the widget self-selects a particular scope)
        filters: PropTypes.array,  // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias }. Use injectAlias to correct
        onScopeChange: PropTypes.func, // called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
  
        onRowClick: PropTypes.func
      };
           // Called with (tableId, rowId) when item is clicked
    }

    constructor(props) {
      super(props);

      this.state = {
        validDesign: null,     // last valid design
        data: null,            // data for chart
        dataLoading: false,    // True when loading data
        dataError: null,       // Set when data loading returned error
        cacheExpiry: props.dataSource.getCacheExpiry()  // Save cache expiry to see if changes
      };

      // Ensure that only one load at a time
      this.loadData = asyncLatest(this.loadData, { serial: true });

      this.state = {};
    }

    componentDidMount() {
      return this.updateData(this.props);
    }

    componentWillReceiveProps(nextProps) {
      if (!_.isEqual(nextProps.design, this.props.design) || !_.isEqual(nextProps.filters, this.props.filters) || (nextProps.dataSource.getCacheExpiry() !== this.state.cacheExpiry)) {
        // Save new cache expiry
        this.setState({cacheExpiry: nextProps.dataSource.getCacheExpiry()});

        return this.updateData(nextProps);
      }
    }

    updateData(props) {
      // Clean design first (needed to validate properly)
      const design = props.chart.cleanDesign(props.design, props.schema);

      // If design is not valid, do nothing as can't query invalid design
      const errors = props.chart.validateDesign(design, props.schema);
      if (errors) {
        return;
      }

      // Loading data
      this.setState({dataLoading: true});

      return this.loadData(props, (error, data) => {
        return this.setState({dataLoading: false, dataError: error, data, validDesign: design});
      });
    }

    loadData(props, callback) {
      // Get data from widget data source
      return props.widgetDataSource.getData(props.design, props.filters, callback);
    }

    renderSpinner() {
      return R('div', {style: { position: "absolute", bottom: "50%", left: 0, right: 0, textAlign: "center", fontSize: 20 }},
        R('i', {className: "fa fa-spinner fa-spin"}));
    }

    render() {
      const style = { width: this.props.width, height: this.props.height };

      // Faded if loading
      if (this.state.dataLoading) {
        style.opacity = 0.5;
      }

      // If nothing to show, show grey
      if (!this.state.validDesign) {
        // Invalid. Show faded with background
        style.backgroundColor = "#E0E0E0";
        style.opacity = 0.35;

        // Set height to 1.6 ratio if not set so the control is visible
        if (!this.props.height && this.props.width) {
          style.height = this.props.width / 1.6;
        }
      }

      if (this.state.dataError) {
        return R('div', {className: "alert alert-danger"},
         `Error loading data: ${this.state.dataError.message || this.state.dataError}`); 
      }

      return R('div', {style},
        this.state.validDesign ?
          this.props.chart.createViewElement({
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            design: this.state.validDesign,
            onDesignChange: this.props.onDesignChange,
            data: this.state.data,
            scope: this.props.scope,
            onScopeChange: this.props.onScopeChange,
            width: this.props.width,
            height: this.props.height,
            onRowClick: this.props.onRowClick,
            filters: this.props.filters
            }) : undefined,
        this.state.dataLoading ?
          this.renderSpinner() : undefined
      );
    }
  };
  ChartViewComponent.initClass();
  return ChartViewComponent;
})();
