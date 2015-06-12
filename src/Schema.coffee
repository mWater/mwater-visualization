
# Schema for a database
module.exports = class Schema
  constructor: ->
    @tables = []

  # Add table with id, name, desc, ordering (column with natural order)
  addTable: (options) ->
    table = _.pick(options, "id", "name", "desc", "ordering")
    table.columns = []
    @tables.push(table)

  getTables: -> @tables

  getTable: (tableId) -> _.findWhere(@tables, { id: tableId })

  addColumn: (tableId, options) ->
    table = @getTable(tableId)
    table.columns.push(_.defaults(_.pick(options, "id", "name", "desc", "type", "values", "join")))

  getColumns: (tableId) ->
    table = @getTable(tableId)
    return table.columns

  getColumn: (tableId, columnId) ->
    table = @getTable(tableId)
    return _.findWhere(table.columns, { id: columnId })

