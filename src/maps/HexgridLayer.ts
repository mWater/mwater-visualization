import _ from 'lodash';
import React from 'react';

import Layer from './Layer'
import { ExprUtils, ExprCompiler, ExprCleaner, injectTableAlias, Schema, JsonQL, JsonQLQuery, Expr, DataSource, JsonQLExpr } from 'mwater-expressions';
import AxisBuilder from '../axes/AxisBuilder';
import { LayerDefinition, OnGridClickResults } from './maps';
import { JsonQLFilter } from '../index';
import HexgridLayerDesign from './HexgridLayerDesign'
import produce from 'immer';
import { Axis } from '../axes/Axis';
const LayerLegendComponent = require('./LayerLegendComponent');
const PopupFilterJoinsUtils = require('./PopupFilterJoinsUtils');

/** Layer which is a grid of flat-topped hexagons. Depends on "Hexgrid Functions.sql" having been run */
export default class HexgridLayer extends Layer<HexgridLayerDesign> {
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
  getJsonQLCss(design: HexgridLayerDesign, schema: Schema, filters: JsonQLFilter[]): LayerDefinition {
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

  createJsonQL(design: HexgridLayerDesign, schema: Schema, filters: JsonQLFilter[]): JsonQL {
    const axisBuilder = new AxisBuilder({ schema })
    const exprCompiler = new ExprCompiler(schema)

    /* Compile to a query like this:
      select mwater_hex_make(grid.q, grid.r, !pixel_width!*SIZE) as the_geom_webmercator, data.color as color from 
          mwater_hex_grid(!bbox!, !pixel_width!*SIZE) as grid 
        left outer join
          (select qr.q as q, qr.r as r, COLOREXPR as color from TABLE as innerquery
            inner join mwater_hex_xy_to_qr(st_xmin(innerquery.LOCATIONEXPR), st_ymin(innerquery.LOCATIONEXPR), !pixel_width!*10) as qr 
            on true
            where innerquery.LOCATIONEXPR && !bbox!
          group by 1, 2) as data
        on data.q = grid.q and data.r = grid.r 
    */
    const compiledGeometryExpr = exprCompiler.compileExpr({ expr: design.geometryExpr, tableAlias: "innerquery" })
    const colorExpr = axisBuilder.compileAxis({axis: design.colorAxis, tableAlias: "innerquery"});
    const compiledSizeExpr = design.sizeUnits == "pixels" ? 
      { type: "op", op: "*", exprs: [{ type: "token", token: "!pixel_width!" }, design.size! / 2] }
      : { type: "literal", value: design.size! / 2 }

    // Create inner query
    const innerQuery: JsonQLQuery = {
      type: "query",
      selects: [
        { type: "select", expr: { type: "field", tableAlias: "qr", column: "q" }, alias: "q" },
        { type: "select", expr: { type: "field", tableAlias: "qr", column: "r" }, alias: "r" },
        { type: "select", expr: colorExpr, alias: "color" }
      ],
      from: {
        type: "join",
        kind: "inner",
        left: { type: "table", table: design.table!, alias: "innerquery" },
        right: { type: "subexpr", expr: { type: "op", op: "mwater_hex_xy_to_qr", exprs: [
          { type: "op", op: "ST_XMin", exprs: [compiledGeometryExpr] },
          { type: "op", op: "ST_YMin", exprs: [compiledGeometryExpr] },
          compiledSizeExpr
        ]}, alias: "qr"},
        on: { type: "literal", valueType: "boolean", value: true }
      },
      groupBy: [1, 2]
    }

    // Filter by bounding box
    let whereClauses: JsonQLExpr[] = [
      {
        type: "op",
        op: "&&",
        exprs: [
          compiledGeometryExpr,
          { type: "token", token: "!bbox!" }
        ]
      }
    ]

    // Then add filters
    if (design.filter) {
      whereClauses.push(exprCompiler.compileExpr({expr: design.filter, tableAlias: "innerquery"}))
    }

    // Then add extra filters passed in, if relevant
    const relevantFilters = _.where(filters, {table: design.table})
    for (let filter of relevantFilters) {
      whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"))
    }

    whereClauses = _.compact(whereClauses)
    if (whereClauses.length > 0) {
      innerQuery.where = { type: "op", op: "and", exprs: whereClauses }
    }

    // Now create outer query
    const query: JsonQLQuery = {
      type: "query",
      selects: [
        { type: "select", expr: { type: "op", op: "mwater_hex_make", exprs: [
          { type: "field", tableAlias: "grid", column: "q" },
          { type: "field", tableAlias: "grid", column: "r" },
          compiledSizeExpr
        ]}, alias: "the_geom_webmercator" },
        { type: "select", expr: { type: "field", tableAlias: "data", column: "color" }, alias: "color" }
      ],
      from: {
        type: "join",
        kind: "left",
        left: { type: "subexpr", expr: { type: "op", op: "mwater_hex_grid", exprs: [
          { type: "token", token: "!bbox!" },
          compiledSizeExpr
        ]}, alias: "grid" },
        right: { type: "subquery", query: innerQuery, alias: "data" },
        // on data.q = grid.q and data.r = grid.r 
        on: {
          type: "op",
          op: "and",
          exprs: [
            {
              type: "op",
              op: "=",
              exprs: [
                { type: "field", tableAlias: "data", column: "q" },
                { type: "field", tableAlias: "grid", column: "q" }
              ]
            },
            {
              type: "op",
              op: "=",
              exprs: [
                { type: "field", tableAlias: "data", column: "r" },
                { type: "field", tableAlias: "grid", column: "r" }
              ]
            }
          ]
        }
      }
    }

    return query
  }

  createCss(design: HexgridLayerDesign, schema: Schema, filters: JsonQLFilter[]): string {
    let css = `\
#layer0 {
  polygon-opacity: ` + design.fillOpacity + `;
  polygon-fill: transparent;
}
\
`;
  if (!design.colorAxis) {
    throw new Error("Color axis not set")
  }
    // If color axes, add color conditions
    if (design.colorAxis.colorMap) {
      for (let item of design.colorAxis.colorMap) {
        // If invisible
        if (design.colorAxis.excludedValues && _.any(design.colorAxis.excludedValues, ev => ev === item.value)) {
          css += `#layer0 [color=${JSON.stringify(item.value)}] { polygon-opacity: 0; polygon-fill: transparent; }\n`;  
        } else {
          css += `#layer0 [color=${JSON.stringify(item.value)}] { polygon-fill: ${item.color}; }\n`;
        }
      }
    }

    return css;
  }

  // TODO
  // /**  
  //  * Called when the interactivity grid is clicked. 
  //  * arguments:
  //  *   ev: { data: interactivty data e.g. `{ id: 123 }` }
  //  *   clickOptions: 
  //  *     design: design of layer
  //  *     schema: schema to use
  //  *     dataSource: data source to use
  //  *     layerDataSource: layer data source
  //  *     scopeData: current scope data if layer is scoping
  //  *     filters: compiled filters to apply to the popup
  //  * 
  //  * Returns:
  //  *   null/undefined 
  //  *   or
  //  *   {
  //  *     scope: scope to apply ({ name, filter, data })
  //  *     row: { tableId:, primaryKey: }  # row that was selected
  //  *     popup: React element to put into a popup
  //  */
  // onGridClick(ev: { data: any, event: any }, clickOptions: {
  //   /** design of layer */
  //   design: HexgridLayerDesign
  //   /** schema to use */
  //   schema: Schema
  //   /** data source to use */
  //   dataSource: DataSource
  //   /** layer data source */
  //   layerDataSource: any // TODO
  //   /** current scope data if layer is scoping */
  //   scopeData: any
  //   /** compiled filters to apply to the popup */
  //   filters: JsonQLFilter[]
  // }): OnGridClickResults {
  //   // TODO abstract most to base class
  //   if (ev.data && ev.data.id) {
  //     const results: OnGridClickResults = {}

  //     // Create filter for single row
  //     const { table } = clickOptions.design;

  //     // Compile adminRegionExpr
  //     const exprCompiler = new ExprCompiler(clickOptions.schema);
  //     const filterExpr: Expr = {
  //       type: "op",
  //       op: "within",
  //       table,
  //       exprs: [
  //         clickOptions.design.adminRegionExpr,
  //         { type: "literal", idTable: regionsTable, valueType: "id", value: ev.data.id }
  //       ]
  //     }

  //     const compiledFilterExpr = exprCompiler.compileExpr({ expr: filterExpr, tableAlias: "{alias}"});

  //     // Filter within
  //     const filter = {
  //       table,
  //       jsonql: compiledFilterExpr
  //     };

  //     if (ev.event.originalEvent.shiftKey) {
  //       // Scope to region, unless already scoped
  //       if (clickOptions.scopeData === ev.data.id) {
  //         results.scope = null;
  //       } else {
  //         results.scope = {
  //           name: ev.data.name,
  //           filter,
  //           data: ev.data.id
  //         };
  //       }

  //     } else if (clickOptions.design.popup) {
  //       // Create default popup filter joins
  //       const defaultPopupFilterJoins = {};
  //       if (clickOptions.design.adminRegionExpr) {
  //         defaultPopupFilterJoins[clickOptions.design.table] = clickOptions.design.adminRegionExpr;
  //       }

  //       // Create filter using popupFilterJoins
  //       const popupFilterJoins = clickOptions.design.popupFilterJoins || defaultPopupFilterJoins;
  //       const popupFilters = PopupFilterJoinsUtils.createPopupFilters(popupFilterJoins, clickOptions.schema, table, ev.data.id, true);

  //       // Add filter for admin region
  //       popupFilters.push({
  //         table: regionsTable,
  //         jsonql: { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "{alias}", column: "_id" }, { type: "literal", value: ev.data.id }]}
  //       });

  //       const BlocksLayoutManager = require('../layouts/blocks/BlocksLayoutManager');
  //       const WidgetFactory = require('../widgets/WidgetFactory');

  //       results.popup = new BlocksLayoutManager().renderLayout({
  //         items: clickOptions.design.popup.items,
  //         style: "popup",
  //         renderWidget: (options: any) => {
  //           const widget = WidgetFactory.createWidget(options.type);

  //           // Create filters for single row
  //           const filters = clickOptions.filters.concat(popupFilters);

  //           // Get data source for widget
  //           const widgetDataSource = clickOptions.layerDataSource.getPopupWidgetDataSource(clickOptions.design, options.id);

  //           return widget.createViewElement({
  //             schema: clickOptions.schema,
  //             dataSource: clickOptions.dataSource,
  //             widgetDataSource,
  //             design: options.design,
  //             scope: null,
  //             filters,
  //             onScopeChange: null,
  //             onDesignChange: null,
  //             width: options.width,
  //             height: options.height,
  //             standardWidth: options.standardWidth
  //           });
  //         }
  //         });
  //     }

  //     return results;
  //   } else {
  //     return null;
  //   }
  // }

  // Get min and max zoom levels
  getMinZoom(design: HexgridLayerDesign) { 
    // Determine if too zoomed out to safely display (zoom 6 at 20000 is limit)
    if (design.sizeUnits === "meters") {
      const minSafeZoom = Math.log2(1280000.0 / (design.size || 1000))
      if (design.minZoom) {
        return Math.max(design.minZoom, minSafeZoom)
      }
      else {
        return minSafeZoom
      }
    }
    return design.minZoom; 
  }
  getMaxZoom(design: HexgridLayerDesign) { return design.maxZoom; }

  /** Get the legend to be optionally displayed on the map. Returns
   * a React element */
  getLegend(design: HexgridLayerDesign, schema: Schema, name: string, dataSource: DataSource, filters: JsonQLFilter[]) {
    const axisBuilder = new AxisBuilder({schema});

    return React.createElement(LayerLegendComponent, {
      schema,
      name,
      dataSource,
      axis: axisBuilder.cleanAxis({axis: design.colorAxis!, table: design.table, types: ['enum', 'text', 'boolean','date'], aggrNeed: "required"})
    })
  }

  // Get a list of table ids that can be filtered on
  getFilterableTables(design: HexgridLayerDesign, schema: Schema): string[] {
    if (design.table) { return [design.table] } else { return [] }
  }

  /** True if layer can be edited */
  isEditable() {
    return true;
  }

  /** Returns a cleaned design */
  cleanDesign(design: HexgridLayerDesign, schema: Schema): HexgridLayerDesign {
    return produce(design, (design) => {
      const exprCleaner = new ExprCleaner(schema)
      const axisBuilder = new AxisBuilder({ schema })
  
      // Default size units
      if (!design.sizeUnits) {
        design.sizeUnits = "pixels"
        design.size = 30
      }

      // Remove extreme sizes
      if (design.size != null && design.size < 10 && design.sizeUnits == "pixels") {
        design.size = 10;
      } 
  
      // Clean geometry (no idea why the cast is needed. TS is giving strange error)
      if (design.geometryExpr) {
        design.geometryExpr = exprCleaner.cleanExpr((design.geometryExpr as Expr), { table: design.table, types: ["geometry"] })
      }
  
      design.fillOpacity = (design.fillOpacity != null) ? design.fillOpacity : 0.75
  
      // Clean the axis
      if (design.colorAxis) {
        design.colorAxis = axisBuilder.cleanAxis({ axis: (design.colorAxis as Axis), table: design.table, types: ['enum', 'text', 'boolean','date'], aggrNeed: "required"})
      }

      // Clean filter
      if (design.table) {
        design.filter = exprCleaner.cleanExpr((design.filter as Expr), { table: design.table })
      }
    })
  }

  /** Validates design. Null if ok, message otherwise */
  validateDesign(design: HexgridLayerDesign, schema: Schema) {
    let error;
    const exprUtils = new ExprUtils(schema)
    const axisBuilder = new AxisBuilder({ schema })

    if (!design.table) {
      return "Missing table";
    }
    if (!design.geometryExpr || (exprUtils.getExprType(design.geometryExpr) !== "geometry")) {
      return "Missing geometry expr";
    }
    if (!design.size || !design.sizeUnits) {
      return "Missing size"
    }
    if (!design.colorAxis) {
      return "Missing color axis";
    }

    error = axisBuilder.validateAxis({ axis: (design.colorAxis as Axis) });
    if (error) { return error; }

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
    design: HexgridLayerDesign
    schema: Schema
    dataSource: DataSource
    onDesignChange: (design: HexgridLayerDesign) => void
    filters: JsonQLFilter[]
  }): React.ReactElement<{}> {
    // Require here to prevent server require problems
    const HexgridLayerDesigner = require('./HexgridLayerDesigner').default;

    // Clean on way in and out
    return React.createElement(HexgridLayerDesigner, {
      schema: options.schema,
      dataSource: options.dataSource,
      design: this.cleanDesign(options.design, options.schema),
      filters: options.filters,
      onDesignChange: (design: HexgridLayerDesign) => {
        return options.onDesignChange(this.cleanDesign(design, options.schema));
      }
    });
  }
}