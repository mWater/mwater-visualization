// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let ClusterLayerDesignerComponent;
import PropTypes from 'prop-types';
import _ from 'lodash';
import React from 'react';
const R = React.createElement;

import { FilterExprComponent } from "mwater-expressions-ui";
import { ExprUtils } from 'mwater-expressions';
import { ExprCompiler } from 'mwater-expressions';
import AxisComponent from './../axes/AxisComponent';
import ColorComponent from '../ColorComponent';
import TableSelectComponent from '../TableSelectComponent';
import ZoomLevelsComponent from './ZoomLevelsComponent';

export default ClusterLayerDesignerComponent = (function() {
  ClusterLayerDesignerComponent = class ClusterLayerDesignerComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired, // Schema to use
        dataSource: PropTypes.object.isRequired,
        design: PropTypes.object.isRequired,  // Design of the design
        onDesignChange: PropTypes.func.isRequired, // Called with new design
        filters: PropTypes.array
      };
         // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    }

    // Apply updates to design
    update(updates) {
      return this.props.onDesignChange(_.extend({}, this.props.design, updates));
    }

    // Update axes with specified changes
    updateAxes(changes) {
      const axes = _.extend({}, this.props.design.axes, changes);
      return this.update({axes});
    }

    handleTableChange = table => { return this.update({table}); };
    handleGeometryAxisChange = axis => { return this.updateAxes({geometry: axis}); };
    handleFilterChange = expr => { return this.update({filter: expr}); };
    handleTextColorChange = color => { return this.update({textColor: color}); };
    handleFillColorChange = color => { return this.update({fillColor: color}); };

    renderTable() {
      return R('div', {className: "form-group"},
        R('label', {className: "text-muted"}, 
          R('i', {className: "fa fa-database"}),
          " ",
          "Data Source"),
        R('div', {style: { marginLeft: 10 }}, 
          R(TableSelectComponent, { 
            schema: this.props.schema,
            value: this.props.design.table,
            onChange: this.handleTableChange, 
            filter: this.props.design.filter,
            onFilterChange: this.handleFilterChange
          })));
    }

    renderGeometryAxis() {
      if (!this.props.design.table) {
        return;
      }

      const title = R('span', null,
        R('span', {className: "glyphicon glyphicon-map-marker"}),
        " Locations to Cluster");
    
      const filters = _.clone(this.props.filters) || [];

      if (this.props.design.filter != null) {
        const exprCompiler = new ExprCompiler(this.props.schema);
        const jsonql = exprCompiler.compileExpr({expr: this.props.design.filter, tableAlias: "{alias}"});
        if (jsonql) {
          filters.push({ table: this.props.design.filter.table, jsonql });
        }
      }

      return R('div', {className: "form-group"},
        R('label', {className: "text-muted"}, title),
        R('div', {style: { marginLeft: 10 }}, 
          React.createElement(AxisComponent, { 
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.design.table,
            types: ["geometry"],
            aggrNeed: "none",
            value: this.props.design.axes.geometry,
            onChange: this.handleGeometryAxisChange,
            filters
          })
        )
      );
    }


    renderTextColor() {
      if (!this.props.design.axes.geometry) {
        return;
      }

      return R('div', {className: "form-group"},
        R('label', {className: "text-muted"}, 
          R('span', {className: "glyphicon glyphicon glyphicon-tint"}),
          "Text Color"),

        R('div', null, 
          R(ColorComponent, {
            color: this.props.design.textColor,
            onChange: this.handleTextColorChange
          }
          )
        )
      );
    }


    renderFillColor() {
      if (!this.props.design.axes.geometry) {
        return;
      }

      return R('div', {className: "form-group"},
        R('label', {className: "text-muted"}, 
          R('span', {className: "glyphicon glyphicon glyphicon-tint"}),
          "Marker Color"),

        R('div', null, 
          R(ColorComponent, {
            color: this.props.design.fillColor,
            onChange: this.handleFillColorChange
          }
          )
        )
      );
    }

    renderFilter() {
      // If no data, hide
      if (!this.props.design.axes.geometry) {
        return null;
      }

      return R('div', {className: "form-group"},
        R('label', {className: "text-muted"}, 
          R('span', {className: "glyphicon glyphicon-filter"}),
          " Filters"),
        R('div', {style: { marginLeft: 8 }}, 
          React.createElement(FilterExprComponent, { 
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            onChange: this.handleFilterChange,
            table: this.props.design.table,
            value: this.props.design.filter
          })
        )
      );
    }

    render() {
      return R('div', null,
        this.renderTable(),
        this.renderGeometryAxis(),
        this.renderTextColor(),
        this.renderFillColor(),
        this.renderFilter(),
        this.props.design.table ?
          R(ZoomLevelsComponent, {design: this.props.design, onDesignChange: this.props.onDesignChange}) : undefined
      );
    }
  };
  ClusterLayerDesignerComponent.initClass();
  return ClusterLayerDesignerComponent;
})();

