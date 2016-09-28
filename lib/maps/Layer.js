var AxisBuilder, ExprCompiler, Layer, _, injectTableAlias;

_ = require('lodash');

AxisBuilder = require('../axes/AxisBuilder');

ExprCompiler = require('mwater-expressions').ExprCompiler;

injectTableAlias = require('mwater-expressions').injectTableAlias;

module.exports = Layer = (function() {
  function Layer() {}

  Layer.prototype.getJsonQLCss = function(design, schema, filters) {
    throw new Error("Not implemented");
  };

  Layer.prototype.onGridClick = function(ev, options) {
    return null;
  };

  Layer.prototype.getBounds = function(design, schema, dataSource, filters, callback) {
    return callback(null);
  };

  Layer.prototype.getMinZoom = function(design) {
    return null;
  };

  Layer.prototype.getMaxZoom = function(design) {
    return null;
  };

  Layer.prototype.getLegend = function(design, schema, name) {
    return null;
  };

  Layer.prototype.getFilterableTables = function(design, schema) {
    return [];
  };

  Layer.prototype.isEditable = function() {
    return false;
  };

  Layer.prototype.isIncomplete = function(design, schema) {
    return this.validateDesign(this.cleanDesign(design, schema), schema) != null;
  };

  Layer.prototype.createDesignerElement = function(options) {
    throw new Error("Not implemented");
  };

  Layer.prototype.cleanDesign = function(design, schema) {
    return design;
  };

  Layer.prototype.validateDesign = function(design, schema) {
    return null;
  };

  Layer.prototype.getKMLExportJsonQL = function(design, schema, filters) {
    throw new Error("Not implemented");
  };

  Layer.prototype.getBoundsFromExpr = function(schema, dataSource, table, geometryExpr, filterExpr, filters, callback) {
    var boundsQuery, compiledGeometryExpr, exprCompiler, where;
    exprCompiler = new ExprCompiler(schema);
    compiledGeometryExpr = exprCompiler.compileExpr({
      expr: geometryExpr,
      tableAlias: "main"
    });
    where = {
      type: "op",
      op: "and",
      exprs: _.pluck(_.where(filters, {
        table: table
      }), "jsonql")
    };
    if (filterExpr) {
      where.exprs.push(exprCompiler.compileExpr({
        expr: filterExpr,
        tableAlias: "main"
      }));
    }
    where.exprs = _.compact(where.exprs);
    where = injectTableAlias(where, "main");
    boundsQuery = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: {
            type: "op",
            op: "::json",
            exprs: [
              {
                type: "op",
                op: "ST_AsGeoJSON",
                exprs: [
                  {
                    type: "op",
                    op: "ST_SetSRID",
                    exprs: [
                      {
                        type: "op",
                        op: "ST_Extent",
                        exprs: [
                          {
                            type: "op",
                            op: "ST_Transform",
                            exprs: [compiledGeometryExpr, 4326]
                          }
                        ]
                      }, 4326
                    ]
                  }
                ]
              }
            ]
          },
          alias: "bounds"
        }
      ],
      from: {
        type: "table",
        table: table,
        alias: "main"
      },
      where: where
    };
    return dataSource.performQuery(boundsQuery, (function(_this) {
      return function(err, results) {
        var bounds;
        if (err) {
          return callback(err);
        } else {
          if (results[0].bounds) {
            if (results[0].bounds.type === "Point") {
              bounds = {
                w: results[0].bounds.coordinates[0] - 0.1,
                s: results[0].bounds.coordinates[1] - 0.1,
                e: results[0].bounds.coordinates[0] + 0.1,
                n: results[0].bounds.coordinates[1] + 0.1
              };
            } else {
              bounds = {
                w: results[0].bounds.coordinates[0][0][0] - 0.001,
                s: results[0].bounds.coordinates[0][0][1] - 0.001,
                e: results[0].bounds.coordinates[0][2][0] + 0.001,
                n: results[0].bounds.coordinates[0][2][1] + 0.001
              };
            }
          } else {
            bounds = {
              w: -165.9375,
              n: 76.9206135182968,
              e: 38.67187499999999,
              s: -62.431074232920906
            };
          }
          return callback(null, bounds);
        }
      };
    })(this));
  };

  return Layer;

})();
