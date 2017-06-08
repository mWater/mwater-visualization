var AxisBuilder, ClusterLayer, ExprCleaner, ExprCompiler, ExprUtils, H, Layer, LayerLegendComponent, LegendGroup, React, _, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

Layer = require('./Layer');

ExprCompiler = require('mwater-expressions').ExprCompiler;

injectTableAlias = require('mwater-expressions').injectTableAlias;

ExprCleaner = require('mwater-expressions').ExprCleaner;

ExprUtils = require('mwater-expressions').ExprUtils;

AxisBuilder = require('../axes/AxisBuilder');

LegendGroup = require('./LegendGroup');

LayerLegendComponent = require('./LayerLegendComponent');


/*
Layer which clusters markers, counting them

Design is:
  table: table to get data from
  axes: axes (see below)
  filter: optional logical expression to filter by
  textColor: color of text. default #FFFFFF
  fillColor: color of markers that text is drawn on. default #337ab7
  minZoom: minimum zoom level
  maxZoom: maximum zoom level

axes:
  geometry: locations to cluster
 */

module.exports = ClusterLayer = (function(superClass) {
  extend(ClusterLayer, superClass);

  function ClusterLayer() {
    return ClusterLayer.__super__.constructor.apply(this, arguments);
  }

  ClusterLayer.prototype.getJsonQLCss = function(design, schema, filters) {
    var layerDef;
    layerDef = {
      layers: [
        {
          id: "layer0",
          jsonql: this.createJsonQL(design, schema, filters)
        }
      ],
      css: this.createCss(design, schema, filters)
    };
    return layerDef;
  };

  ClusterLayer.prototype.createJsonQL = function(design, schema, filters) {
    var axisBuilder, centerExpr, clustExpr, cntExpr, exprCompiler, filter, geometryExpr, gridExpr, i, inner2Query, innerQuery, len, query, relevantFilters, sizeExpr, whereClauses;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    exprCompiler = new ExprCompiler(schema);

    /*
    Query:
      Works by first snapping to grid and then clustering the clusters with slower DBSCAN method
    
      select 
        ST_Centroid(ST_Collect(center)) as the_geom_webmercator,
        sum(cnt) as cnt, 
        log(sum(cnt)) * 6 + 14 as size from 
          (
            select 
            ST_ClusterDBSCAN(center, (!pixel_width!*30 + !pixel_height!*30)/2, 1) over () as clust,
            sub1.center as center,
            cnt as cnt
            from
            (
              select 
              count(*) as cnt, 
              ST_Centroid(ST_Collect(<geometry axis>)) as center, 
              ST_Snaptogrid(<geometry axis>, !pixel_width!*40, !pixel_height!*40) as grid
              from <table> as main
              where <geometry axis> && !bbox! 
                and <geometry axis> is not null
                and <other filters>
              group by 3
            ) as sub1
          ) as sub2 
        group by sub2.clust
     */
    geometryExpr = axisBuilder.compileAxis({
      axis: design.axes.geometry,
      tableAlias: "main"
    });
    geometryExpr = {
      type: "op",
      op: "ST_Transform",
      exprs: [geometryExpr, 3857]
    };
    centerExpr = {
      type: "op",
      op: "ST_Centroid",
      exprs: [
        {
          type: "op",
          op: "ST_Collect",
          exprs: [geometryExpr]
        }
      ]
    };
    gridExpr = {
      type: "op",
      op: "ST_Snaptogrid",
      exprs: [
        geometryExpr, {
          type: "op",
          op: "*",
          exprs: [
            {
              type: "token",
              token: "!pixel_width!"
            }, 40
          ]
        }, {
          type: "op",
          op: "*",
          exprs: [
            {
              type: "token",
              token: "!pixel_width!"
            }, 40
          ]
        }
      ]
    };
    innerQuery = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: {
            type: "op",
            op: "count",
            exprs: []
          },
          alias: "cnt"
        }, {
          type: "select",
          expr: centerExpr,
          alias: "center"
        }, {
          type: "select",
          expr: gridExpr,
          alias: "grid"
        }
      ],
      from: exprCompiler.compileTable(design.table, "main"),
      groupBy: [3]
    };
    whereClauses = [
      {
        type: "op",
        op: "&&",
        exprs: [
          geometryExpr, {
            type: "token",
            token: "!bbox!"
          }
        ]
      }
    ];
    if (design.filter) {
      whereClauses.push(exprCompiler.compileExpr({
        expr: design.filter,
        tableAlias: "main"
      }));
    }
    relevantFilters = _.where(filters, {
      table: design.table
    });
    for (i = 0, len = relevantFilters.length; i < len; i++) {
      filter = relevantFilters[i];
      whereClauses.push(injectTableAlias(filter.jsonql, "main"));
    }
    whereClauses = _.compact(whereClauses);
    if (whereClauses.length > 1) {
      innerQuery.where = {
        type: "op",
        op: "and",
        exprs: whereClauses
      };
    } else {
      innerQuery.where = whereClauses[0];
    }
    clustExpr = {
      type: "op",
      op: "ST_ClusterDBSCAN",
      exprs: [
        {
          type: "field",
          tableAlias: "innerquery",
          column: "center"
        }, {
          type: "op",
          op: "/",
          exprs: [
            {
              type: "op",
              op: "+",
              exprs: [
                {
                  type: "op",
                  op: "*",
                  exprs: [
                    {
                      type: "token",
                      token: "!pixel_width!"
                    }, 30
                  ]
                }, {
                  type: "op",
                  op: "*",
                  exprs: [
                    {
                      type: "token",
                      token: "!pixel_height!"
                    }, 30
                  ]
                }
              ]
            }, 2
          ]
        }, 1
      ]
    };
    inner2Query = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: clustExpr,
          over: {},
          alias: "clust"
        }, {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "innerquery",
            column: "center"
          },
          alias: "center"
        }, {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "innerquery",
            column: "cnt"
          },
          alias: "cnt"
        }
      ],
      from: {
        type: "subquery",
        query: innerQuery,
        alias: "innerquery"
      }
    };
    centerExpr = {
      type: "op",
      op: "ST_Centroid",
      exprs: [
        {
          type: "op",
          op: "ST_Collect",
          exprs: [
            {
              type: "field",
              tableAlias: "inner2query",
              column: "center"
            }
          ]
        }
      ]
    };
    cntExpr = {
      type: "op",
      op: "sum",
      exprs: [
        {
          type: "field",
          tableAlias: "inner2query",
          column: "cnt"
        }
      ]
    };
    sizeExpr = {
      type: "op",
      op: "+",
      exprs: [
        {
          type: "op",
          op: "*",
          exprs: [
            {
              type: "op",
              op: "log",
              exprs: [cntExpr]
            }, 6
          ]
        }, 14
      ]
    };
    query = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: centerExpr,
          alias: "the_geom_webmercator"
        }, {
          type: "select",
          expr: cntExpr,
          alias: "cnt"
        }, {
          type: "select",
          expr: sizeExpr,
          alias: "size"
        }
      ],
      from: {
        type: "subquery",
        query: inner2Query,
        alias: "inner2query"
      },
      groupBy: [
        {
          type: "field",
          tableAlias: "inner2query",
          column: "clust"
        }
      ]
    };
    return query;
  };

  ClusterLayer.prototype.createCss = function(design, schema) {
    var css;
    css = '#layer0 [cnt>1] {\n  marker-width: [size];\n  marker-line-color: white;\n  marker-line-width: 4;\n  marker-line-opacity: 0.6;\n  marker-placement: point;\n  marker-type: ellipse;\n  marker-allow-overlap: true;\n  marker-fill: ' + (design.fillColor || "#337ab7") + ';\n}\n\n#layer0::l1 [cnt>1] { \n  text-name: [cnt];\n  text-face-name: \'Arial Bold\';\n  text-allow-overlap: true;\n  text-fill: ' + (design.textColor || "white") + ';\n}\n\n#layer0 [cnt=1] {\n  marker-width: 10;\n  marker-line-color: white;\n  marker-line-width: 2;\n  marker-line-opacity: 0.6;\n  marker-placement: point;\n  marker-type: ellipse;\n  marker-allow-overlap: true;\n  marker-fill: ' + (design.fillColor || "#337ab7") + ';\n}';
    return css;
  };

  ClusterLayer.prototype.getBounds = function(design, schema, dataSource, filters, callback) {
    return this.getBoundsFromExpr(schema, dataSource, design.table, design.axes.geometry.expr, design.filter, filters, callback);
  };

  ClusterLayer.prototype.getMinZoom = function(design) {
    return design.minZoom;
  };

  ClusterLayer.prototype.getMaxZoom = function(design) {
    return design.maxZoom;
  };

  ClusterLayer.prototype.getLegend = function(design, schema, name) {
    var axisBuilder;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    return React.createElement(LayerLegendComponent, {
      schema: schema,
      defaultColor: design.fillColor || "#337ab7",
      symbol: 'font-awesome/circle',
      name: name
    });
  };

  ClusterLayer.prototype.getFilterableTables = function(design, schema) {
    if (design.table) {
      return [design.table];
    } else {
      return [];
    }
  };

  ClusterLayer.prototype.isEditable = function() {
    return true;
  };

  ClusterLayer.prototype.isIncomplete = function(design, schema) {
    return this.validateDesign(design, schema) != null;
  };

  ClusterLayer.prototype.createDesignerElement = function(options) {
    var ClusterLayerDesignerComponent;
    ClusterLayerDesignerComponent = require('./ClusterLayerDesignerComponent');
    return React.createElement(ClusterLayerDesignerComponent, {
      schema: options.schema,
      dataSource: options.dataSource,
      design: this.cleanDesign(options.design, options.schema),
      filters: options.filters,
      onDesignChange: (function(_this) {
        return function(design) {
          return options.onDesignChange(_this.cleanDesign(design, options.schema));
        };
      })(this)
    });
  };

  ClusterLayer.prototype.cleanDesign = function(design, schema) {
    var axisBuilder, exprCleaner;
    exprCleaner = new ExprCleaner(schema);
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    design = _.cloneDeep(design);
    design.textColor = design.textColor || "white";
    design.fillColor = design.fillColor || "#337ab7";
    design.axes = design.axes || {};
    design.axes.geometry = axisBuilder.cleanAxis({
      axis: design.axes.geometry,
      table: design.table,
      types: ['geometry'],
      aggrNeed: "none"
    });
    design.filter = exprCleaner.cleanExpr(design.filter, {
      table: design.table
    });
    return design;
  };

  ClusterLayer.prototype.validateDesign = function(design, schema) {
    var axisBuilder, error;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    if (!design.table) {
      return "Missing table";
    }
    if (!design.axes || !design.axes.geometry) {
      return "Missing axes";
    }
    error = axisBuilder.validateAxis({
      axis: design.axes.geometry
    });
    if (error) {
      return error;
    }
    return null;
  };

  return ClusterLayer;

})(Layer);
