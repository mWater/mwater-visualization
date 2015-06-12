# Builds a tree for selecting table + path of a scalar expression
# Organizes columns, and follows joins
module.exports = class ScalarExprTreeBuilder
  constructor: (schema) ->
    @schema = schema

  # Returns array of 
  # { 
  #   name: name of item, 
  #   desc: description of item, 
  #   expr: { table, path } - partial scalar expression, null if not selectable node
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
          @createChildNodes(startTable: table.id, table: table.id, initialPath: [])
        nodes.push(node)

    return nodes

  # Options:
  # startTable: table id that started from
  # table: table id to get nodes for
  # initialPath: append path to this
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
          node.chidren = =>
            # Add column to path
            path = options.initialPath.slice()
            path.push(column.id)
            @createChildNodes(startTable: options.startTable, table: column.join.toTable, initialPath: path)
        else
          path = options.initialPath.slice()
          path.push(column.id)
          node.expr = { table: options.startTable, path: path } 

        nodes.push(node)

    return nodes
    # 
    # # Get base table
    # baseTable = @getTable(options.baseTableId)

    # tree = []
    # joinIds = options.joinIds or []
    
    # # Add columns
    # for col in baseTable.columns
    #   # Skip primary key if no joins
    #   if joinIds.length == 0 and col.primary
    #     continue 

    #   # Skip uuid fields unless primary
    #   if col.type == "uuid" and not col.primary
    #     continue

    #   if col.primary
    #     name = "Number of #{baseTable.name}"
    #     desc = ""
    #   else 
    #     name = col.name
    #     desc = col.desc

    #   # Filter by type
    #   if options.types and col.type not in options.types
    #     continue

    #   tree.push({
    #     id: col.id
    #     name: name
    #     desc: col.desc
    #     type: col.type
    #     value: {
    #       joinIds: joinIds
    #       expr: { type: "field", tableId: baseTable.id, columnId: col.id }
    #       }
    #     })

    # # Add joins
    # for join in @joins
    #   do (join) =>
    #     if join.startTableId == baseTable.id
    #       tree.push({
    #         id: join.id
    #         name: join.name
    #         desc: join.desc
    #         value: {
    #           joinIds: joinIds
    #           }
    #         getChildren: =>
    #           return @getJoinExprTree({ baseTableId: join.toTableId, joinIds: joinIds.concat([join.id]) })
    #         })
    # return tree

