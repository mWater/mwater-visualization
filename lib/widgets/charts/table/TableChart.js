var AxisBuilder, Chart, ExprCompiler, ExprUtils, H, React, TableChart, TableChartUtils, TableChartViewComponent, _, injectTableAlias, uuid,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

uuid = require('uuid');

injectTableAlias = require('mwater-expressions').injectTableAlias;

Chart = require('../Chart');

ExprUtils = require('mwater-expressions').ExprUtils;

ExprCompiler = require('mwater-expressions').ExprCompiler;

AxisBuilder = require('../../../axes/AxisBuilder');

TableChartViewComponent = require('./TableChartViewComponent');

TableChartUtils = require('./TableChartUtils');


/*
Design is:

  table: table to use for data source
  titleText: title text
  columns: array of columns
  filter: optional logical expression to filter by
  orderings: array of orderings
  version: 2
  multiselect: true to allow multiple selections

  clickAction: null/"scope"/"popup"/"system:<actionid>"  what to do when row is clicked. If system:xyz then call onSystemAction with xyz
    Note: "system:open" was default for rows with no aggregation in version 1

  multiselectActions: actions to display as options when multiple rows are selected
    array of: 
      action: action id e.g. "scope", "system:approve"
      label: label to display on button

 column:
   id: unique id of column (uuid v4)
   headerText: header text
   textAxis: axis that creates the text value of the column. NOTE: now no longer using as an axis, but only using expression within!
 
 ordering:
   axis: axis that creates the order expression. NOTE: now no longer using as an axis, but only using expression within! 
   direction: "asc"/"desc"

Tables can generate scope for other widgets. Scope data format is array of object of row values e.g. [{ id: "abc123" }] or [{ c0: value, c1: value }] (all non-aggr columns)
 */

module.exports = TableChart = (function(superClass) {
  extend(TableChart, superClass);

  function TableChart() {
    return TableChart.__super__.constructor.apply(this, arguments);
  }

  TableChart.prototype.cleanDesign = function(design, schema) {
    var ExprCleaner, axisBuilder, column, columnId, exprCleaner, j, k, len, ordering, ref, ref1;
    ExprCleaner = require('mwater-expressions').ExprCleaner;
    exprCleaner = new ExprCleaner(schema);
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    design = _.cloneDeep(design);
    design.version = design.version || 1;
    design.columns = design.columns || [];
    if (design.columns.length === 0) {
      design.columns.push({
        id: uuid()
      });
    }
    design.orderings = design.orderings || [];
    if (design.multiselect && TableChartUtils.isTableAggr(design, schema)) {
      design.multiselect = false;
    }
    if (!design.multiselect) {
      delete design.multiselectActions;
    }
    for (columnId = j = 0, ref = design.columns.length; 0 <= ref ? j < ref : j > ref; columnId = 0 <= ref ? ++j : --j) {
      column = design.columns[columnId];
      if (!column.id) {
        column.id = uuid();
      }
      column.textAxis = axisBuilder.cleanAxis({
        axis: column.textAxis,
        table: design.table,
        aggrNeed: "optional"
      });
    }
    ref1 = design.orderings;
    for (k = 0, len = ref1.length; k < len; k++) {
      ordering = ref1[k];
      ordering.axis = axisBuilder.cleanAxis({
        axis: ordering.axis,
        table: design.table,
        aggrNeed: "optional"
      });
    }
    if (design.filter) {
      design.filter = exprCleaner.cleanExpr(design.filter, {
        table: design.table,
        types: ['boolean']
      });
    }
    return design;
  };

  TableChart.prototype.validateDesign = function(design, schema) {
    var axisBuilder, column, error, j, k, len, len1, ordering, ref, ref1;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    if (!design.table) {
      return "Missing data source";
    }
    error = null;
    ref = design.columns;
    for (j = 0, len = ref.length; j < len; j++) {
      column = ref[j];
      if (!column.textAxis) {
        error = error || "Missing text";
      }
      error = error || axisBuilder.validateAxis({
        axis: column.textAxis
      });
    }
    ref1 = design.orderings;
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      ordering = ref1[k];
      if (!ordering.axis) {
        error = error || "Missing order expression";
      }
      error = error || axisBuilder.validateAxis({
        axis: ordering.axis
      });
    }
    return error;
  };

  TableChart.prototype.isEmpty = function(design) {
    return !design.columns || !design.columns[0] || !design.columns[0].textAxis;
  };

  TableChart.prototype.createDesignerElement = function(options) {
    var TableChartDesignerComponent, props;
    TableChartDesignerComponent = require('./TableChartDesignerComponent');
    props = {
      schema: options.schema,
      design: this.cleanDesign(options.design, options.schema),
      dataSource: options.dataSource,
      onDesignChange: (function(_this) {
        return function(design) {
          design = _this.cleanDesign(design, options.schema);
          return options.onDesignChange(design);
        };
      })(this),
      widgetDataSource: options.widgetDataSource,
      onDesignChange: options.onDesignChange,
      popups: options.popups,
      onPopupsChange: options.onPopupsChange,
      onSystemAction: options.onSystemAction,
      namedStrings: options.namedStrings,
      filters: options.filters,
      getSystemActions: options.getSystemActions
    };
    return React.createElement(TableChartDesignerComponent, props);
  };

  TableChart.prototype.getData = function(design, schema, dataSource, filters, callback) {
    var axisBuilder, colNum, column, compiledExpr, exprCompiler, exprType, exprUtils, i, isAggr, j, k, len, ordering, query, ref, ref1, ref2, ref3, ref4, ref5, whereClauses;
    exprUtils = new ExprUtils(schema);
    exprCompiler = new ExprCompiler(schema);
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    query = {
      type: "query",
      selects: [],
      from: exprCompiler.compileTable(design.table, "main"),
      groupBy: [],
      orderBy: [],
      limit: 1000
    };
    isAggr = TableChartUtils.isTableAggr(design, schema);
    for (colNum = j = 0, ref = design.columns.length; 0 <= ref ? j < ref : j > ref; colNum = 0 <= ref ? ++j : --j) {
      column = design.columns[colNum];
      exprType = exprUtils.getExprType((ref1 = column.textAxis) != null ? ref1.expr : void 0);
      compiledExpr = exprCompiler.compileExpr({
        expr: (ref2 = column.textAxis) != null ? ref2.expr : void 0,
        tableAlias: "main"
      });
      if (exprType === "geometry") {
        compiledExpr = {
          type: "op",
          op: "ST_AsGeoJSON",
          exprs: [
            {
              type: "op",
              op: "ST_Transform",
              exprs: [
                {
                  type: "op",
                  op: "::geometry",
                  exprs: [compiledExpr]
                }, 4326
              ]
            }
          ]
        };
      }
      query.selects.push({
        type: "select",
        expr: compiledExpr,
        alias: "c" + colNum
      });
      if (isAggr && !axisBuilder.isAxisAggr(column.textAxis)) {
        query.groupBy.push(colNum + 1);
      }
    }
    ref3 = design.orderings || [];
    for (i = k = 0, len = ref3.length; k < len; i = ++k) {
      ordering = ref3[i];
      query.selects.push({
        type: "select",
        expr: exprCompiler.compileExpr({
          expr: (ref4 = ordering.axis) != null ? ref4.expr : void 0,
          tableAlias: "main"
        }),
        alias: "o" + i
      });
      query.orderBy.push({
        ordinal: design.columns.length + i + 1,
        direction: ordering.direction,
        nulls: (ordering.direction === "desc" ? "last" : "first")
      });
      if (isAggr && exprUtils.getExprAggrStatus((ref5 = ordering.axis) != null ? ref5.expr : void 0) === "individual") {
        query.groupBy.push(design.columns.length + i + 1);
      }
    }
    if (!isAggr) {
      query.selects.push({
        type: "select",
        expr: {
          type: "field",
          tableAlias: "main",
          column: schema.getTable(design.table).primaryKey
        },
        alias: "id"
      });
    }
    filters = _.where(filters || [], {
      table: design.table
    });
    whereClauses = _.map(filters, function(f) {
      return injectTableAlias(f.jsonql, "main");
    });
    if (design.filter) {
      whereClauses.push(exprCompiler.compileExpr({
        expr: design.filter,
        tableAlias: "main"
      }));
    }
    whereClauses = _.compact(whereClauses);
    if (whereClauses.length > 1) {
      query.where = {
        type: "op",
        op: "and",
        exprs: whereClauses
      };
    } else {
      query.where = whereClauses[0];
    }
    return dataSource.performQuery(query, (function(_this) {
      return function(error, data) {
        return callback(error, {
          main: data
        });
      };
    })(this));
  };

  TableChart.prototype.createViewElement = function(options) {
    var props;
    props = {
      schema: options.schema,
      dataSource: options.dataSource,
      widgetDataSource: options.widgetDataSource,
      design: this.cleanDesign(options.design, options.schema),
      data: options.data,
      width: options.width,
      height: options.height,
      standardWidth: options.standardWidth,
      scope: options.scope,
      onScopeChange: options.onScopeChange,
      onSystemAction: options.onSystemAction,
      popups: options.popups,
      onPopupsChange: options.onPopupsChange,
      namedStrings: options.namedStrings,
      filters: options.filters
    };
    return React.createElement(TableChartViewComponent, props);
  };

  TableChart.prototype.createDataTable = function(design, schema, dataSource, data, locale) {
    var exprUtils, header, renderHeaderCell, renderRow, table;
    exprUtils = new ExprUtils(schema);
    renderHeaderCell = (function(_this) {
      return function(column) {
        var ref;
        return column.headerText || exprUtils.summarizeExpr((ref = column.textAxis) != null ? ref.expr : void 0, locale);
      };
    })(this);
    header = _.map(design.columns, renderHeaderCell);
    table = [header];
    renderRow = (function(_this) {
      return function(record) {
        var renderCell;
        renderCell = function(column, columnIndex) {
          var exprType, ref, ref1, value;
          value = record["c" + columnIndex];
          exprUtils = new ExprUtils(schema);
          exprType = exprUtils.getExprType((ref = column.textAxis) != null ? ref.expr : void 0);
          if (exprType === "image" && value) {
            return dataSource.getImageUrl(value.id);
          }
          if (exprType === "imagelist" && value) {
            return _.map(value, function(img) {
              return dataSource.getImageUrl(img.id);
            }).join(" ");
          }
          return exprUtils.stringifyExprLiteral((ref1 = column.textAxis) != null ? ref1.expr : void 0, value, locale);
        };
        return _.map(design.columns, renderCell);
      };
    })(this);
    table = table.concat(_.map(data.main, renderRow));
    return table;
  };

  TableChart.prototype.getFilterableTables = function(design, schema) {
    return _.compact([design.table]);
  };

  TableChart.prototype.getPlaceholderIcon = function() {
    return "fa-table";
  };

  return TableChart;

})(Chart);
