"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var react_1 = __importDefault(require("react"));
var Layer_1 = __importDefault(require("./Layer"));
var mwater_expressions_1 = require("mwater-expressions");
var AxisBuilder_1 = __importDefault(require("../axes/AxisBuilder"));
var immer_1 = __importDefault(require("immer"));
var LayerLegendComponent = require('./LayerLegendComponent');
var PopupFilterJoinsUtils = require('./PopupFilterJoinsUtils');
/** Layer which is a grid of flat-topped hexagons. Depends on "Hexgrid Functions.sql" having been run */
var HexgridLayer = /** @class */ (function (_super) {
    __extends(HexgridLayer, _super);
    function HexgridLayer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
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
    HexgridLayer.prototype.getJsonQLCss = function (design, schema, filters) {
        // Create design
        var layerDef = {
            layers: [{ id: "layer0", jsonql: this.createJsonQL(design, schema, filters) }],
            css: this.createCss(design, schema, filters),
            interactivity: {
                layer: "layer0",
                fields: ["id", "name"]
            }
        };
        return layerDef;
    };
    HexgridLayer.prototype.createJsonQL = function (design, schema, filters) {
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
        var exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
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
        var compiledGeometryExpr = exprCompiler.compileExpr({ expr: design.geometryExpr, tableAlias: "innerquery" });
        var colorExpr = axisBuilder.compileAxis({ axis: design.colorAxis, tableAlias: "innerquery" });
        var compiledSizeExpr = design.sizeUnits == "pixels" ?
            { type: "op", op: "*", exprs: [{ type: "token", token: "!pixel_width!" }, design.size / 2] }
            : { type: "literal", value: design.size / 2 };
        // Create inner query
        var innerQuery = {
            type: "query",
            selects: [
                { type: "select", expr: { type: "field", tableAlias: "qr", column: "q" }, alias: "q" },
                { type: "select", expr: { type: "field", tableAlias: "qr", column: "r" }, alias: "r" },
                { type: "select", expr: colorExpr, alias: "color" }
            ],
            from: {
                type: "join",
                kind: "inner",
                left: { type: "table", table: design.table, alias: "innerquery" },
                right: { type: "subexpr", expr: { type: "op", op: "mwater_hex_xy_to_qr", exprs: [
                            { type: "op", op: "ST_XMin", exprs: [compiledGeometryExpr] },
                            { type: "op", op: "ST_YMin", exprs: [compiledGeometryExpr] },
                            compiledSizeExpr
                        ] }, alias: "qr" },
                on: { type: "literal", valueType: "boolean", value: true }
            },
            groupBy: [1, 2]
        };
        // Filter by bounding box
        var whereClauses = [
            {
                type: "op",
                op: "&&",
                exprs: [
                    compiledGeometryExpr,
                    { type: "token", token: "!bbox!" }
                ]
            }
        ];
        // Then add filters
        if (design.filter) {
            whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "innerquery" }));
        }
        // Then add extra filters passed in, if relevant
        var relevantFilters = lodash_1.default.where(filters, { table: design.table });
        for (var _i = 0, relevantFilters_1 = relevantFilters; _i < relevantFilters_1.length; _i++) {
            var filter = relevantFilters_1[_i];
            whereClauses.push(mwater_expressions_1.injectTableAlias(filter.jsonql, "innerquery"));
        }
        whereClauses = lodash_1.default.compact(whereClauses);
        if (whereClauses.length > 0) {
            innerQuery.where = { type: "op", op: "and", exprs: whereClauses };
        }
        // Now create outer query
        var query = {
            type: "query",
            selects: [
                { type: "select", expr: { type: "op", op: "mwater_hex_make", exprs: [
                            { type: "field", tableAlias: "grid", column: "q" },
                            { type: "field", tableAlias: "grid", column: "r" },
                            compiledSizeExpr
                        ] }, alias: "the_geom_webmercator" },
                { type: "select", expr: { type: "field", tableAlias: "data", column: "color" }, alias: "color" }
            ],
            from: {
                type: "join",
                kind: "left",
                left: { type: "subexpr", expr: { type: "op", op: "mwater_hex_grid", exprs: [
                            { type: "token", token: "!bbox!" },
                            compiledSizeExpr
                        ] }, alias: "grid" },
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
        };
        return query;
    };
    HexgridLayer.prototype.createCss = function (design, schema, filters) {
        var css = "#layer0 {\n  polygon-opacity: " + design.fillOpacity + ";\n  polygon-fill: transparent;\n}\n";
        if (!design.colorAxis) {
            throw new Error("Color axis not set");
        }
        // If color axes, add color conditions
        if (design.colorAxis.colorMap) {
            var _loop_1 = function (item) {
                // If invisible
                if (design.colorAxis.excludedValues && lodash_1.default.any(design.colorAxis.excludedValues, function (ev) { return ev === item.value; })) {
                    css += "#layer0 [color=" + JSON.stringify(item.value) + "] { polygon-opacity: 0; polygon-fill: transparent; }\n";
                }
                else {
                    css += "#layer0 [color=" + JSON.stringify(item.value) + "] { polygon-fill: " + item.color + "; }\n";
                }
            };
            for (var _i = 0, _a = design.colorAxis.colorMap; _i < _a.length; _i++) {
                var item = _a[_i];
                _loop_1(item);
            }
        }
        return css;
    };
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
    HexgridLayer.prototype.getMinZoom = function (design) {
        // Determine if too zoomed out to safely display (zoom 6 at 20000 is limit)
        if (design.sizeUnits === "meters") {
            var minSafeZoom = Math.log2(1280000.0 / (design.size || 1000));
            if (design.minZoom) {
                return Math.max(design.minZoom, minSafeZoom);
            }
            else {
                return minSafeZoom;
            }
        }
        return design.minZoom;
    };
    HexgridLayer.prototype.getMaxZoom = function (design) { return design.maxZoom; };
    /** Get the legend to be optionally displayed on the map. Returns
     * a React element */
    HexgridLayer.prototype.getLegend = function (design, schema, name, dataSource, filters) {
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
        return react_1.default.createElement(LayerLegendComponent, {
            schema: schema,
            name: name,
            dataSource: dataSource,
            axis: axisBuilder.cleanAxis({ axis: design.colorAxis, table: design.table, types: ['enum', 'text', 'boolean', 'date'], aggrNeed: "required" })
        });
    };
    // Get a list of table ids that can be filtered on
    HexgridLayer.prototype.getFilterableTables = function (design, schema) {
        if (design.table) {
            return [design.table];
        }
        else {
            return [];
        }
    };
    /** True if layer can be edited */
    HexgridLayer.prototype.isEditable = function () {
        return true;
    };
    /** Returns a cleaned design */
    HexgridLayer.prototype.cleanDesign = function (design, schema) {
        return immer_1.default(design, function (design) {
            var exprCleaner = new mwater_expressions_1.ExprCleaner(schema);
            var axisBuilder = new AxisBuilder_1.default({ schema: schema });
            // Default size units
            if (!design.sizeUnits) {
                design.sizeUnits = "pixels";
                design.size = 30;
            }
            // Remove extreme sizes
            if (design.size != null && design.size < 10 && design.sizeUnits == "pixels") {
                design.size = 10;
            }
            // Clean geometry (no idea why the cast is needed. TS is giving strange error)
            if (design.geometryExpr) {
                design.geometryExpr = exprCleaner.cleanExpr(design.geometryExpr, { table: design.table, types: ["geometry"] });
            }
            design.fillOpacity = (design.fillOpacity != null) ? design.fillOpacity : 0.75;
            // Clean the axis
            if (design.colorAxis) {
                design.colorAxis = axisBuilder.cleanAxis({ axis: design.colorAxis, table: design.table, types: ['enum', 'text', 'boolean', 'date'], aggrNeed: "required" });
            }
            // Clean filter
            if (design.table) {
                design.filter = exprCleaner.cleanExpr(design.filter, { table: design.table });
            }
        });
    };
    /** Validates design. Null if ok, message otherwise */
    HexgridLayer.prototype.validateDesign = function (design, schema) {
        var error;
        var exprUtils = new mwater_expressions_1.ExprUtils(schema);
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
        if (!design.table) {
            return "Missing table";
        }
        if (!design.geometryExpr || (exprUtils.getExprType(design.geometryExpr) !== "geometry")) {
            return "Missing geometry expr";
        }
        if (!design.size || !design.sizeUnits) {
            return "Missing size";
        }
        if (!design.colorAxis) {
            return "Missing color axis";
        }
        error = axisBuilder.validateAxis({ axis: design.colorAxis });
        if (error) {
            return error;
        }
        return null;
    };
    // Creates a design element with specified options
    // options:
    //   design: design of layer
    //   schema: schema to use
    //   dataSource: data source to use
    //   onDesignChange: function called when design changes
    //   filters: array of filters
    HexgridLayer.prototype.createDesignerElement = function (options) {
        var _this = this;
        // Require here to prevent server require problems
        var HexgridLayerDesigner = require('./HexgridLayerDesigner').default;
        // Clean on way in and out
        return react_1.default.createElement(HexgridLayerDesigner, {
            schema: options.schema,
            dataSource: options.dataSource,
            design: this.cleanDesign(options.design, options.schema),
            filters: options.filters,
            onDesignChange: function (design) {
                return options.onDesignChange(_this.cleanDesign(design, options.schema));
            }
        });
    };
    return HexgridLayer;
}(Layer_1.default));
exports.default = HexgridLayer;
