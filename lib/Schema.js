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

  Schema.prototype.setTableStructure = function(tableId, structure) {
    var table;
    table = this.getTable(tableId);
    return table.structure = structure;
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
    var column, i, j, len, len1, namedExpr, ref, ref1, results, table;
    ref = json.tables;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      table = ref[i];
      this.addTable(table);
      ref1 = table.columns;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        column = ref1[j];
        if (column.type === "id") {
          continue;
        }
        this.addColumn(table.id, column);
      }
      if (table.namedExprs) {
        results.push((function() {
          var k, len2, ref2, results1;
          ref2 = table.namedExprs;
          results1 = [];
          for (k = 0, len2 = ref2.length; k < len2; k++) {
            namedExpr = ref2[k];
            results1.push(this.addColumn(table.id, namedExpr));
          }
          return results1;
        }).call(this));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Schema.parseStructureFromText = function(textDefn) {
    var lines, n, read;
    lines = _.filter(textDefn.split(/[\r\n]/), function(l) {
      return l.trim().length > 0;
    });
    n = 0;
    read = function(indent) {
      var items, line, lineIndent;
      items = [];
      while (n < lines.length) {
        line = lines[n];
        lineIndent = line.match(/^ */)[0].length;
        if (lineIndent < indent) {
          return items;
        }
        if (line.match(/^\+/)) {
          n += 1;
          items.push({
            type: "section",
            name: line.trim().substr(1),
            contents: read(indent + 2)
          });
        } else {
          n += 1;
          items.push({
            type: "column",
            column: line.trim().split(" ")[0]
          });
        }
      }
      return items;
    };
    return read(0);
  };

  return Schema;

})();
