import _ from 'lodash'
import React from 'react'
const R = React.createElement
import { produce } from "immer"

import { ExprComponent, FilterExprComponent } from "mwater-expressions-ui"
import { ExprCompiler, Schema, DataSource, Expr, OpExpr } from 'mwater-expressions'
import AxisComponent from './../axes/AxisComponent'
import TableSelectComponent from '../TableSelectComponent'
import ColorComponent from '../ColorComponent'
import Rcslider from 'rc-slider'
import ChoroplethLayerDesign from './ChoroplethLayerDesign'
import { JsonQLFilter } from '../index';
const EditPopupComponent = require('./EditPopupComponent');
const ZoomLevelsComponent = require('./ZoomLevelsComponent');
import ui from 'react-library/lib/bootstrap'
import { Axis } from '../axes/Axis';

const AdminScopeAndDetailLevelComponent = require('./AdminScopeAndDetailLevelComponent');
const ScopeAndDetailLevelComponent = require('./ScopeAndDetailLevelComponent');

// Designer for a choropleth layer
export default class ChoroplethLayerDesigner extends React.Component<{
  schema: Schema
  dataSource: DataSource
  design: ChoroplethLayerDesign
  onDesignChange: (design: ChoroplethLayerDesign) => void
  /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
  filters: JsonQLFilter[]
}> {
  update(mutation: (d: ChoroplethLayerDesign) => void) {
    this.props.onDesignChange(produce(this.props.design, mutation))
  }

  handleScopeAndDetailLevelChange = (scope: string | number | null, scopeLevel: number | null, detailLevel: number) => {
    this.update((d) => {
      d.scope = scope
      d.scopeLevel = scopeLevel
      d.detailLevel = detailLevel
    })
  }

  autoselectAdminRegionExpr = (table: string, regionsTable: string | null): Expr =>  {
    // Autoselect region if present
    let adminRegionExpr: Expr = null

    for (let column of this.props.schema.getColumns(table)) {
      if ((column.type === "join") && (column.join!.type === "n-1") && (column.join!.toTable === regionsTable)) {
        return { type: "field", table, column: column.id }
      }
      if ((column.type === "id") && (column.idTable === regionsTable)) {
        return { type: "field", table, column: column.id }
      }
    }
    return null
  }

  handleTableChange = (table: string | null) => {
    // Autoselect region if present
    let adminRegionExpr: Expr = null

    const regionsTable = this.props.design.regionsTable || "admin_regions"

    if (table) {
      adminRegionExpr = this.autoselectAdminRegionExpr(table, regionsTable)
    }
  
    this.update((d) => { 
      d.table = table
      d.adminRegionExpr = adminRegionExpr
    })
  }

  handleColorChange = (color: string | null) => {
    this.update((d) => { d.color = color })
  }

  handleBorderColorChange = (color: string | null) => {
    this.update((d) => { d.borderColor = color })
  }

  handleFilterChange = (filter: Expr) => {
    this.update((d) => { d.filter = filter })
  }

  handleColorAxisChange = (axis: Axis) => {
    this.update((d) => { d.axes.color = axis })
  } 

  handleRegionsTableChange = (regionsTable: string) => {
    this.update((d) => {
      d.regionsTable = regionsTable == "admin_regions" ? null : regionsTable
      d.scope = null
      d.scopeLevel = null
      d.detailLevel = 0,
      d.adminRegionExpr = this.props.design.table ? this.autoselectAdminRegionExpr(this.props.design.table, regionsTable) : null
    }) 
  }

  handleAdminRegionExprChange = (expr: Expr) => {
    this.update((d) => { d.adminRegionExpr = expr })
  }

  handleRegionModeChange = (regionMode: "plain" | "indirect" | "direct") => {
    this.update((d) => { d.regionMode = regionMode })
  }

  handleFillOpacityChange = (fillOpacity: number) => {
    this.update((d) => { d.fillOpacity = fillOpacity })
  }

  handleDisplayNamesChange = (displayNames: boolean) => {
    this.update((d) => { d.displayNames = displayNames })
  }

  renderRegionMode() {
    return (
      <div className="form-group">
        <label className="text-muted">Mode</label>
        <div style={{ marginLeft: 10 }}>
          <ui.Radio inline radioValue="plain" value={this.props.design.regionMode} onChange={this.handleRegionModeChange}>Single Color</ui.Radio>
          <ui.Radio inline radioValue="indirect" value={this.props.design.regionMode} onChange={this.handleRegionModeChange}>Color By Data</ui.Radio>
          <ui.Radio inline radioValue="direct" value={this.props.design.regionMode} onChange={this.handleRegionModeChange}>Advanced</ui.Radio>
        </div>
      </div>
    )
  }

  renderTable() {
    // Only for indirect
    if (this.props.design.regionMode !== "indirect") {
      return null
    }

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

  renderRegionsTable() {
    let options = _.map(_.filter(this.props.schema.getTables(), table => table.id.startsWith("regions.")), table => ({ value: table.id, label: table.name.en }))

    const regionsTable = this.props.design.regionsTable || "admin_regions"

    return (
      <div className="form-group">
        <label className="text-muted">Regions Type</label>
        <div style={{ marginLeft: 8 }}>
          <select value={regionsTable} onChange={ev => this.handleRegionsTableChange(ev.target.value)} className="form-control">
            <option value="admin_regions">Administrative Regions (from mWater global database)</option>
            <option disabled>── Custom regions (special regions uploaded for specific purposes) ──</option>
            { options.map(opt => (<option value={opt.value}>{opt.label}</option>))}
          </select>
        </div> 
      </div>
    )
  }

  renderAdminRegionExpr() {
    // Only for indirect
    if (this.props.design.regionMode !== "indirect") {
      return null
    }

    // If no data, hide
    if (!this.props.design.table) {
      return null;
    }

    const regionsTable = this.props.design.regionsTable || "admin_regions";

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
            onChange={this.handleAdminRegionExprChange}
            table={this.props.design.table}
            types={["id"]}
            idTable={regionsTable}
            value={this.props.design.adminRegionExpr || null}
          />
        </div>
      </div>
    )
  }

  renderScopeAndDetailLevel() {
    const regionsTable = this.props.design.regionsTable || "admin_regions";

    if (regionsTable === "admin_regions") {
      return R(AdminScopeAndDetailLevelComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        scope: this.props.design.scope,
        scopeLevel: this.props.design.scopeLevel || 0,
        detailLevel: this.props.design.detailLevel,
        onScopeAndDetailLevelChange: this.handleScopeAndDetailLevelChange
      }
      );
    } else { 
      return R(ScopeAndDetailLevelComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        scope: this.props.design.scope,
        scopeLevel: this.props.design.scopeLevel,
        detailLevel: this.props.design.detailLevel,
        onScopeAndDetailLevelChange: this.handleScopeAndDetailLevelChange,
        regionsTable
      }
      );
    }
  }

  renderDisplayNames() {
    return R('div', {className: "form-group"},
      R('div', {className: "checkbox"},
        R('label', null,
          R('input', {type: "checkbox", checked: this.props.design.displayNames, onChange: ev => this.handleDisplayNamesChange(ev.target.checked)}),
          "Display Region Names")
      )
    );
  }

  renderColor() {
    // Only if plain
    if (this.props.design.regionMode !== "plain") {
      return null
    }

    return R('div', {className: "form-group"},
      R('label', {className: "text-muted"}, 
        R('span', {className: "glyphicon glyphicon glyphicon-tint"}),
        "Fill Color"),

      R('div', null, 
        R(ColorComponent, {
          color: this.props.design.color,
          onChange: this.handleColorChange
        }
      )
      )
    )   
  }

  renderColorAxis() {
    // Not applicable if in plain mode, or if in indirect mode with no table
    if (this.props.design.regionMode === "plain") {
      return
    }
    else if (this.props.design.regionMode === "indirect") {
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
            value: this.props.design.axes.color,
            defaultColor: this.props.design.color,
            showColorMap: true,
            onChange: this.handleColorAxisChange,
            allowExcludedValues: true,
            filters: filters
          })
        )
      )
    }
    else { // direct mode
      const filters = _.clone(this.props.filters) || [];
      const regionsTable = this.props.design.regionsTable || "admin_regions"

      // Filter to level and scope
      filters.push({ table: regionsTable, jsonql: {
        type: "op",
        op: "=",
        exprs: [
          { type: "field", tableAlias: "{alias}", column: "level" },
          this.props.design.detailLevel
        ]
      }})

      if (this.props.design.scope) {
        filters.push({ table: regionsTable, jsonql: {
          type: "op",
          op: "=",
          exprs: [
            { type: "field", tableAlias: "{alias}", column: `level${this.props.design.scopeLevel || 0}` },
            { type: "literal", value: this.props.design.scope }
          ]
        }})
      }

      return R('div', null,
        R('div', {className: "form-group"},
          R('label', {className: "text-muted"}, 
            R('span', {className: "glyphicon glyphicon glyphicon-tint"}),
            "Color By Data"),

          R(AxisComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: regionsTable,
            types: ["text", "enum", "boolean", "date"],
            aggrNeed: "none",
            value: this.props.design.axes.color,
            defaultColor: this.props.design.color,
            showColorMap: true,
            onChange: this.handleColorAxisChange,
            allowExcludedValues: true,
            filters: filters
          })
        )
      )
    }
  }

  // renderLabelAxis: ->
  //   if not @props.design.table
  //     return

  //   title = R 'span', null,
  //     R 'span', className: "glyphicon glyphicon glyphicon-tint"
  //     " Color By"

  //   R 'div', className: "form-group",
  //     R 'label', className: "text-muted", title
  //     R 'div', style: { marginLeft: 10 }, 
  //       R(AxisComponent, 
  //         schema: @props.schema
  //         dataSource: @props.dataSource
  //         table: @props.design.table
  //         types: ["text", "enum", "boolean"]
  //         aggrNeed: "none"
  //         value: @props.design.axes.color
  //         showColorMap: true
  //         onChange: @handleColorAxisChange)

  renderFillOpacity() {
    return R('div', {className: "form-group"},
      R('label', {className: "text-muted"}, 
        `Fill Opacity: ${(this.props.design.fillOpacity * this.props.design.fillOpacity * 100).toFixed(0)}%`),
      ": ",
      R(Rcslider, {
        min: 0,
        max: 100,
        step: 1,
        tipTransitionName: "rc-slider-tooltip-zoom-down",
        value: Math.round((this.props.design.fillOpacity * this.props.design.fillOpacity) * 100),
        onChange: (val: number) => this.handleFillOpacityChange(Math.sqrt(val/100))
      }
      )
    );
  }

  renderBorderColor() {
    return R('div', {className: "form-group"},
      R('label', {className: "text-muted"}, 
        R('span', {className: "glyphicon glyphicon glyphicon-tint"}),
        "Border Color"),

      R('div', null, 
        R(ColorComponent, {
          color: this.props.design.borderColor || "#000",
          onChange: this.handleBorderColorChange
        }
      )
      )
    )   
  }

  renderFilter() {
    // If not in indirect mode with table, hide
    if (this.props.design.regionMode !== "indirect" || !this.props.design.table) {
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

  renderPopup() {
    // If not in indirect mode with table, hide
    if (this.props.design.regionMode !== "indirect" || !this.props.design.table) {
      return null
    }

    const regionsTable = this.props.design.regionsTable || "admin_regions";

    const defaultPopupFilterJoins = {};
    if (this.props.design.adminRegionExpr) {
      defaultPopupFilterJoins[this.props.design.table] = this.props.design.adminRegionExpr;
    }

    return R(EditPopupComponent, { 
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table,
      idTable: regionsTable,
      defaultPopupFilterJoins
    })
  }

  render() {
    return R('div', null,
      this.renderRegionMode(),
      this.renderRegionsTable(),
      this.renderTable(),
      this.renderAdminRegionExpr(),
      this.renderScopeAndDetailLevel(),
      this.renderDisplayNames(),
      this.renderColor(),
      this.renderColorAxis(),
      this.renderFillOpacity(),
      this.renderBorderColor(),
      this.renderFilter(),
      this.renderPopup(),
      R(ZoomLevelsComponent, {design: this.props.design, onDesignChange: this.props.onDesignChange})
    );
  }
}
