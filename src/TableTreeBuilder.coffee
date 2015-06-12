# Builds a table tree which is a tree of tables + columns that follow joins

module.exports = class TableTreeBuilder
  # Returns array of tables, each with:
  # { table: table id, getChildren: gets list of children }
  # Children are array of:
  # { 
  #  startTable: table id that started at, 
  #  endTable: end table id, 
  #  endColumn: end column id, 
  #  joins: array of join column ids followed
  #  getChildren: present if join. Gets list of children 
  #  selectable: true if selectable, false if placeholder
  # }
  # options are:
  #  startTable: to limit start table to a specific table
  #  excludeColumnTypes: types to exclude as columns
  getTree: (schema, options) ->
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
    #     if join.fromTableId == baseTable.id
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

