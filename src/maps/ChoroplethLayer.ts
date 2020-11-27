import _ from 'lodash';
import React from 'react';

import { original, produce } from 'immer'

import Layer from './Layer';
import { ExprUtils, ExprCompiler, ExprCleaner, injectTableAlias, Schema, Expr, DataSource, OpExpr } from 'mwater-expressions';
import AxisBuilder from '../axes/AxisBuilder';
import { LayerDefinition, OnGridClickResults } from './maps';
import { JsonQLFilter } from '../index';
import ChoroplethLayerDesign from './ChoroplethLayerDesign'
import { JsonQL, JsonQLQuery } from 'jsonql';
const LayerLegendComponent = require('./LayerLegendComponent');
const PopupFilterJoinsUtils = require('./PopupFilterJoinsUtils');

export default class ChoroplethLayer extends Layer<ChoroplethLayerDesign> {
  /** Gets the layer definition as JsonQL + CSS in format:
   *   {
   *     layers: array of { id: layer id, jsonql: jsonql that includes "the_webmercator_geom" as a column }
   *     css: carto css
   *     interactivity: (optional) { layer: id of layer, fields: array of field names }
   *   }
   * arguments:
   *   design: design of layer
   *   schema: schema to use
   *   filters: array of filters to apply
   */
  getJsonQLCss(design: ChoroplethLayerDesign, schema: Schema, filters: JsonQLFilter[]): LayerDefinition {
    // Create design
    const layerDef = {
      layers: [{ id: "layer0", jsonql: this.createJsonQL(design, schema, filters) }],
      css: this.createCss(design, schema, filters),
      interactivity: {
        layer: "layer0",
        fields: ["id", "name"]
      }
    }

    return layerDef
  }

  createJsonQL(design: ChoroplethLayerDesign, schema: Schema, filters: JsonQLFilter[]): JsonQL {
    const axisBuilder = new AxisBuilder({schema});
    const exprCompiler = new ExprCompiler(schema);

    // Verify that scopeLevel is an integer to prevent injection
    if ((design.scopeLevel != null) && ![0, 1, 2, 3, 4, 5].includes(design.scopeLevel)) {
      throw new Error("Invalid scope level");
    }

    // Verify that detailLevel is an integer to prevent injection
    if (![0, 1, 2, 3, 4, 5].includes(design.detailLevel)) {
      throw new Error("Invalid detail level");
    }

    const regionsTable = design.regionsTable || "admin_regions";
    
    if (design.regionMode === "plain") {
      /*
      E.g:
      select name, shape_simplified from
        admin_regions as regions
        where regions.level0 = 'eb3e12a2-de1e-49a9-8afd-966eb55d47eb'
        and regions.level = 2
      */
      const query: JsonQLQuery = {
        type: "query",
        selects: [
          { type: "select", expr: { type: "field", tableAlias: "regions", column: "_id" }, alias: "id" },
          { type: "select", expr: { type: "field", tableAlias: "regions", column: "shape_simplified" }, alias: "the_geom_webmercator" },
          { type: "select", expr: { type: "field", tableAlias: "regions", column: "name" }, alias: "name" }
        ],
        from: { type: "table", table: regionsTable, alias: "regions" },
        where: {
          type: "op",
          op: "and",
          exprs: [
            // Level to display
            {
              type: "op",
              op: "=",
              exprs: [
                { type: "field", tableAlias: "regions", column: "level" },
                design.detailLevel
              ]
            }
          ]
        }
      }

      // Scope overall
      if (design.scope) {
        query.where!.exprs.push({
          type: "op",
          op: "=",
          exprs: [
            { type: "field", tableAlias: "regions", column: `level${design.scopeLevel || 0}` },
            { type: "literal", value: design.scope }
          ]
        })
      }
      return query
    }

    if (design.regionMode === "indirect" || !design.regionMode) {
      /*
      E.g:
      select name, shape_simplified, regions.color from
      admin_regions as regions2
      left outer join
      (
        select admin_regions.level2 as id,
        count(innerquery.*) as color
        from
        admin_regions inner join
        entities.water_point as innerquery
        on innerquery.admin_region = admin_regions._id
        where admin_regions.level0 = 'eb3e12a2-de1e-49a9-8afd-966eb55d47eb'
        group by 1
      ) as regions on regions.id = regions2._id
      where regions2.level = 2 and regions2.level0 = 'eb3e12a2-de1e-49a9-8afd-966eb55d47eb'
      */
      const compiledAdminRegionExpr = exprCompiler.compileExpr({expr: design.adminRegionExpr || null, tableAlias: "innerquery"});

      // Create inner query
      const innerQuery: JsonQLQuery = {
        type: "query",
        selects: [
          { type: "select", expr: { type: "field", tableAlias: "regions", column: `level${design.detailLevel}` }, alias: "id" }
        ],
        from: {
          type: "join",
          kind: "inner",
          left: { type: "table", table: regionsTable, alias: "regions" },
          right: exprCompiler.compileTable(design.table!, "innerquery"),
          on: {
            type: "op",
            op: "=",
            exprs: [
              compiledAdminRegionExpr,
              { type: "field", tableAlias: "regions", column: "_id" }
            ]
          }
        },
        groupBy: [1]
      };

      // Add color select if color axis
      if (design.axes.color) {
        const colorExpr = axisBuilder.compileAxis({axis: design.axes.color, tableAlias: "innerquery"});
        innerQuery.selects.push({ type: "select", expr: colorExpr, alias: "color" });
      }

      // Add label select if color axis
      if (design.axes.label) {
        const labelExpr = axisBuilder.compileAxis({axis: design.axes.label, tableAlias: "innerquery"});
        innerQuery.selects.push({ type: "select", expr: labelExpr, alias: "label" });
      }

      let whereClauses = [];

      if (design.scope) {
        whereClauses.push({
          type: "op",
          op: "=",
          exprs: [
            { type: "field", tableAlias: "regions", column: `level${design.scopeLevel || 0}` },
            design.scope
          ]
        });
      }

      // Then add filters
      if (design.filter) {
        whereClauses.push(exprCompiler.compileExpr({expr: design.filter, tableAlias: "innerquery"}));
      }

      // Then add extra filters passed in, if relevant
      const relevantFilters = _.where(filters, {table: design.table});
      for (let filter of relevantFilters) {
        whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"));
      }

      whereClauses = _.compact(whereClauses);

      if (whereClauses.length > 0) {
        innerQuery.where = { type: "op", op: "and", exprs: whereClauses };
      }

      // Now create outer query
      const query: JsonQLQuery = {
        type: "query",
        selects: [
          { type: "select", expr: { type: "field", tableAlias: "regions2", column: "_id" }, alias: "id" },
          { type: "select", expr: { type: "field", tableAlias: "regions2", column: "shape_simplified" }, alias: "the_geom_webmercator" },
          { type: "select", expr: { type: "field", tableAlias: "regions2", column: "name" }, alias: "name" }
        ],
        from: {
          type: "join",
          kind: "left",
          left: { type: "table", table: regionsTable, alias: "regions2" },
          right: { type: "subquery", query: innerQuery, alias: "regions" },
          on: {
            type: "op",
            op: "=",
            exprs: [
              { type: "field", tableAlias: "regions", column: "id" },
              { type: "field", tableAlias: "regions2", column: "_id" }
            ]
          }
        },
        where: {
          type: "op",
          op: "and",
          exprs: [
            // Level to display
            {
              type: "op",
              op: "=",
              exprs: [
                { type: "field", tableAlias: "regions2", column: "level" },
                design.detailLevel
              ]
            }
          ]
        }
      }

      // Scope overall
      if (design.scope) {
        query.where!.exprs.push({
          type: "op",
          op: "=",
          exprs: [
            { type: "field", tableAlias: "regions2", column: `level${design.scopeLevel || 0}` },
            { type: "literal", value: design.scope }
          ]
        })
      }

      // Bubble up color and label
      if (design.axes.color) {
        query.selects.push({ type: "select", expr: { type: "field", tableAlias: "regions", column: "color"}, alias: "color" })
      }

      // Add label select if color axis
      if (design.axes.label) {
        query.selects.push({ type: "select", expr: { type: "field", tableAlias: "regions", column: "label"}, alias: "label" })
      }

      return query
    }

    if (design.regionMode === "direct") {
      /*
      E.g:
      select name, shape_simplified from
        admin_regions as regions
        where regions.level0 = 'eb3e12a2-de1e-49a9-8afd-966eb55d47eb'
        and regions.level = 2
      */
      const query: JsonQLQuery = {
        type: "query",
        selects: [
          { type: "select", expr: { type: "field", tableAlias: "regions", column: "_id" }, alias: "id" },
          { type: "select", expr: { type: "field", tableAlias: "regions", column: "shape_simplified" }, alias: "the_geom_webmercator" },
          { type: "select", expr: { type: "field", tableAlias: "regions", column: "name" }, alias: "name" }
        ],
        from: { type: "table", table: regionsTable, alias: "regions" },
        where: {
          type: "op",
          op: "and",
          exprs: [
            // Level to display
            {
              type: "op",
              op: "=",
              exprs: [
                { type: "field", tableAlias: "regions", column: "level" },
                design.detailLevel
              ]
            }
          ]
        }
      }

      // Add color select 
      if (design.axes.color) {
        const colorExpr = axisBuilder.compileAxis({axis: design.axes.color, tableAlias: "regions"});
        query.selects.push({ type: "select", expr: colorExpr, alias: "color" });
      }

      // Add label select if color axis
      if (design.axes.label) {
        const labelExpr = axisBuilder.compileAxis({axis: design.axes.label, tableAlias: "regions"});
        query.selects.push({ type: "select", expr: labelExpr, alias: "label" });
      }
      
      // Scope overall
      if (design.scope) {
        query.where!.exprs.push({
          type: "op",
          op: "=",
          exprs: [
            { type: "field", tableAlias: "regions", column: `level${design.scopeLevel || 0}` },
            { type: "literal", value: design.scope }
          ]
        })
      }
      return query
    }

    throw new Error(`Unsupported regionMode ${design.regionMode}`)
  }

  createCss(design: ChoroplethLayerDesign, schema: Schema, filters: JsonQLFilter[]): string {
    let css = `\
#layer0 {
  line-color: ${design.borderColor || "#000"};
  line-width: 1.5;
  line-opacity: 0.5;
  polygon-opacity: ` + (design.fillOpacity * design.fillOpacity) + `;
  polygon-fill: ` + (design.color || "transparent") + `;
}
\
`;

    if (design.displayNames) {
      css += `\
#layer0::labels {
  text-name: [name];
  text-face-name: 'Arial Regular';
  text-halo-radius: 2;
  text-halo-opacity: 0.5;
  text-halo-fill: #FFF;
}\
`;
    }

    // If color axes, add color conditions
    if (design.axes.color && design.axes.color.colorMap) {
      for (let item of design.axes.color.colorMap) {
        // If invisible
        if (_.includes(design.axes.color.excludedValues || [], item.value)) {
          css += `#layer0 [color=${JSON.stringify(item.value)}] { line-color: transparent; polygon-opacity: 0; polygon-fill: transparent; }\n`;  
          if (design.displayNames) {
            css += `#layer0::labels [color=${JSON.stringify(item.value)}] { text-opacity: 0; text-halo-opacity: 0; }\n`;  
          }
        } else {
          css += `#layer0 [color=${JSON.stringify(item.value)}] { polygon-fill: ${item.color}; }\n`;
        }
      }
    }

    return css;
  }

  /**  
   * Called when the interactivity grid is clicked. 
   * arguments:
   *   ev: { data: interactivty data e.g. `{ id: 123 }` }
   *   clickOptions: 
   *     design: design of layer
   *     schema: schema to use
   *     dataSource: data source to use
   *     layerDataSource: layer data source
   *     scopeData: current scope data if layer is scoping
   *     filters: compiled filters to apply to the popup
   * 
   * Returns:
   *   null/undefined 
   *   or
   *   {
   *     scope: scope to apply ({ name, filter, data })
   *     row: { tableId:, primaryKey: }  # row that was selected
   *     popup: React element to put into a popup
   */
  onGridClick(ev: { data: any, event: any }, clickOptions: {
    /** design of layer */
    design: any
    /** schema to use */
    schema: Schema
    /** data source to use */
    dataSource: DataSource
    /** layer data source */
    layerDataSource: any // TODO
    /** current scope data if layer is scoping */
    scopeData: any
    /** compiled filters to apply to the popup */
    filters: JsonQLFilter[]
  }): OnGridClickResults {
    // Ignore if not indirect with table
    if (clickOptions.design.regionMode !== "indirect" || !clickOptions.design.table) {
      return null
    }

    const regionsTable = clickOptions.design.regionsTable || "admin_regions";

    // TODO abstract most to base class
    if (ev.data && ev.data.id) {
      const results: OnGridClickResults = {}

      // Create filter for single row
      const { table } = clickOptions.design;

      // Compile adminRegionExpr
      const exprCompiler = new ExprCompiler(clickOptions.schema);
      const filterExpr: Expr = {
        type: "op",
        op: "within",
        table,
        exprs: [
          clickOptions.design.adminRegionExpr,
          { type: "literal", idTable: regionsTable, valueType: "id", value: ev.data.id }
        ]
      }

      const compiledFilterExpr = exprCompiler.compileExpr({ expr: filterExpr, tableAlias: "{alias}"});

      // Filter within
      const filter = {
        table,
        jsonql: compiledFilterExpr
      };

      if (ev.event.originalEvent.shiftKey) {
        // Scope to region, unless already scoped
        if (clickOptions.scopeData === ev.data.id) {
          results.scope = null;
        } else {
          results.scope = {
            name: ev.data.name,
            filter,
            filterExpr,
            data: ev.data.id
          };
        }

      } else if (clickOptions.design.popup) {
        // Create default popup filter joins
        const defaultPopupFilterJoins = {};
        if (clickOptions.design.adminRegionExpr) {
          defaultPopupFilterJoins[clickOptions.design.table] = clickOptions.design.adminRegionExpr;
        }

        // Create filter using popupFilterJoins
        const popupFilterJoins = clickOptions.design.popupFilterJoins || defaultPopupFilterJoins;
        const popupFilters = PopupFilterJoinsUtils.createPopupFilters(popupFilterJoins, clickOptions.schema, table, ev.data.id, true);

        // Add filter for admin region
        popupFilters.push({
          table: regionsTable,
          jsonql: { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "{alias}", column: "_id" }, { type: "literal", value: ev.data.id }]}
        });

        const BlocksLayoutManager = require('../layouts/blocks/BlocksLayoutManager');
        const WidgetFactory = require('../widgets/WidgetFactory');

        results.popup = new BlocksLayoutManager().renderLayout({
          items: clickOptions.design.popup.items,
          style: "popup",
          renderWidget: (options: any) => {
            const widget = WidgetFactory.createWidget(options.type);

            // Create filters for single row
            const filters = clickOptions.filters.concat(popupFilters);

            // Get data source for widget
            const widgetDataSource = clickOptions.layerDataSource.getPopupWidgetDataSource(clickOptions.design, options.id);

            return widget.createViewElement({
              schema: clickOptions.schema,
              dataSource: clickOptions.dataSource,
              widgetDataSource,
              design: options.design,
              scope: null,
              filters,
              onScopeChange: null,
              onDesignChange: null,
              width: options.width,
              height: options.height,
            });
          }
          });
      }

      return results;
    } else {
      return null;
    }
  }

  // Gets the bounds of the layer as GeoJSON
  getBounds(design: ChoroplethLayerDesign, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[], callback: any) {
    const regionsTable = design.regionsTable || "admin_regions";

    // Whole world
    if (!design.scope) {
      return callback(null);
    }

    // Get just scope. Ignore filters and get entire scope
    filters = [{
      table: regionsTable,
      jsonql: {
        type: "op",
        op: "=",
        exprs: [
          { type: "field", tableAlias: "{alias}", column: "_id" },
          design.scope
        ]
      }
    }];

    return this.getBoundsFromExpr(schema, dataSource, regionsTable, { type: "field", table: regionsTable, column: "shape" }, null, filters, callback);
  }

  // Get min and max zoom levels
  getMinZoom(design: ChoroplethLayerDesign) { return design.minZoom; }
  getMaxZoom(design: ChoroplethLayerDesign) { return design.maxZoom || 21; }

  // Get the legend to be optionally displayed on the map. Returns
  // a React element
  getLegend(design: ChoroplethLayerDesign, schema: Schema, name: string, dataSource: DataSource, locale: string, filters: JsonQLFilter[]) {
    if (filters == null) { filters = []; }
    const _filters = filters.slice();
    if (design.filter != null) {
      const exprCompiler = new ExprCompiler(schema);
      const jsonql = exprCompiler.compileExpr({expr: design.filter, tableAlias: "{alias}"});
      const table = (design.filter as OpExpr).table
      if (jsonql && table) {
        _filters.push({ table: table, jsonql });
      }
    }
    const axisBuilder = new AxisBuilder({schema});

    const regionsTable = design.regionsTable || "admin_regions"
    const axisTable = design.regionMode === "direct" ? regionsTable : design.table

    return React.createElement(LayerLegendComponent, {
      schema,
      name,
      dataSource,
      filters: _.compact(_filters),
      axis: axisBuilder.cleanAxis({axis: design.axes.color || null, table: axisTable, types: ['enum', 'text', 'boolean','date'], aggrNeed: "required"}),
      defaultColor: design.color,
      locale
    });
  }

  // Get a list of table ids that can be filtered on
  getFilterableTables(design: ChoroplethLayerDesign, schema: Schema): string[] {
    if (design.table) { return [design.table]; } else { return []; }
  }

  /** True if layer can be edited */
  isEditable() {
    return true;
  }

  // Returns a cleaned design
  cleanDesign(design: ChoroplethLayerDesign, schema: Schema): ChoroplethLayerDesign {
    const regionsTable = design.regionsTable || "admin_regions";
    const exprCleaner = new ExprCleaner(schema);
    const axisBuilder = new AxisBuilder({schema});

    design = produce(design, draft => {
      draft.axes = design.axes || {};

      // Default region mode
      if (!design.regionMode) {
        draft.regionMode = draft.axes.color ? "indirect" : "plain"
      }

      // Default color
      if (draft.regionMode === "plain") {
        draft.color = design.color || "#FFFFFF";
      }
      else {
        draft.color = "#FFFFFF"
      }

      if (draft.regionMode === "indirect" && design.table) {
        draft.adminRegionExpr = exprCleaner.cleanExpr(design.adminRegionExpr || null, { table: design.table, types: ["id"], idTable: regionsTable });
      }
      else {
        delete draft.adminRegionExpr
        delete draft.table
      }

      draft.fillOpacity = (design.fillOpacity != null) ? design.fillOpacity : 0.75;
      draft.displayNames = (design.displayNames != null) ? design.displayNames : true;

      // Clean the axes
      if (draft.regionMode === "indirect" && design.table) {
        draft.axes.color = axisBuilder.cleanAxis({axis: original(draft.axes.color) || null, table: design.table, types: ['enum', 'text', 'boolean','date'], aggrNeed: "required"});
        draft.axes.label = axisBuilder.cleanAxis({axis: original(draft.axes.label) || null, table: design.table, types: ['text', 'number'], aggrNeed: "required"});
      } else if (draft.regionMode === "plain" || (draft.regionMode === "indirect" && !design.table)) {
        delete draft.axes.color
        delete draft.axes.label
      } else if (draft.regionMode === "direct") {
        draft.axes.color = axisBuilder.cleanAxis({axis: original(draft.axes.color) || null, table: regionsTable, types: ['enum', 'text', 'boolean', 'date'], aggrNeed: "none"});
        draft.axes.label = axisBuilder.cleanAxis({axis: original(draft.axes.label) || null, table: regionsTable, types: ['text', 'number'], aggrNeed: "none"});
      }

      // Filter is only for indirect
      if (draft.regionMode === "indirect" && design.table) {
        draft.filter = exprCleaner.cleanExpr(design.filter || null, { table: design.table })
      }
      else {
        delete draft.filter
      }

      if ((design.detailLevel == null)) {
        draft.detailLevel = 0
      }
    })

    return design
  }

  // Validates design. Null if ok, message otherwise
  validateDesign(design: ChoroplethLayerDesign, schema: Schema) {
    let error;
    const exprUtils = new ExprUtils(schema);
    const axisBuilder = new AxisBuilder({schema});

    if (design.regionMode === "indirect") {
      if (!design.table) {
        return "Missing table";
      }
      if (!design.adminRegionExpr || (exprUtils.getExprType(design.adminRegionExpr) !== "id")) {
        return "Missing admin region expr";
      }

      error = axisBuilder.validateAxis({ axis: design.axes.color || null });
      if (error) { return error; }

      error = axisBuilder.validateAxis({ axis: design.axes.label || null });
      if (error) { return error; }
    }
    else if (design.regionMode === "direct") {
      error = axisBuilder.validateAxis({ axis: design.axes.color || null });
      if (error) { return error; }

      error = axisBuilder.validateAxis({ axis: design.axes.label || null });
      if (error) { return error; }
    }
  
    if ((design.detailLevel == null)) {
      return "Missing detail level";
    }

    return null;
  }

  // Creates a design element with specified options
  // options:
  //   design: design of layer
  //   schema: schema to use
  //   dataSource: data source to use
  //   onDesignChange: function called when design changes
  //   filters: array of filters
  createDesignerElement(options: {
    design: ChoroplethLayerDesign
    schema: Schema
    dataSource: DataSource
    onDesignChange: (design: ChoroplethLayerDesign) => void
    filters: JsonQLFilter[]
  }): React.ReactElement<{}> {
    // Require here to prevent server require problems
    const ChoroplethLayerDesigner = require('./ChoroplethLayerDesigner').default;

    // Clean on way in and out
    return React.createElement(ChoroplethLayerDesigner, {
      schema: options.schema,
      dataSource: options.dataSource,
      design: this.cleanDesign(options.design, options.schema),
      filters: options.filters,
      onDesignChange: (design: ChoroplethLayerDesign) => {
        return options.onDesignChange(this.cleanDesign(design, options.schema));
      }
    });
  }

  createKMLExportJsonQL(design: ChoroplethLayerDesign, schema: Schema, filters: JsonQLFilter[]) {
    const regionsTable = design.regionsTable || "admin_regions";
    const axisBuilder = new AxisBuilder({schema});
    const exprCompiler = new ExprCompiler(schema);

    // Verify that scopeLevel is an integer to prevent injection
    if ((design.scopeLevel != null) && ![0, 1, 2, 3, 4, 5].includes(design.scopeLevel)) {
      throw new Error("Invalid scope level");
    }

    // Verify that detailLevel is an integer to prevent injection
    if (![0, 1, 2, 3, 4, 5].includes(design.detailLevel)) {
      throw new Error("Invalid detail level");
    }

    // Compile adminRegionExpr
    const compiledAdminRegionExpr = exprCompiler.compileExpr({expr: design.adminRegionExpr || null, tableAlias: "innerquery"});

    // Create inner query
    const innerQuery: JsonQLQuery = {
      type: "query",
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "regions", column: `level${design.detailLevel}` }, alias: "id" }
      ],
      from: {
        type: "join",
        kind: "inner",
        left: { type: "table", table: regionsTable, alias: "regions" },
        right: exprCompiler.compileTable(design.table!, "innerquery"),
        on: {
          type: "op",
          op: "=",
          exprs: [
            compiledAdminRegionExpr,
            { type: "field", tableAlias: "regions", column: "_id" }
          ]
        }
      },
      groupBy: [1]
    };

    // Add color select if color axis
    if (design.axes.color) {
      const valueExpr: JsonQL = exprCompiler.compileExpr({expr: design.axes.color.expr, tableAlias: "innerquery"});
      const colorExpr: JsonQL = axisBuilder.compileAxis({axis: design.axes.color, tableAlias: "innerquery"});
      innerQuery.selects.push({ type: "select", expr: colorExpr, alias: "color" });
      innerQuery.selects.push({ type: "select", expr: valueExpr, alias: "value" });
    }

    // Add label select if color axis
    if (design.axes.label) {
      const labelExpr = axisBuilder.compileAxis({axis: design.axes.label, tableAlias: "innerquery"});
      innerQuery.selects.push({ type: "select", expr: labelExpr, alias: "label" });
    }

    let whereClauses = [];

    if (design.scope) {
      whereClauses.push({
        type: "op",
        op: "=",
        exprs: [
          { type: "field", tableAlias: "regions", column: `level${design.scopeLevel || 0}` },
          design.scope
        ]
      });
    }

    // Then add filters
    if (design.filter) {
      whereClauses.push(exprCompiler.compileExpr({expr: design.filter, tableAlias: "innerquery"}));
    }

    // Then add extra filters passed in, if relevant
    const relevantFilters = _.where(filters, {table: design.table});
    for (let filter of relevantFilters) {
      whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"));
    }

    whereClauses = _.compact(whereClauses);

    if (whereClauses.length > 0) {
      innerQuery.where = { type: "op", op: "and", exprs: whereClauses };
    }

    const adminGeometry = {
      type: "op", op: "ST_AsGeoJson", exprs: [
        {
          type: "op", op: "ST_Transform", exprs: [
            {type: "field", tableAlias: "regions2", column: "shape_simplified"},
            4326
          ]
        }
      ]
    };

    // Now create outer query
    const query: JsonQLQuery = {
      type: "query",
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "regions2", column: "_id" }, alias: "id" },
        { type: "select", expr: adminGeometry, alias: "the_geom_webmercator" },
        { type: "select", expr: { type: "field", tableAlias: "regions2", column: "name" }, alias: "name" }
      ],
      from: {
        type: "join",
        kind: "left",
        left: { type: "table", table: regionsTable, alias: "regions2" },
        right: { type: "subquery", query: innerQuery, alias: "regions" },
        on: {
          type: "op",
          op: "=",
          exprs: [
            { type: "field", tableAlias: "regions", column: "id" },
            { type: "field", tableAlias: "regions2", column: "_id" }
          ]
        }
      },
      where: {
        type: "op",
        op: "and",
        exprs: [
          // Level to display
          {
            type: "op",
            op: "=",
            exprs: [
              { type: "field", tableAlias: "regions2", column: "level" },
              design.detailLevel
            ]
          }
        ]
      }
    };

    // Scope overall
    if (design.scope) {
      query.where!.exprs.push({
        type: "op",
        op: "=",
        exprs: [
          { type: "field", tableAlias: "regions2", column: `level${design.scopeLevel || 0}` },
          { type: "literal", value: design.scope }
        ]
      });
    }

    // Bubble up color and label
    if (design.axes.color) {
      query.selects.push({ type: "select", expr: { type: "field", tableAlias: "regions", column: "color"}, alias: "color" });
      query.selects.push({ type: "select", expr: { type: "field", tableAlias: "regions", column: "value"}, alias: "value" });
    }

    // Add label select if color axis
    if (design.axes.label) {
      query.selects.push({ type: "select", expr: { type: "field", tableAlias: "regions", column: "label"}, alias: "label" });
    }

    return query;
  }

  getKMLExportJsonQL(design: ChoroplethLayerDesign, schema: Schema, filters: JsonQLFilter[]) {
    const style: { color?: string | null, opacity?: number, colorMap: any } = {
      color: design.color,
      opacity: design.fillOpacity,
      colorMap: null
    };

    if (design.axes.color && design.axes.color.colorMap) {
      style.colorMap = design.axes.color.colorMap;
    }

    const layerDef = {
      layers: [{ id: "layer0", jsonql: this.createKMLExportJsonQL(design, schema, filters), style}]
    };

    return layerDef;
  }

  acceptKmlVisitorForRow(visitor: any, row: any) {
    let outer;
    if (!row.the_geom_webmercator) {
      return;
    }

    if (row.the_geom_webmercator.length === 0) {
      return;
    }

    const data = JSON.parse(row.the_geom_webmercator);

    if (data.coordinates.length === 0) {
      return;
    }

    if (data.type === "MultiPolygon") {
      outer = data.coordinates[0][0];
    } else {
      outer = data.coordinates[0];
    }


    const list = _.map(outer, (coordinates: any) => coordinates.join(","));

    return visitor.addPolygon(list.join(" "), row.color, data.type === "MultiPolygon", row.name, visitor.buildDescription(row));
  }
}
