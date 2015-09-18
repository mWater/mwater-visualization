_ = require 'lodash'
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
  #  table: starting table
  #  types: types to limit to 
  #  includeCount: to include an count (null) option that has null expr and name that is "Number of ..." at first table level
  #  initialValue: initial value to flesh out
  getTree: (options = {}) ->
    return @createTableChildNodes(startTable: options.table, table: options.table, joins: [], types: options.types, includeCount: options.includeCount, initialValue: options.initialValue)

  # Options:
  # startTable: table id that started from
  # table: table id to get nodes for
  # joins: joins for child nodes
  # types: types to limit to 
  # includeCount: to include an count (null) option that has null expr and name that is "Number of ..."
  # initialValue: initial value to flesh out
  createTableChildNodes: (options) ->
    nodes = []
    # Create count node if any joins
    if options.includeCount
      nodes.push({
        name: "Number of #{@schema.getTable(options.table).name}"
        value: { table: options.startTable, joins: options.joins, expr: { type: "count", table: options.table } }
      })

    table = @schema.getTable(options.table)

    if not table.structure
      # Create node for each column
      for column in @schema.getColumns(options.table)
        node = @createColumnNode(_.extend(options, column: column))
        if node
          nodes.push(node)
    else
      nodes = nodes.concat(@createStructureNodes(table.structure, options))

    return nodes

  createStructureNodes: (structure, options) ->
    nodes = []

    for item in structure
      do (item) =>
        if item.type == "column"
          column = @schema.getColumn(options.table, item.column)
          # Gracefully handle missing columns
          if column
            node = @createColumnNode(_.extend(options, column: column))
            if node
              nodes.push(node)
        else if item.type == "section"
          node = {
            name: item.name
            children: =>
              @createStructureNodes(item.contents, options)
          }
          # Add if non-empty
          if node.children().length > 0
            nodes.push(node)

    return nodes

  # Include column, startTable, joins, initialValue, table, types
  createColumnNode: (options) ->
    exprBuilder = new ExpressionBuilder(@schema)

    column = options.column

    node = { 
      name: column.name
      desc: column.desc
    }

    # If join, add children
    if column.type == "join"
      # Add column to joins
      joins = options.joins.slice()
      joins.push(column.id)
      initVal = options.initialValue
      
      node.children = =>
        # Determine if to include count. True if aggregated
        includeCount = exprBuilder.isMultipleJoins(options.startTable, joins)
        return @createTableChildNodes(startTable: options.startTable, table: column.join.toTable, joins: joins, types: options.types, includeCount: includeCount, initialValue: initVal)
        
      # Load children (recursively) if selected node is in this tree
      if initVal and initVal.joins and _.isEqual(initVal.joins.slice(0, joins.length), joins)
        node.initiallyOpen = true
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

    return node
