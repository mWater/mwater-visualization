
# Schema for a database
module.exports = class Schema
  constructor: ->
    @tables = []

  # Add table with id, name, desc, ordering (column with natural order)
  addTable: (options) ->
    table = _.pick(options, "id", "name", "desc", "ordering")
    table.columns = []
    table.namedExprs = []
    @tables.push(table)
    return this

  addColumn: (tableId, options) ->
    table = @getTable(tableId)
    table.columns.push(_.pick(options, "id", "name", "desc", "type", "values", "join"))
    return this

  # Add a named expression to a table with id, name, expr which is a valid scalar or field expression
  addNamedExpr: (tableId, options) ->
    table = @getTable(tableId)
    table.namedExprs.push(_.pick(options, "id", "name", "expr"))
    return this

  # Set the structure of the table. Array of:
  # { type: "column", column: column id }
  # and 
  # { type: "section", name: section name, contents: array of columns/sections etc. }
  setTableStructure: (tableId, structure) ->
    table = @getTable(tableId)
    table.structure = structure

  getTables: -> @tables

  getTable: (tableId) -> _.findWhere(@tables, { id: tableId })

  getColumns: (tableId) ->
    table = @getTable(tableId)
    if not table
      throw new Error("Unknown table #{tableId}")
    return table.columns

  getColumn: (tableId, columnId) ->
    table = @getTable(tableId)
    if not table
      throw new Error("Unknown table #{tableId}")
    return _.findWhere(table.columns, { id: columnId })

  getNamedExprs: (tableId) ->
    table = @getTable(tableId)
    if not table
      throw new Error("Unknown table #{tableId}")
    return table.namedExprs

  # Loads from a json schema in format { tables: [...] }
  loadFromJSON: (json) ->
    for table in json.tables
      @addTable(table)
      for column in table.columns
        # Ignore id columns. They are only there for sharing schema maps with server
        if column.type == "id"
          continue

        @addColumn(table.id, column)

      if table.namedExprs
        for namedExpr in table.namedExprs
          @addColumn(table.id, namedExpr)

  # Parses structure from a text definition in the format
  # column1
  # column2
  # +Section    # Notice the + prefix for a section
  #   column3   # Notice the two character indent
  #   column4 
  @parseStructureFromText: (textDefn) ->
    # Get rid of empty lines and trim
    lines = _.filter(textDefn.split(/[\r\n]/), (l) -> l.trim().length > 0)

    n = 0

    read = (indent) ->
      items = []
      while n < lines.length
        line = lines[n]
        lineIndent = line.match(/^ */)[0].length
        if lineIndent < indent
          return items

        # Section
        if line.match(/^\+/)
          n += 1
          items.push({ type: "section", name: line.trim().substr(1), contents: read(indent + 2) })
        else
          n += 1
          items.push({ type: "column", column: line.trim().split(" ")[0] })

      return items

    return read(0)
