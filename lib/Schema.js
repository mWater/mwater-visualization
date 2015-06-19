var Schema;

module.exports = Schema = (function() {
  function Schema() {
    this.tables = [];
  }

  Schema.prototype.addTable = function(options) {
    var table;
    table = _.pick(options, "id", "name", "desc", "ordering");
    table.columns = [];
    this.tables.push(table);
    return this;
  };

  Schema.prototype.addColumn = function(tableId, options) {
    var table;
    table = this.getTable(tableId);
    table.columns.push(_.defaults(_.pick(options, "id", "name", "desc", "type", "values", "join")));
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

  return Schema;

})();
