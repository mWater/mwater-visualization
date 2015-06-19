var ExpressionBuilder, ScalarExprTreeBuilder,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

ExpressionBuilder = require('./ExpressionBuilder');

module.exports = ScalarExprTreeBuilder = (function() {
  function ScalarExprTreeBuilder(schema) {
    this.schema = schema;
  }

  ScalarExprTreeBuilder.prototype.getTree = function(options) {
    var fn, i, len, nodes, ref, table;
    if (options == null) {
      options = {};
    }
    nodes = [];
    ref = this.schema.getTables();
    fn = (function(_this) {
      return function(table) {
        var node;
        node = {
          name: table.name,
          desc: table.desc,
          initiallyOpen: options.table != null
        };
        node.children = function() {
          return _this.createChildNodes({
            startTable: table.id,
            table: table.id,
            joins: [],
            types: options.types
          });
        };
        return nodes.push(node);
      };
    })(this);
    for (i = 0, len = ref.length; i < len; i++) {
      table = ref[i];
      if (options.table && table.id !== options.table) {
        continue;
      }
      fn(table);
    }
    return nodes;
  };

  ScalarExprTreeBuilder.prototype.createChildNodes = function(options) {
    var column, fn, i, len, nodes, ref;
    nodes = [];
    ref = this.schema.getColumns(options.table);
    fn = (function(_this) {
      return function(column) {
        var exprBuilder, fieldExpr, node, ref1, types;
        node = {
          name: column.name,
          desc: column.desc
        };
        if (column.type === "join") {
          node.children = function() {
            var joins;
            joins = options.joins.slice();
            joins.push(column.id);
            return _this.createChildNodes({
              startTable: options.startTable,
              table: column.join.toTable,
              joins: joins,
              types: options.types
            });
          };
        } else {
          fieldExpr = {
            type: "field",
            table: options.table,
            column: column.id
          };
          if (options.types) {
            exprBuilder = new ExpressionBuilder(_this.schema);
            if (exprBuilder.isMultipleJoins(options.startTable, options.joins)) {
              types = exprBuilder.getAggrTypes(fieldExpr);
              if (_.intersection(types, options.types).length === 0) {
                return;
              }
            } else {
              if (ref1 = column.type, indexOf.call(options.types, ref1) < 0) {
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
        return nodes.push(node);
      };
    })(this);
    for (i = 0, len = ref.length; i < len; i++) {
      column = ref[i];
      fn(column);
    }
    return nodes;
  };

  return ScalarExprTreeBuilder;

})();
