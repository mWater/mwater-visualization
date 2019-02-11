"use strict";

var ExprCleaner, ExprCompiler, ExprUtils, LayerFactory, _;

_ = require('lodash');
LayerFactory = require('./LayerFactory');
ExprCompiler = require('mwater-expressions').ExprCompiler;
ExprCleaner = require('mwater-expressions').ExprCleaner;
ExprUtils = require('mwater-expressions').ExprUtils; // General utilities for a map
// Check if can convert to a cluster map. Only maps containing marker views can be

exports.canConvertToClusterMap = function (design) {
  return _.any(design.layerViews, function (lv) {
    return lv.type === "Markers";
  });
}; // Convert to a cluster map


exports.convertToClusterMap = function (design) {
  var layerViews;
  layerViews = _.map(design.layerViews, function (lv) {
    var ref;

    if (lv.type !== "Markers") {
      return lv;
    }

    lv = _.cloneDeep(lv); // Set type and design

    lv.type = "Cluster";
    lv.design = {
      table: lv.design.table,
      axes: {
        geometry: (ref = lv.design.axes) != null ? ref.geometry : void 0
      },
      filter: lv.design.filter,
      fillColor: lv.design.color,
      minZoom: lv.design.minZoom,
      maxZoom: lv.design.maxZoom
    };
    return lv;
  });
  return _.extend({}, design, {
    layerViews: layerViews
  });
}; // Get ids of filterable tables


exports.getFilterableTables = function (design, schema) {
  var filterableTables, i, layer, layerView, len, ref;
  filterableTables = [];
  ref = design.layerViews;

  for (i = 0, len = ref.length; i < len; i++) {
    layerView = ref[i]; // Create layer

    layer = LayerFactory.createLayer(layerView.type); // Get filterable tables

    filterableTables = _.uniq(filterableTables.concat(layer.getFilterableTables(layerView.design, schema)));
  } // Remove non-existant tables


  return filterableTables = _.filter(filterableTables, function (table) {
    return schema.getTable(table);
  });
}; // Compile map filters with global filters


exports.getCompiledFilters = function (design, schema, filterableTables) {
  var column, columnExpr, compiledFilters, expr, exprCleaner, exprCompiler, exprUtils, filter, i, j, jsonql, len, len1, ref, ref1, table;
  exprCompiler = new ExprCompiler(schema);
  exprCleaner = new ExprCleaner(schema);
  exprUtils = new ExprUtils(schema);
  compiledFilters = [];
  ref = design.filters || {}; // Compile filters to JsonQL expected by layers

  for (table in ref) {
    expr = ref[table];
    jsonql = exprCompiler.compileExpr({
      expr: expr,
      tableAlias: "{alias}"
    });

    if (jsonql) {
      compiledFilters.push({
        table: table,
        jsonql: jsonql
      });
    }
  }

  ref1 = design.globalFilters || []; // Add global filters

  for (i = 0, len = ref1.length; i < len; i++) {
    filter = ref1[i];

    for (j = 0, len1 = filterableTables.length; j < len1; j++) {
      table = filterableTables[j]; // Check if exists and is correct type

      column = schema.getColumn(table, filter.columnId);

      if (!column) {
        continue;
      }

      columnExpr = {
        type: "field",
        table: table,
        column: column.id
      };

      if (exprUtils.getExprType(columnExpr) !== filter.columnType) {
        continue;
      } // Create expr


      expr = {
        type: "op",
        op: filter.op,
        table: table,
        exprs: [columnExpr].concat(filter.exprs)
      }; // Clean expr

      expr = exprCleaner.cleanExpr(expr, {
        table: table
      });
      jsonql = exprCompiler.compileExpr({
        expr: expr,
        tableAlias: "{alias}"
      });

      if (jsonql) {
        compiledFilters.push({
          table: table,
          jsonql: jsonql
        });
      }
    }
  }

  return compiledFilters;
};