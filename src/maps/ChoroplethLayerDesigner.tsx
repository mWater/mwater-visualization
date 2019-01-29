import _ = require('lodash')
import React = require('react')
import R = React.createElement
import { produce } from "immer"

import { ExprComponent, FilterExprComponent } from "mwater-expressions-ui"
import { ExprCompiler, Schema, DataSource, Expr, OpExpr } from 'mwater-expressions'
const AxisComponent = require('./../axes/AxisComponent');
import TableSelectComponent = require('../TableSelectComponent');
const ColorComponent = require('../ColorComponent');
import Rcslider from 'rc-slider'
import ChoroplethLayerDesign = require('./ChoroplethLayerDesign');
import { JsonQLFilter } from 'src';
const EditPopupComponent = require('./EditPopupComponent');
const ZoomLevelsComponent = require('./ZoomLevelsComponent');
import ui = require('react-library/lib/bootstrap');
import { Axis } from 'src/axes/Axis';

const AdminScopeAndDetailLevelComponent = require('./AdminScopeAndDetailLevelComponent');
const ScopeAndDetailLevelComponent = require('./ScopeAndDetailLevelComponent');

// Designer for a choropleth layer
class ChoroplethLayerDesigner extends React.Component<{
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

  handleTableChange = (table: string | null) => {
    // Autoselect region if present
    let adminRegionExpr: Expr = null

    const regionsTable = this.props.design.regionsTable || "admin_regions"

    if (table) {
      for (let column of this.props.schema.getColumns(table)) {
        if ((column.type === "join") && (column.join!.type === "n-1") && (column.join!.toTable === regionsTable)) {
          adminRegionExpr = { type: "field", table, column: column.id };
          break;
        }
      }
    }
  
    this.update((d) => { 
      d.table = table
      d.adminRegionExpr = adminRegionExpr
    })
  }

  handleColorChange = (color: string | null) => {
    this.update((d) => { d.color = color })
  }

  handleFilterChange = (filter: Expr) => {
    this.update((d) => { d.filter = filter })
  }

  handleColorAxisChange = (axis: Axis) => {
    this.update((d) => { d.axes.color = axis })
  } 

  handleRegionsTableChange = (regionsTable: string | null) => {
    this.update((d) => {
      d.regionsTable = regionsTable
      d.scope = null
      d.scopeLevel = null
      d.detailLevel = 0,
      d.adminRegionExpr = null
    }) 
  }

  handleAdminRegionExprChange = (expr: Expr) => {
    this.update((d) => { d.adminRegionExpr = expr })
  }

  handleFillOpacityChange = (fillOpacity: number) => {
    this.update((d) => { d.fillOpacity = fillOpacity })
  }

  handleDisplayNamesChange = (displayNames: boolean) => {
    this.update((d) => { d.displayNames = displayNames })
  }

  // renderRegionMode() {
  //   return (
  //     <div className="form-group">
  //       <label className="text-muted">Mode</label>
  //     </div>
  //   )
  //   return R('div', {className: "form-group"},
  //     R('label', {className: "text-muted"}, 
  //       "Mode"),
  //     R('div', {style: { marginLeft: 10 }}, 
  //       R(TableSelectComponent, { 
  //         schema: this.props.schema,
  //         value: this.props.design.table,
  //         onChange: this.handleTableChange, 
  //         filter: this.props.design.filter,
  //         onFilterChange: this.handleFilterChange
  //       })));
  // }


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

  renderRegionsTable() {
    let options = _.map(_.filter(this.props.schema.getTables(), table => table.id.startsWith("regions.")), table => ({ value: table.id, label: table.name.en }))
    return (
      <div className="form-group">
        <label className="text-muted">Regions Type</label>
        <div style={{ marginLeft: 8 }}>
          <ui.Select
            value={this.props.design.regionsTable}
            onChange={this.handleRegionsTableChange}
            options={options}
            nullLabel="Administrative Regions"
          />
        </div> 
      </div>
    )
  }

  renderAdminRegionExpr() {
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
            value={this.props.design.adminRegionExpr}
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
    if (!this.props.design.table) {
      return;
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

    return R('div', null,
      !this.props.design.axes.color ?
        R('div', {className: "form-group"},
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
        ) : undefined,

      R('div', {className: "form-group"},
        R('label', {className: "text-muted"}, 
          R('span', {className: "glyphicon glyphicon glyphicon-tint"}),
          "Color By Data"),

        R(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.design.table,
          types: ["text", "enum", "boolean",'date'],
          aggrNeed: "required",
          value: this.props.design.axes.color,
          defaultColor: this.props.design.color,
          showColorMap: true,
          onChange: this.handleColorAxisChange,
          allowExcludedValues: true,
          filters
        }
        )
      )
    );
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
        "Fill Opacity (%)"),
      ": ",
      R(Rcslider, {
        min: 0,
        max: 100,
        step: 1,
        tipTransitionName: "rc-slider-tooltip-zoom-down",
        value: this.props.design.fillOpacity * 100,
        onChange: (val: number) => this.handleFillOpacityChange(val/100)
      }
      )
    );
  }

  renderFilter() {
    // If no data, hide
    if (!this.props.design.table) {
      return null;
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
    if (!this.props.design.table) {
      return null;
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
    }
    );
  }

  render() {
    return R('div', null,
      this.renderTable(),
      this.renderRegionsTable(),
      this.renderAdminRegionExpr(),
      this.renderScopeAndDetailLevel(),
      this.renderDisplayNames(),
      this.renderColor(),
      this.renderFillOpacity(),
      this.renderFilter(),
      this.renderPopup(),
      this.props.design.table ?
        R(ZoomLevelsComponent, {design: this.props.design, onDesignChange: this.props.onDesignChange}) : undefined
    );
  }
}

export = ChoroplethLayerDesigner