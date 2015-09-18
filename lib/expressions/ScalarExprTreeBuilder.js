var ExpressionBuilder, ScalarExprTreeBuilder, _,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('lodash');

ExpressionBuilder = require('./ExpressionBuilder');

module.exports = ScalarExprTreeBuilder = (function() {
  function ScalarExprTreeBuilder(schema) {
    this.schema = schema;
  }

  ScalarExprTreeBuilder.prototype.getTree = function(options) {
    if (options == null) {
      options = {};
    }
    return this.createTableChildNodes({
      startTable: options.table,
      table: options.table,
      joins: [],
      types: options.types,
      includeCount: options.includeCount,
      initialValue: options.initialValue
    });
  };

  ScalarExprTreeBuilder.prototype.createTableChildNodes = function(options) {
    var column, i, len, node, nodes, ref, table;
    nodes = [];
    if (options.includeCount) {
      nodes.push({
        name: "Number of " + (this.schema.getTable(options.table).name),
        value: {
          table: options.startTable,
          joins: options.joins,
          expr: {
            type: "count",
            table: options.table
          }
        }
      });
    }
    table = this.schema.getTable(options.table);
    if (!table.structure) {
      ref = this.schema.getColumns(options.table);
      for (i = 0, len = ref.length; i < len; i++) {
        column = ref[i];
        node = this.createColumnNode(_.extend(options, {
          column: column
        }));
        if (node) {
          nodes.push(node);
        }
      }
    } else {
      nodes = nodes.concat(this.createStructureNodes(table.structure, options));
    }
    return nodes;
  };

  ScalarExprTreeBuilder.prototype.createStructureNodes = function(structure, options) {
    var fn, i, item, len, nodes;
    nodes = [];
    fn = (function(_this) {
      return function(item) {
        var column, node;
        if (item.type === "column") {
          column = _this.schema.getColumn(options.table, item.column);
          if (column) {
            node = _this.createColumnNode(_.extend(options, {
              column: column
            }));
            if (node) {
              return nodes.push(node);
            }
          }
        } else if (item.type === "section") {
          node = {
            name: item.name,
            children: function() {
              return _this.createStructureNodes(item.contents, options);
            }
          };
          if (node.children().length > 0) {
            return nodes.push(node);
          }
        }
      };
    })(this);
    for (i = 0, len = structure.length; i < len; i++) {
      item = structure[i];
      fn(item);
    }
    return nodes;
  };

  ScalarExprTreeBuilder.prototype.createColumnNode = function(options) {
    var column, exprBuilder, fieldExpr, initVal, joins, node, ref, types;
    exprBuilder = new ExpressionBuilder(this.schema);
    column = options.column;
    node = {
      name: column.name,
      desc: column.desc
    };
    if (column.type === "join") {
      joins = options.joins.slice();
      joins.push(column.id);
      initVal = options.initialValue;
      node.children = (function(_this) {
        return function() {
          var includeCount;
          includeCount = exprBuilder.isMultipleJoins(options.startTable, joins);
          return _this.createTableChildNodes({
            startTable: options.startTable,
            table: column.join.toTable,
            joins: joins,
            types: options.types,
            includeCount: includeCount,
            initialValue: initVal
          });
        };
      })(this);
      if (initVal && initVal.joins && _.isEqual(initVal.joins.slice(0, joins.length), joins)) {
        node.initiallyOpen = true;
      }
    } else {
      fieldExpr = {
        type: "field",
        table: options.table,
        column: column.id
      };
      if (options.types) {
        if (exprBuilder.isMultipleJoins(options.startTable, options.joins)) {
          types = exprBuilder.getAggrTypes(fieldExpr);
          if (_.intersection(types, options.types).length === 0) {
            return;
          }
        } else {
          if (ref = column.type, indexOf.call(options.types, ref) < 0) {
            return;
          }
        }
      }
      node.value = {
        table: options.startTable,
        joins: options.joins,
        expr: fieldExpr
      };
    }
    return node;
  };

  return ScalarExprTreeBuilder;

})();
