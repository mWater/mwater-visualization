_ = require 'lodash'
React = require 'react'
H = React.DOM
EditableLinkComponent = require './EditableLinkComponent'
ui = require './UIComponents'

# Schema for a database. Stores tables with columns (possibly in nested sections).
# Also creates a control for selecting a table
module.exports = class Schema
  constructor: () ->
    @tables = []

  # Create an element for selecting a table. Displays current table
  createTableSelectElement: (table, onChange) ->
    # Can be overridden
    React.createElement ui.ToggleEditComponent,
      forceOpen: not table
      label: if table then @getTable(table).name else H.i(null, "Select...")
      editor: (onClose) =>
        React.createElement(ui.OptionListComponent, 
          hint: "Select source to get data from"
          items: _.map(@getTables(), (table) => { 
            name: table.name
            desc: table.desc
            onClick: () =>
              onClose() # Close popover first
              onChange(table.id)
          }))

  # Call to override create table selection element function
  setCreateTableSelectElement: (factory) ->
    @createTableSelectElement = factory

  # Add table with id, name, desc, primaryKey, ordering (column with natural order)
  addTable: (options) ->
    table = _.pick(options, "id", "name", "desc", "primaryKey", "ordering", "jsonql")
    table.columns = []
    table.namedExprs = []
    @tables.push(table)
    return this

  # Add a column. The column must contain id, name, type
  # For enums, must contain values (array of id, name.)
  # See Schema.md for complete details
  addColumn: (tableId, options) ->
    table = @getTable(tableId)
    table.columns.push(_.pick(options, "id", "name", "desc", "type", "values", "join", "jsonql"))
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

  # Loads from a json schema in format described in Schema.md
  loadFromJSON: (json) ->
    loadContents = (table, contents, structure) =>
      for item in contents
        # Ignore id type. They are only there for sharing schema maps with server TODO remove
        if item.type == "id"
          continue

        # If section, create structure and recurse
        if item.type == "section"
          structureItem = {
            type: "section"
            name: item.name
            contents: []
          }
          structure.push(structureItem)
          loadContents(table, item.contents, structureItem.contents)
          continue
        
        # Add column to schema
        @addColumn(table.id, item)

        # Add to structure
        structure.push({ type: "column", column: item.id })

    for table in json.tables
      @addTable(table)
      structure = []
      loadContents(table, table.contents, structure)
      @setTableStructure(table.id, structure)
      # TODO namedExprs
      # if table.namedExprs
      #   for namedExpr in table.namedExprs
      #     @addColumn(table.id, namedExpr)

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
