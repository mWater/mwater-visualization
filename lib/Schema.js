var Schema,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

module.exports = Schema = (function() {
  function Schema() {
    this.tables = [];
    this.joins = [];
  }

  Schema.prototype.addTable = function(options) {
    var table;
    table = _.pick(options, "id", "name", "desc", "icon", "ordering");
    table.columns = [];
    return this.tables.push(table);
  };

  Schema.prototype.getTables = function() {
    return this.tables;
  };

  Schema.prototype.getTable = function(tableId) {
    return _.findWhere(this.tables, {
      id: tableId
    });
  };

  Schema.prototype.addColumn = function(tableId, options) {
    var table;
    table = this.getTable(tableId);
    return table.columns.push(_.defaults(_.pick(options, "id", "primary", "name", "desc", "type", "values"), {
      primary: false
    }));
  };

  Schema.prototype.getColumns = function(tableId) {
    var table;
    table = this.getTable(tableId);
    return table.columns;
  };

  Schema.prototype.getColumn = function(tableId, columnId) {
    var table;
    table = this.getTable(tableId);
    return _.findWhere(table.columns, {
      id: columnId
    });
  };

  Schema.prototype.addJoin = function(options) {
    return this.joins.push(_.pick(options, "id", "name", "fromTableId", "fromColumnId", "toTableId", "toColumnId", "op", "oneToMany"));
  };

  Schema.prototype.getJoins = function() {
    return this.joins;
  };

  Schema.prototype.getJoin = function(joinId) {
    return _.findWhere(this.joins, {
      id: joinId
    });
  };

  Schema.prototype.getJoinExprTree = function(options) {
    var baseTable, col, desc, fn, i, join, joinIds, k, len, len1, name, ref, ref1, ref2, tree;
    baseTable = this.getTable(options.baseTableId);
    tree = [];
    joinIds = options.joinIds || [];
    ref = baseTable.columns;
    for (i = 0, len = ref.length; i < len; i++) {
      col = ref[i];
      if (joinIds.length === 0 && col.primary) {
        continue;
      }
      if (col.type === "uuid" && !col.primary) {
        continue;
      }
      if (col.primary) {
        name = "Number of " + baseTable.name;
        desc = "";
      } else {
        name = col.name;
        desc = col.desc;
      }
      if (options.types && (ref1 = col.type, indexOf.call(options.types, ref1) < 0)) {
        continue;
      }
      tree.push({
        id: col.id,
        name: name,
        desc: col.desc,
        type: col.type,
        value: {
          joinIds: joinIds,
          expr: {
            type: "field",
            tableId: baseTable.id,
            columnId: col.id
          }
        }
      });
    }
    ref2 = this.joins;
    fn = (function(_this) {
      return function(join) {
        if (join.fromTableId === baseTable.id) {
          return tree.push({
            id: join.id,
            name: join.name,
            desc: join.desc,
            value: {
              joinIds: joinIds
            },
            getChildren: function() {
              return _this.getJoinExprTree({
                baseTableId: join.toTableId,
                joinIds: joinIds.concat([join.id])
              });
            }
          });
        }
      };
    })(this);
    for (k = 0, len1 = ref2.length; k < len1; k++) {
      join = ref2[k];
      fn(join);
    }
    return tree;
  };

  Schema.prototype.getExprType = function(expr) {
    var column;
    if (expr == null) {
      return null;
    }
    switch (expr.type) {
      case "field":
        column = this.getColumn(expr.tableId, expr.columnId);
        return column.type;
      case "scalar":
        if (expr.aggrId === "count") {
          return "integer";
        }
        return this.getExprType(expr.expr);
      case "text":
      case "integer":
      case "boolean":
      case "decimal":
      case "enum":
      case "date":
        return expr.type;
      default:
        throw new Error("Not implemented");
    }
  };

  Schema.prototype.getExprTable = function(expr) {
    switch (expr.type) {
      case "field":
        return this.getTable(expr.tableId);
      default:
        throw new Error("Not implemented");
    }
  };

  Schema.prototype.getAggrs = function(expr) {
    var aggrs, table, type;
    aggrs = [];
    type = this.getExprType(expr);
    table = this.getExprTable(expr);
    if (table && table.ordering && type !== "uuid") {
      aggrs.push({
        id: "last",
        name: "Latest",
        type: type
      });
    }
    switch (type) {
      case "date":
        aggrs.push({
          id: "max",
          name: "Maximum",
          type: type
        });
        aggrs.push({
          id: "min",
          name: "Minimum",
          type: type
        });
        break;
      case "integer":
      case "decimal":
        aggrs.push({
          id: "sum",
          name: "Sum",
          type: type
        });
        aggrs.push({
          id: "avg",
          name: "Average",
          type: "decimal"
        });
        aggrs.push({
          id: "max",
          name: "Maximum",
          type: type
        });
        aggrs.push({
          id: "min",
          name: "Minimum",
          type: type
        });
    }
    aggrs.push({
      id: "count",
      name: "Number",
      type: "integer"
    });
    return aggrs;
  };

  Schema.prototype.isAggrNeeded = function(joinIds) {
    return _.any(joinIds, (function(_this) {
      return function(j) {
        return _this.getJoin(j).oneToMany;
      };
    })(this));
  };

  Schema.prototype.summarizeExpr = function(expr) {
    if (!expr) {
      return "None";
    }
    switch (expr.type) {
      case "scalar":
        return this.summarizeScalarExpr(expr);
      case "field":
        return this.getColumn(expr.tableId, expr.columnId).name;
      default:
        throw new Error("Unsupported type " + expr.type);
    }
  };

  Schema.prototype.summarizeScalarExpr = function(expr) {
    var i, joinId, len, ref, str;
    str = this.summarizeExpr(expr.expr);
    if (this.getExprType(expr.expr) === "uuid") {
      str = "Number";
    } else if (expr.aggrId) {
      str = _.findWhere(this.getAggrs(expr.expr), {
        id: expr.aggrId
      }).name + " " + str;
    }
    ref = expr.joinIds.slice().reverse();
    for (i = 0, len = ref.length; i < len; i++) {
      joinId = ref[i];
      str = str + " of " + this.getJoin(joinId).name;
    }
    return str;
  };

  Schema.prototype.getComparisonOps = function(lhsType) {
    var ops;
    ops = [];
    switch (lhsType) {
      case "integer":
      case "decimal":
        ops.push({
          id: "=",
          name: "="
        });
        ops.push({
          id: ">",
          name: ">"
        });
        ops.push({
          id: ">=",
          name: ">="
        });
        ops.push({
          id: "<",
          name: "<"
        });
        ops.push({
          id: "<=",
          name: "<="
        });
        break;
      case "text":
        ops.push({
          id: "~*",
          name: "matches"
        });
        break;
      case "date":
        ops.push({
          id: ">",
          name: "after"
        });
        ops.push({
          id: "<",
          name: "before"
        });
        break;
      case "enum":
        ops.push({
          id: "=",
          name: "is"
        });
        break;
      case "boolean":
        ops.push({
          id: "= true",
          name: "is true"
        });
        ops.push({
          id: "= false",
          name: "is false"
        });
    }
    ops.push({
      id: "is null",
      name: "has no value"
    });
    ops.push({
      id: "is not null",
      name: "has a value"
    });
    return ops;
  };

  Schema.prototype.getComparisonRhsType = function(lhsType, op) {
    if (op === '= true' || op === '= false' || op === 'is null' || op === 'is not null') {
      return null;
    }
    return lhsType;
  };

  Schema.prototype.getExprValues = function(expr) {
    var column;
    if (expr.type === "field") {
      column = this.getColumn(expr.tableId, expr.columnId);
      return column.values;
    }
    if (expr.type === "scalar") {
      return this.getExprValues(expr.expr);
    }
  };

  return Schema;

})();
