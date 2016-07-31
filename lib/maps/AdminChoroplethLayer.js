var AdminChoroplethLayer, AxisBuilder, ExprCleaner, ExprCompiler, ExprUtils, H, Layer, LegendGroup, React, _, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

Layer = require('./Layer');

ExprCompiler = require('mwater-expressions').ExprCompiler;

ExprUtils = require('mwater-expressions').ExprUtils;

injectTableAlias = require('mwater-expressions').injectTableAlias;

ExprCleaner = require('mwater-expressions').ExprCleaner;

ExprUtils = require('mwater-expressions').ExprUtils;

AxisBuilder = require('../axes/AxisBuilder');

LegendGroup = require('./LegendGroup');


/*
Layer that is composed of administrative regions colored
Design is:
  scope: _id of overall admin region. Null for whole world.
  detailLevel: admin level to disaggregate to 

  table: table to get data from
  adminRegionExpr: expression to get admin region id for calculations

  axes: axes (see below)

  filter: optional logical expression to filter by
  color: default color (e.g. #FF8800). Color axis overrides
  fillOpacity: opacity of fill of regions (0-1)

  displayNames: true to display name labels on admin regions

axes:
  color: color axis 
  label: overrides the nameLabels to display text on each region
 */

module.exports = AdminChoroplethLayer = (function(superClass) {
  extend(AdminChoroplethLayer, superClass);

  function AdminChoroplethLayer() {
    return AdminChoroplethLayer.__super__.constructor.apply(this, arguments);
  }

  AdminChoroplethLayer.prototype.getJsonQLCss = function(design, schema, filters) {
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

  AdminChoroplethLayer.prototype.createJsonQL = function(design, schema, filters) {
    var axisBuilder, colorExpr, compiledAdminRegionExpr, createScalar, exprCompiler, labelExpr, query, selects, wheres;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    exprCompiler = new ExprCompiler(schema);

    /*
    E.g.:
    select admin_regions._id, shape_simplified, 
      (select count(wp.*) as cnt from 
      admin_region_subtrees 
      inner join entities.water_point as wp on wp.admin_region = admin_region_subtrees.descendant
      where admin_region_subtrees.ancestor = admin_regions._id) as color
    
    from admin_regions 
    where shape && !bbox! and  path ->> 0 = 'eb3e12a2-de1e-49a9-8afd-966eb55d47eb' and level = 1
     */
    compiledAdminRegionExpr = exprCompiler.compileExpr({
      expr: design.adminRegionExpr,
      tableAlias: "innerquery"
    });
    selects = [
      {
        type: "select",
        expr: {
          type: "field",
          tableAlias: "admin_regions",
          column: "_id"
        },
        alias: "id"
      }, {
        type: "select",
        expr: {
          type: "field",
          tableAlias: "admin_regions",
          column: "shape_simplified"
        },
        alias: "the_geom_webmercator"
      }, {
        type: "select",
        expr: {
          type: "field",
          tableAlias: "admin_regions",
          column: "name"
        },
        alias: "name"
      }
    ];
    createScalar = (function(_this) {
      return function(expr) {
        var filter, i, len, relevantFilters, whereClauses;
        whereClauses = [
          {
            type: "op",
            op: "=",
            exprs: [
              {
                type: "field",
                tableAlias: "admin_region_subtrees",
                column: "ancestor"
              }, {
                type: "field",
                tableAlias: "admin_regions",
                column: "_id"
              }
            ]
          }
        ];
        if (design.filter) {
          whereClauses.push(exprCompiler.compileExpr({
            expr: design.filter,
            tableAlias: "innerquery"
          }));
        }
        relevantFilters = _.where(filters, {
          table: design.table
        });
        for (i = 0, len = relevantFilters.length; i < len; i++) {
          filter = relevantFilters[i];
          whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"));
        }
        whereClauses = _.compact(whereClauses);
        return {
          type: "scalar",
          expr: colorExpr,
          from: {
            type: "join",
            left: exprCompiler.compileTable(design.table, "innerquery"),
            right: {
              type: "table",
              table: "admin_region_subtrees",
              alias: "admin_region_subtrees"
            },
            kind: "inner",
            on: {
              type: "op",
              op: "=",
              exprs: [
                compiledAdminRegionExpr, {
                  type: "field",
                  tableAlias: "admin_region_subtrees",
                  column: "descendant"
                }
              ]
            }
          },
          where: {
            type: "op",
            op: "and",
            exprs: whereClauses
          }
        };
      };
    })(this);
    if (design.axes.color) {
      colorExpr = axisBuilder.compileAxis({
        axis: design.axes.color,
        tableAlias: "innerquery"
      });
      selects.push({
        type: "select",
        expr: createScalar(colorExpr),
        alias: "color"
      });
    }
    if (design.axes.label) {
      labelExpr = axisBuilder.compileAxis({
        axis: design.axes.label,
        tableAlias: "innerquery"
      });
      selects.push({
        type: "select",
        expr: createScalar(labelExpr),
        alias: "label"
      });
    }
    wheres = [
      {
        type: "op",
        op: "&&",
        exprs: [
          {
            type: "field",
            tableAlias: "admin_regions",
            column: "shape"
          }, {
            type: "token",
            token: "!bbox!"
          }
        ]
      }
    ];
    if (design.scope) {
      wheres.push({
        type: "op",
        op: "=",
        exprs: [
          {
            type: "op",
            op: "->>",
            exprs: [
              {
                type: "field",
                tableAlias: "admin_regions",
                column: "path"
              }, 0
            ]
          }, design.scope
        ]
      });
    }
    wheres.push({
      type: "op",
      op: "=",
      exprs: [
        {
          type: "field",
          tableAlias: "admin_regions",
          column: "level"
        }, design.detailLevel
      ]
    });
    query = {
      type: "query",
      selects: selects,
      from: {
        type: "table",
        table: "admin_regions",
        alias: "admin_regions"
      },
      where: {
        type: "op",
        op: "and",
        exprs: wheres
      }
    };
    return query;
  };

  AdminChoroplethLayer.prototype.createCss = function(design, schema, filters) {
    var css, i, item, len, ref;
    css = '#layer0 {\n  line-color: #000;\n  line-width: 1.5;\n  line-opacity: 0.6;\n  polygon-opacity: ' + design.fillOpacity + ';\npolygon-fill: ' + (design.color || "transparent") + ';\n}\n';
    if (design.displayNames) {
      css += '#layer0::labels {\n  text-name: [name];\n  text-face-name: \'Arial Regular\'; \n  text-halo-radius: 2;\n  text-halo-opacity: 0.5;\n  text-halo-fill: #FFF;\n}';
    }
    if (design.axes.color && design.axes.color.colorMap) {
      ref = design.axes.color.colorMap;
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        css += "#layer0 [color=" + (JSON.stringify(item.value)) + "] { polygon-fill: " + item.color + "; opacity: " + design.fillOpacity + "; }\n";
      }
    }
    return css;
  };

  AdminChoroplethLayer.prototype.onGridClick = function(ev, options) {
    return null;
  };

  AdminChoroplethLayer.prototype.getMinZoom = function(design) {
    return null;
  };

  AdminChoroplethLayer.prototype.getMaxZoom = function(design) {
    return null;
  };

  AdminChoroplethLayer.prototype.getLegend = function(design, schema, name) {
    var colors, enums, exprUtils, layerTitleStyle;
    exprUtils = new ExprUtils(schema);
    if (design.axes.color && design.axes.color.colorMap) {
      enums = exprUtils.getExprEnumValues(design.axes.color.expr);
      colors = _.map(design.axes.color.colorMap, (function(_this) {
        return function(colorItem) {
          return {
            color: colorItem.color,
            name: ExprUtils.localizeString(_.find(enums, {
              id: colorItem.value
            }).name)
          };
        };
      })(this));
      colors.push({
        color: design.color,
        name: "None"
      });
    } else {
      colors = [
        {
          color: design.color,
          name: "None"
        }
      ];
    }
    layerTitleStyle = {
      margin: 2,
      fontWeight: 'bold',
      borderBottom: '1px solid #cecece'
    };
    return H.div(null, H.p({
      style: layerTitleStyle
    }, name), React.createElement(LegendGroup, {
      items: colors,
      key: design.adminRegionExpr.expr.table
    }));
  };

  AdminChoroplethLayer.prototype.getFilterableTables = function(design, schema) {
    return [design.table];
  };

  AdminChoroplethLayer.prototype.isEditable = function(design, schema) {
    return true;
  };

  AdminChoroplethLayer.prototype.cleanDesign = function(design, schema) {
    var axisBuilder, exprCleaner;
    exprCleaner = new ExprCleaner(schema);
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    design = _.cloneDeep(design);
    design.color = design.color || "#FFFFFF";
    design.adminRegionExpr = exprCleaner.cleanExpr(design.adminRegionExpr, {
      table: design.table,
      types: ["id"],
      idTable: "admin_regions"
    });
    design.axes = design.axes || {};
    design.fillOpacity = design.fillOpacity != null ? design.fillOpacity : 0.75;
    design.displayNames = design.displayNames != null ? design.displayNames : true;
    design.axes.color = axisBuilder.cleanAxis({
      axis: design.axes.color,
      table: design.table,
      types: ['enum', 'text', 'boolean'],
      aggrNeed: "required"
    });
    design.axes.label = axisBuilder.cleanAxis({
      axis: design.axes.label,
      table: design.table,
      types: ['text', 'number'],
      aggrNeed: "required"
    });
    design.filter = exprCleaner.cleanExpr(design.filter, {
      table: design.table
    });
    return design;
  };

  AdminChoroplethLayer.prototype.validateDesign = function(design, schema) {
    var axisBuilder, error, exprUtils;
    exprUtils = new ExprUtils(schema);
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    if (!design.table) {
      return "Missing table";
    }
    if (design.detailLevel == null) {
      return "Missing detail level";
    }
    if (!design.adminRegionExpr || exprUtils.getExprType(design.adminRegionExpr) !== "id") {
      return "Missing admin region expr";
    }
    if (design.axes.color) {
      error = axisBuilder.validateAxis({
        axis: design.axes.color
      });
      if (error) {
        return error;
      }
    }
    if (design.axes.label) {
      error = axisBuilder.validateAxis({
        axis: design.axes.label
      });
      if (error) {
        return error;
      }
    }
    return null;
  };

  AdminChoroplethLayer.prototype.createDesignerElement = function(options) {
    var AdminChoroplethLayerDesigner;
    AdminChoroplethLayerDesigner = require('./AdminChoroplethLayerDesigner');
    return React.createElement(AdminChoroplethLayerDesigner, {
      schema: options.schema,
      dataSource: options.dataSource,
      design: this.cleanDesign(options.design, options.schema),
      onDesignChange: (function(_this) {
        return function(design) {
          return options.onDesignChange(_this.cleanDesign(design, options.schema));
        };
      })(this)
    });
  };

  AdminChoroplethLayer.prototype.createKMLExportJsonQL = function(design, schema, filters) {
    var adminGeometry, axisBuilder, colorExpr, compiledAdminRegionExpr, createScalar, exprCompiler, labelExpr, query, selects, wheres;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    exprCompiler = new ExprCompiler(schema);

    /*
    E.g.:
    select admin_regions._id, shape_simplified, 
      (select count(wp.*) as cnt from 
      admin_region_subtrees 
      inner join entities.water_point as wp on wp.admin_region = admin_region_subtrees.descendant
      where admin_region_subtrees.ancestor = admin_regions._id) as color
    
    from admin_regions 
    where shape && !bbox! and  path ->> 0 = 'eb3e12a2-de1e-49a9-8afd-966eb55d47eb' and level = 1
     */
    compiledAdminRegionExpr = exprCompiler.compileExpr({
      expr: design.adminRegionExpr,
      tableAlias: "innerquery"
    });
    adminGeometry = {
      type: "op",
      op: "ST_AsGeoJson",
      exprs: [
        {
          type: "op",
          op: "ST_Transform",
          exprs: [
            {
              type: "field",
              tableAlias: "admin_regions",
              column: "shape_simplified"
            }, 4326
          ]
        }
      ]
    };
    selects = [
      {
        type: "select",
        expr: {
          type: "field",
          tableAlias: "admin_regions",
          column: "_id"
        },
        alias: "id"
      }, {
        type: "select",
        expr: adminGeometry,
        alias: "the_geom_webmercator"
      }, {
        type: "select",
        expr: {
          type: "field",
          tableAlias: "admin_regions",
          column: "name"
        },
        alias: "name"
      }
    ];
    createScalar = (function(_this) {
      return function(expr) {
        var filter, i, len, relevantFilters, whereClauses;
        whereClauses = [
          {
            type: "op",
            op: "=",
            exprs: [
              {
                type: "field",
                tableAlias: "admin_region_subtrees",
                column: "ancestor"
              }, {
                type: "field",
                tableAlias: "admin_regions",
                column: "_id"
              }
            ]
          }
        ];
        if (design.filter) {
          whereClauses.push(exprCompiler.compileExpr({
            expr: design.filter,
            tableAlias: "innerquery"
          }));
        }
        relevantFilters = _.where(filters, {
          table: design.table
        });
        for (i = 0, len = relevantFilters.length; i < len; i++) {
          filter = relevantFilters[i];
          whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"));
        }
        whereClauses = _.compact(whereClauses);
        return {
          type: "scalar",
          expr: colorExpr,
          from: {
            type: "join",
            left: exprCompiler.compileTable(design.table, "innerquery"),
            right: {
              type: "table",
              table: "admin_region_subtrees",
              alias: "admin_region_subtrees"
            },
            kind: "inner",
            on: {
              type: "op",
              op: "=",
              exprs: [
                compiledAdminRegionExpr, {
                  type: "field",
                  tableAlias: "admin_region_subtrees",
                  column: "descendant"
                }
              ]
            }
          },
          where: {
            type: "op",
            op: "and",
            exprs: whereClauses
          }
        };
      };
    })(this);
    if (design.axes.color) {
      colorExpr = axisBuilder.compileAxis({
        axis: design.axes.color,
        tableAlias: "innerquery"
      });
      selects.push({
        type: "select",
        expr: createScalar(colorExpr),
        alias: "color"
      });
    }
    if (design.axes.label) {
      labelExpr = axisBuilder.compileAxis({
        axis: design.axes.label,
        tableAlias: "innerquery"
      });
      selects.push({
        type: "select",
        expr: createScalar(labelExpr),
        alias: "label"
      });
    }
    wheres = [];
    if (design.scope) {
      wheres.push({
        type: "op",
        op: "=",
        exprs: [
          {
            type: "op",
            op: "->>",
            exprs: [
              {
                type: "field",
                tableAlias: "admin_regions",
                column: "path"
              }, 0
            ]
          }, design.scope
        ]
      });
    }
    wheres.push({
      type: "op",
      op: "=",
      exprs: [
        {
          type: "field",
          tableAlias: "admin_regions",
          column: "level"
        }, design.detailLevel
      ]
    });
    query = {
      type: "query",
      selects: selects,
      from: {
        type: "table",
        table: "admin_regions",
        alias: "admin_regions"
      },
      where: {
        type: "op",
        op: "and",
        exprs: wheres
      }
    };
    return query;
  };

  AdminChoroplethLayer.prototype.getKMLExportJsonQL = function(design, schema, filters) {
    var layerDef, style;
    style = {
      color: design.color,
      opacity: design.fillOpacity
    };
    if (design.axes.color && design.axes.color.colorMap) {
      style.colorMap = design.axes.color.colorMap;
    }
    layerDef = {
      layers: [
        {
          id: "layer0",
          jsonql: this.createKMLExportJsonQL(design, schema, filters),
          style: style
        }
      ]
    };
    return layerDef;
  };

  AdminChoroplethLayer.prototype.acceptKmlVisitorForRow = function(visitor, row) {
    var data, list, outer;
    if (!row.the_geom_webmercator) {
      return;
    }
    if (row.the_geom_webmercator.length === 0) {
      return;
    }
    data = JSON.parse(row.the_geom_webmercator);
    if (data.coordinates.length === 0) {
      return;
    }
    if (data.type === "MultiPolygon") {
      outer = data.coordinates[0][0];
    } else {
      outer = data.coordinates[0];
    }
    list = _.map(outer, function(coordinates) {
      return coordinates.join(",");
    });
    return visitor.addPolygon(list.join(" "), row.color, data.type === "MultiPolygon");
  };

  return AdminChoroplethLayer;

})(Layer);
