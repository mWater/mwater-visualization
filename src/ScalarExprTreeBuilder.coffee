ExpressionBuilder = require './ExpressionBuilder'

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
  #  table: to limit starting table to a specific table
  #  types: types to limit to 
  #  includeCount: to include an count (null) option that has null expr and name that is "Number of ..." at first table level
  getTree: (options = {}) ->
    nodes = []
    # For each table if not specified
    if not options.table
      for table in @schema.getTables()
        do (table) =>
          node = {
            name: table.name
            desc: table.desc
            # Initially open if only one table
            initiallyOpen: options.table?
          }

          # Create nodes for each column of a table
          node.children = =>
            @createChildNodes(startTable: table.id, table: table.id, joins: [], types: options.types)
          nodes.push(node)
    else
      nodes = @createChildNodes(startTable: options.table, table: options.table, joins: [], types: options.types, includeCount: options.includeCount)

    return nodes

  # Options:
  # startTable: table id that started from
  # table: table id to get nodes for
  # joins: joins for child nodes
  # types: types to limit to 
  # includeCount: to include an count (null) option that has null expr and name that is "Number of ..."
  createChildNodes: (options) ->
    nodes = []
    exprBuilder = new ExpressionBuilder(@schema)

    # Create count node if any joins
    if options.includeCount
      nodes.push({
        name: "Number of #{@schema.getTable(options.table).name}"
        value: { table: options.startTable, joins: options.joins, expr: null }
      })

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

            # Determine if to include count. True if aggregated
            includeCount = exprBuilder.isMultipleJoins(options.startTable, joins)

            return @createChildNodes(startTable: options.startTable, table: column.join.toTable, joins: joins, types: options.types, includeCount: includeCount)
        else
          fieldExpr = { type: "field", table: options.table, column: column.id }
          if options.types 
            # If aggregated
            if exprBuilder.isMultipleJoins(options.startTable, options.joins)
              # Get types that this can become through aggregation
              types = exprBuilder.getAggrTypes(fieldExpr)
              # Skip if wrong type
              if _.intersection(types, options.types).length == 0
                return
            else
              # Skip if wrong type
              if column.type not in options.types
                return 

          node.value = { table: options.startTable, joins: options.joins, expr: fieldExpr } 
        nodes.push(node)

    return nodes
