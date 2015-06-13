# Builds a tree for selecting table + joins + expr of a scalar expression
# Organizes columns, and follows joins
module.exports = class ScalarExprTreeBuilder
  constructor: (schema) ->
    @schema = schema

  # Returns array of 
  # { 
  #   name: name of item, 
  #   desc: description of item, 
  #   value: { table, joins, expr } - partial scalar expression, null if not selectable node
  #   children: function which returns children nodes
  #   initiallyOpen: true if children should display initially
  # }
  # options are:
  #  startTable: to limit starting table to a specific table
  #  onlyTypes: types to limit to 
  getTree: (options = {}) ->
    nodes = []
    # For each table
    for table in @schema.getTables()
      if options.startTable and table.id != options.startTable
        continue

      do (table) =>
        node = {
          name: table.name
          desc: table.desc
          # Initially open if only one table
          initiallyOpen: options.startTable?
        }

        # Create nodes for each column of a table
        node.children = =>
          @createChildNodes(startTable: table.id, table: table.id, joins: [])
        nodes.push(node)

    return nodes

  # Options:
  # startTable: table id that started from
  # table: table id to get nodes for
  # joins: joins for child nodes
  createChildNodes: (options) ->
    nodes = []

    # Create node for each column
    for column in @schema.getColumns(options.table)
      do (column) =>
        node = { 
          name: column.name
          desc: column.desc
        }

        # If join, add children
        if column.type == "join"
          node.children = =>
            # Add column to joins
            joins = options.joins.slice()
            joins.push(column.id)
            return @createChildNodes(startTable: options.startTable, table: column.join.toTable, joins: joins)
        else
          node.value = { table: options.startTable, joins: options.joins, expr: { type: "field", table: options.table, column: column.id } } 
        nodes.push(node)

    return nodes
