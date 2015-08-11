var Schema;

module.exports = Schema = (function() {
  function Schema() {
    this.tables = [];
  }

  Schema.prototype.addTable = function(options) {
    var table;
    table = _.pick(options, "id", "name", "desc", "ordering");
    table.columns = [];
    table.namedExprs = [];
    this.tables.push(table);
    return this;
  };

  Schema.prototype.addColumn = function(tableId, options) {
    var table;
    table = this.getTable(tableId);
    table.columns.push(_.pick(options, "id", "name", "desc", "type", "values", "join"));
    return this;
  };

  Schema.prototype.addNamedExpr = function(tableId, options) {
    var table;
    table = this.getTable(tableId);
    table.namedExprs.push(_.pick(options, "id", "name", "expr"));
    return this;
  };

  Schema.prototype.getTables = function() {
    return this.tables;
  };

  Schema.prototype.getTable = function(tableId) {
    return _.findWhere(this.tables, {
      id: tableId
    });
  };

  Schema.prototype.getColumns = function(tableId) {
    var table;
    table = this.getTable(tableId);
    if (!table) {
      throw new Error("Unknown table " + tableId);
    }
    return table.columns;
  };

  Schema.prototype.getColumn = function(tableId, columnId) {
    var table;
    table = this.getTable(tableId);
    if (!table) {
      throw new Error("Unknown table " + tableId);
    }
    return _.findWhere(table.columns, {
      id: columnId
    });
  };

  Schema.prototype.getNamedExprs = function(tableId) {
    var table;
    table = this.getTable(tableId);
    if (!table) {
      throw new Error("Unknown table " + tableId);
    }
    return table.namedExprs;
  };

  Schema.prototype.loadFromJSON = function(json) {
    var column, i, len, ref, results, table;
    ref = json.tables;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      table = ref[i];
      this.addTable(table);
      results.push((function() {
        var j, len1, ref1, results1;
        ref1 = table.columns;
        results1 = [];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          column = ref1[j];
          if (column.type === "id") {
            continue;
          }
          results1.push(this.addColumn(table.id, column));
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  return Schema;

})();
