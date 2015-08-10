var ExpressionCompiler, Layer, LegacyLayer,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Layer = require('./Layer');

ExpressionCompiler = require('../expressions/ExpressionCompiler');

module.exports = LegacyLayer = (function(superClass) {
  extend(LegacyLayer, superClass);

  function LegacyLayer(design, schema, client) {
    this.compileExpr = bind(this.compileExpr, this);
    this.design = design;
    this.schema = schema;
    this.client = client;
  }

  LegacyLayer.prototype.getTileUrl = function(filters) {
    return this.createUrl("png", filters);
  };

  LegacyLayer.prototype.getUtfGridUrl = function(filters) {
    return this.createUrl("grid.json", filters);
  };

  LegacyLayer.prototype.createUrl = function(extension, filters) {
    var relevantFilters, url, where, whereClauses;
    url = "https://api.mwater.co/v3/maps/tiles/{z}/{x}/{y}." + extension + "?type=" + this.design.type + "&radius=1000";
    if (this.client) {
      url += "&client=" + this.client;
    }
    relevantFilters = _.where(filters, {
      table: "entities.water_point"
    });
    whereClauses = _.map(relevantFilters, this.compileExpr);
    if (whereClauses.length > 1) {
      where = {
        type: "op",
        op: "and",
        exprs: whereClauses
      };
    } else {
      where = whereClauses[0];
    }
    if (where) {
      url += "&where=" + encodeURIComponent(JSON.stringify(where));
    }
    return url;
  };

  LegacyLayer.prototype.compileExpr = function(expr) {
    return new ExpressionCompiler(this.schema).compileExpr({
      expr: expr,
      tableAlias: "main"
    });
  };

  LegacyLayer.prototype.getFilterableTables = function() {
    return ['entities.water_point'];
  };

  return LegacyLayer;

})(Layer);
