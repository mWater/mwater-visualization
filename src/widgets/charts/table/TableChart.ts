// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let TableChart;
import _ from 'lodash';
import React from 'react';
const R = React.createElement;
import uuid from 'uuid';
import { default as produce } from 'immer';
import { original } from 'immer';
import { injectTableAlias } from 'mwater-expressions';
import Chart from '../Chart';
import { ExprUtils } from 'mwater-expressions';
import { ExprCompiler } from 'mwater-expressions';
import AxisBuilder from '../../../axes/AxisBuilder';
import TableChartViewComponent from './TableChartViewComponent';

/*
Design is:

  table: table to use for data source
  titleText: title text
  columns: array of columns
  filter: optional logical expression to filter by
  orderings: array of orderings
  limit: optional limit to number of rows

column:
  id: unique id of column (uuid v4)
  headerText: header text
  textAxis: axis that creates the text value of the column. NOTE: now no longer using as an axis, but only using expression within!
  format: optional d3-format format for numeric values. Default if null is ","

ordering:
  axis: axis that creates the order expression. NOTE: now no longer using as an axis, but only using expression within!
  direction: "asc"/"desc"

*/
export default TableChart = class TableChart extends Chart {
  cleanDesign(design, schema) {
    const {
      ExprCleaner
    } = require('mwater-expressions');

    const exprCleaner = new ExprCleaner(schema);
    const axisBuilder = new AxisBuilder({schema});

    design = produce(design, draft => {
      draft.version = design.version || 1;

      // Always have at least one column
      draft.columns = design.columns || [];
      if (draft.columns.length === 0) {
        draft.columns.push({id: uuid()});
      }

      draft.orderings = design.orderings || [];

      // Clean each column
      for (let columnId = 0, end = draft.columns.length, asc = 0 <= end; asc ? columnId < end : columnId > end; asc ? columnId++ : columnId--) {
        const column = draft.columns[columnId];

        if (!column.id) {
          column.id = uuid();
        }
        // Clean textAxis
        column.textAxis = axisBuilder.cleanAxis({axis: (column.textAxis ? original(column.textAxis) : null), table: design.table, aggrNeed: "optional"});
      }

      // Clean orderings
      for (let ordering of draft.orderings) {
        ordering.axis = axisBuilder.cleanAxis({axis: (ordering.axis ? original(ordering.axis) : null), table: design.table, aggrNeed: "optional"});
      }

      if (design.filter) {
        draft.filter = exprCleaner.cleanExpr(design.filter, { table: design.table, types: ['boolean'] });
      }

      // Limit 
      if (design.limit && (design.limit > 1000)) {
        delete draft.limit;
      }

    });

    return design;
  }

  validateDesign(design, schema) {
    const axisBuilder = new AxisBuilder({schema});

    // Check that has table
    if (!design.table) {
      return "Missing data source";
    }

    let error = null;

    for (let column of design.columns) {
      // Check that has textAxis
      if (!column.textAxis) {
        error = error || "Missing text";
      }

      error = error || axisBuilder.validateAxis({axis: column.textAxis});
    }

    for (let ordering of design.orderings) {
      if (!ordering.axis) {
        error = error || "Missing order expression";
      }
      error = error || axisBuilder.validateAxis({axis: ordering.axis});
    }

    return error;
  }

  isEmpty(design) {
    return !design.columns || !design.columns[0] || !design.columns[0].textAxis;
  }

  // Creates a design element with specified options
  // options include:
  //   schema: schema to use
  //   dataSource: dataSource to use
  //   design: design
  //   onDesignChange: function
  createDesignerElement(options) {
    // Require here to prevent server require problems
    const TableChartDesignerComponent = require('./TableChartDesignerComponent');

    const props = {
      schema: options.schema,
      design: this.cleanDesign(options.design, options.schema),
      dataSource: options.dataSource,
      onDesignChange: design => {
        // Clean design
        design = this.cleanDesign(design, options.schema);
        return options.onDesignChange(design);
      }
    };
    return React.createElement(TableChartDesignerComponent, props);
  }

  // Get data for the chart asynchronously
  // design: design of the chart
  // schema: schema to use
  // dataSource: data source to get data from
  // filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
  // callback: (error, data)
  getData(design, schema, dataSource, filters, callback) {
    let column;
    const exprUtils = new ExprUtils(schema);
    const exprCompiler = new ExprCompiler(schema);
    const axisBuilder = new AxisBuilder({schema});

    // Create shell of query
    const query = {
      type: "query",
      selects: [],
      from: exprCompiler.compileTable(design.table, "main"),
      groupBy: [],
      orderBy: [],
      limit: Math.min(design.limit || 1000, 1000)
    };

    // Determine if any aggregate
    const isAggr = _.any(design.columns, column => axisBuilder.isAxisAggr(column.textAxis)) || _.any(design.orderings, ordering => axisBuilder.isAxisAggr(ordering.axis));

    // For each column
    for (let colNum = 0, end = design.columns.length, asc = 0 <= end; asc ? colNum < end : colNum > end; asc ? colNum++ : colNum--) {
      column = design.columns[colNum];

      const exprType = exprUtils.getExprType(column.textAxis?.expr);

      let compiledExpr = exprCompiler.compileExpr({expr: column.textAxis?.expr, tableAlias: "main"});

      // Handle special case of geometry, converting to GeoJSON
      if (exprType === "geometry") {
        // Convert to 4326 (lat/long). Force ::geometry for null
        compiledExpr = { type: "op", op: "ST_AsGeoJSON", exprs: [{ type: "op", op: "ST_Transform", exprs: [{ type: "op", op: "::geometry", exprs: [compiledExpr]}, 4326] }] };
      }

      query.selects.push({
        type: "select",
        expr: compiledExpr,
        alias: `c${colNum}`
      });

      // Add group by if not aggregate
      if (isAggr && !axisBuilder.isAxisAggr(column.textAxis)) {
        query.groupBy.push(colNum + 1);
      }
    }

    // Compile orderings
    const iterable = design.orderings || [];
    for (let i = 0; i < iterable.length; i++) {
      // Add as select so we can use ordinals. Prevents https://github.com/mWater/mwater-visualization/issues/165
      const ordering = iterable[i];
      query.selects.push({
        type: "select",
        expr: exprCompiler.compileExpr({expr: ordering.axis?.expr, tableAlias: "main"}),
        alias: `o${i}`
      });

      query.orderBy.push({ ordinal: design.columns.length + i + 1, direction: ordering.direction, nulls: (ordering.direction === "desc" ? "last" : "first") });

      // Add group by if non-aggregate
      if (isAggr && (exprUtils.getExprAggrStatus(ordering.axis?.expr) === "individual")) {
        query.groupBy.push(design.columns.length + i + 1);
      }
    }

    // Add id if non-aggr
    if (!isAggr) {
      query.selects.push({
        type: "select",
        expr: { type: "field", tableAlias: "main", column: schema.getTable(design.table).primaryKey },
        alias: "id"
      });
    }

    // Get relevant filters
    filters = _.where(filters || [], {table: design.table});
    let whereClauses = _.map(filters, f => injectTableAlias(f.jsonql, "main"));

    // Compile filter
    if (design.filter) {
      whereClauses.push(exprCompiler.compileExpr({expr: design.filter, tableAlias: "main"}));
    }

    whereClauses = _.compact(whereClauses);

    // Wrap if multiple
    if (whereClauses.length > 1) {
      query.where = { type: "op", op: "and", exprs: whereClauses };
    } else {
      query.where = whereClauses[0];
    }

    return dataSource.performQuery(query, (error, data) => callback(error, { main: data }));
  }

  // Create a view element for the chart
  // Options include:
  //   schema: schema to use
  //   dataSource: dataSource to use
  //   design: design of the chart
  //   data: results from queries
  //   width, height: size of the chart view
  //   scope: current scope of the view element
  //   onScopeChange: called when scope changes with new scope
  //   onRowClick: Called with (tableId, rowId) when item is clicked
  createViewElement(options) {
    // Create chart
    const props = {
      schema: options.schema,
      dataSource: options.dataSource,
      design: this.cleanDesign(options.design, options.schema),
      data: options.data,

      width: options.width,
      height: options.height,

      scope: options.scope,
      onScopeChange: options.onScopeChange,

      onRowClick: options.onRowClick
    };

    return React.createElement(TableChartViewComponent, props);
  }

  createDataTable(design, schema, dataSource, data, locale) {
    let exprUtils = new ExprUtils(schema);

    const renderHeaderCell = column => {
      return column.headerText || exprUtils.summarizeExpr(column.textAxis?.expr, locale);
    };

    const header = _.map(design.columns, renderHeaderCell);
    let table = [header];
    const renderRow = record => {
      const renderCell = (column, columnIndex) => {
        const value = record[`c${columnIndex}`];

        // Handle empty as "" not "None"
        if ((value == null)) {
          return "";
        }

        exprUtils = new ExprUtils(schema);
        const exprType = exprUtils.getExprType(column.textAxis?.expr);

        // Special case for images
        if ((exprType === "image") && value) {
          return dataSource.getImageUrl(value.id);
        }

        if ((exprType === "imagelist") && value) { 
          return _.map(value, img => dataSource.getImageUrl(img.id)).join(" ");
        }

        return exprUtils.stringifyExprLiteral(column.textAxis?.expr, value, locale);
      };

      return _.map(design.columns, renderCell);
    };

    table = table.concat(_.map(data.main, renderRow));
    return table;
  }

  // Get a list of table ids that can be filtered on
  getFilterableTables(design, schema) {
    return _.compact([design.table]);
  }

  // Get the chart placeholder icon. fa-XYZ or glyphicon-XYZ
  getPlaceholderIcon() { return "fa-table"; }
};