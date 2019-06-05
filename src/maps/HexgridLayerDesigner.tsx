import _ from 'lodash'
import React from 'react'
const R = React.createElement
import { produce } from "immer"

import { ExprComponent, FilterExprComponent } from "mwater-expressions-ui"
import { ExprCompiler, Schema, DataSource, Expr, OpExpr } from 'mwater-expressions'
import AxisComponent from './../axes/AxisComponent'
import TableSelectComponent from '../TableSelectComponent'
import Rcslider from 'rc-slider'
import HexgridLayerDesign from './HexgridLayerDesign'
import { JsonQLFilter } from '../index';
const EditPopupComponent = require('./EditPopupComponent');
const ZoomLevelsComponent = require('./ZoomLevelsComponent');
import ui from 'react-library/lib/bootstrap'
import { Axis } from '../axes/Axis';

// Designer for a choropleth layer
export default class HexgridLayerDesigner extends React.Component<{
  schema: Schema
  dataSource: DataSource
  design: HexgridLayerDesign
  onDesignChange: (design: HexgridLayerDesign) => void
  /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
  filters: JsonQLFilter[]
}> {
  update(mutation: (d: HexgridLayerDesign) => void) {
    this.props.onDesignChange(produce(this.props.design, mutation))
  }

  handleTableChange = (table: string) => {
    this.update((d) => { d.table = table })
  }

  handleFilterChange = (filter: Expr) => {
    this.update((d) => { d.filter = filter })
  }

  handleColorAxisChange = (axis: Axis) => {
    this.update((d) => { d.colorAxis = axis })
  } 

  handleGeometryExprChange = (expr: Expr) => {
    this.update((d) => { d.geometryExpr = expr })
  }

  handleSizeUnitsChange = (sizeUnits: "pixels" | "meters") => {
    if (sizeUnits === "pixels") {
      this.update((d) => { d.sizeUnits = sizeUnits; d.size = 30 })
    }
    else {
      this.update((d) => { d.sizeUnits = sizeUnits; d.size = 1000 })
    }    
  }

  handleSizeChange = (size: number) => {
    this.update((d) => { d.size = size })
  }

  handleFillOpacityChange = (fillOpacity: number) => {
    this.update((d) => { d.fillOpacity = fillOpacity })
  }

  renderSize() {
    return (
      <div className="form-group">
        <label className="text-muted">Size</label>
        <div style={{ marginLeft: 10 }}>
          <div style={{ display: "inline-block"}}>
            <ui.NumberInput decimal={true} value={this.props.design.size} onChange={this.handleSizeChange}/>
          </div>
          &nbsp;
          <div style={{ display: "inline-block"}}>
            <ui.Toggle<("pixels"|"meters"|undefined)> 
              allowReset={false} 
              value={this.props.design.sizeUnits as any} 
              onChange={this.handleSizeUnitsChange}
              size="sm"
              options={[{ value: "pixels", label: "Pixels" }, { value: "meters", label: "Meters (approximate)"}]} />
          </div>
        </div>
      </div>
    )
  }

  renderTable() {
    return (
      <div className="form-group">
        <label className="text-muted">
          <i className="fa fa-database"/>
          {" Data Source"}
        </label>
        <TableSelectComponent 
          schema={this.props.schema}
          value={this.props.design.table}
          onChange={this.handleTableChange}
          filter={this.props.design.filter}
          onFilterChange={this.handleFilterChange}
          />
      </div>
    )
  }

  renderGeometryExpr() {
    // If no data, hide
    if (!this.props.design.table) {
      return null;
    }

    return (
      <div className="form-group">
        <label className="text-muted">
          <i className="glyphicon glyphicon-map-marker"/>
          {" Location"}
        </label>
        <div style={{ marginLeft: 8 }}>
          <ExprComponent
            schema={this.props.schema}
            dataSource={this.props.dataSource}
            onChange={this.handleGeometryExprChange}
            table={this.props.design.table}
            types={["geometry"]}
            value={this.props.design.geometryExpr}
          />
        </div>
      </div>
    )
  }

  renderColorAxis() {
    if (!this.props.design.table) {
      return null
    }

    const filters = _.clone(this.props.filters) || [];

    if (this.props.design.filter) {
      const exprCompiler = new ExprCompiler(this.props.schema);
      const jsonql = exprCompiler.compileExpr({expr: this.props.design.filter, tableAlias: "{alias}"});
      let filterTable = (this.props.design.filter as OpExpr).table
      if (jsonql && filterTable) {
        filters.push({ table: filterTable, jsonql });
      }
    }

    const table = this.props.design.table

    return R('div', null,
      R('div', {className: "form-group"},
        R('label', {className: "text-muted"}, 
          R('span', {className: "glyphicon glyphicon glyphicon-tint"}),
          "Color By Data"),

        R(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.design.table,
          types: ["text", "enum", "boolean", "date"],
          aggrNeed: "required",
          value: this.props.design.colorAxis,
          showColorMap: true,
          onChange: this.handleColorAxisChange,
          allowExcludedValues: true,
          filters: filters
        })
      )
    )
  }

  renderFillOpacity() {
    return R('div', {className: "form-group"},
      R('label', {className: "text-muted"}, 
        "Fill Opacity (%)"),
      ": ",
      R(Rcslider, {
        min: 0,
        max: 100,
        step: 1,
        tipTransitionName: "rc-slider-tooltip-zoom-down",
        value: this.props.design.fillOpacity! * 100,
        onChange: (val: number) => this.handleFillOpacityChange(val/100)
      }
      )
    );
  }

  renderFilter() {
    // If not with table, hide
    if (!this.props.design.table) {
      return null
    }

    return R('div', {className: "form-group"},
      R('label', {className: "text-muted"}, 
        R('span', {className: "glyphicon glyphicon-filter"}),
        " Filters"),
      R('div', {style: { marginLeft: 8 }}, 
        R(FilterExprComponent, { 
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          onChange: this.handleFilterChange,
          table: this.props.design.table,
          value: this.props.design.filter
        })
      )
    );
  }

  // renderPopup() {
  //   // If not in indirect mode with table, hide
  //   if (this.props.design.regionMode !== "indirect" || !this.props.design.table) {
  //     return null
  //   }

  //   const regionsTable = this.props.design.regionsTable || "admin_regions";

  //   const defaultPopupFilterJoins = {};
  //   if (this.props.design.adminRegionExpr) {
  //     defaultPopupFilterJoins[this.props.design.table] = this.props.design.adminRegionExpr;
  //   }

  //   return R(EditPopupComponent, { 
  //     design: this.props.design,
  //     onDesignChange: this.props.onDesignChange,
  //     schema: this.props.schema,
  //     dataSource: this.props.dataSource,
  //     table: this.props.design.table,
  //     idTable: regionsTable,
  //     defaultPopupFilterJoins
  //   })
  // }

  render() {
    return R('div', null,
      this.renderSize(),
      this.renderTable(),
      this.renderGeometryExpr(),
      this.renderColorAxis(),
      this.renderFillOpacity(),
      this.renderFilter(),
      // this.renderPopup(),
      R(ZoomLevelsComponent, {design: this.props.design, onDesignChange: this.props.onDesignChange})
    );
  }
}
