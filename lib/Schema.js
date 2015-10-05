var EditableLinkComponent, H, React, Schema, _, ui;

_ = require('lodash');

React = require('react');

H = React.DOM;

EditableLinkComponent = require('./EditableLinkComponent');

ui = require('./UIComponents');

module.exports = Schema = (function() {
  function Schema() {
    this.tables = [];
  }

  Schema.prototype.createTableSelectElement = function(table, onChange) {
    return React.createElement(ui.ToggleEditComponent, {
      forceOpen: !table,
      label: table ? this.getTable(table).name : H.i(null, "Select..."),
      editor: (function(_this) {
        return function(onClose) {
          return React.createElement(ui.OptionListComponent, {
            hint: "Select source to get data from",
            items: _.map(_this.getTables(), function(table) {
              return {
                name: table.name,
                desc: table.desc,
                onClick: function() {
                  onClose();
                  return onChange(table.id);
                }
              };
            })
          });
        };
      })(this)
    });
  };

  Schema.prototype.setCreateTableSelectElement = function(factory) {
    return this.createTableSelectElement = factory;
  };

  Schema.prototype.addTable = function(options) {
    var table;
    table = _.pick(options, "id", "name", "desc", "primaryKey", "ordering", "jsonql");
    table.columns = [];
    table.namedExprs = [];
    this.tables.push(table);
    return this;
  };

  Schema.prototype.addColumn = function(tableId, options) {
    var table;
    table = this.getTable(tableId);
    table.columns.push(_.pick(options, "id", "name", "desc", "type", "values", "join", "jsonql"));
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
    var i, len, loadContents, ref, results, structure, table;
    loadContents = (function(_this) {
      return function(table, contents, structure) {
        var i, item, len, results, structureItem;
        results = [];
        for (i = 0, len = contents.length; i < len; i++) {
          item = contents[i];
          if (item.type === "id") {
            continue;
          }
          if (item.type === "section") {
            structureItem = {
              type: "section",
              name: item.name,
              contents: []
            };
            structure.push(structureItem);
            loadContents(table, item.contents, structureItem.contents);
            continue;
          }
          _this.addColumn(table.id, item);
          results.push(structure.push({
            type: "column",
            column: item.id
          }));
        }
        return results;
      };
    })(this);
    ref = json.tables;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      table = ref[i];
      this.addTable(table);
      structure = [];
      loadContents(table, table.contents, structure);
      results.push(this.setTableStructure(table.id, structure));
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
