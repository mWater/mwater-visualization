DatagridDataSource = require './DatagridDataSource'
DatagridQueryBuilder = require './DatagridQueryBuilder'

# Uses direct DataSource queries
module.exports = class DirectDatagridDataSource
  # Create dashboard data source that uses direct jsonql calls
  # options:
  #   schema: schema to use
  #   dataSource: data source to use
  constructor: (options) ->
    @options = options

  # Gets the rows specified
  getRows: (design, offset, limit, filters, callback) ->
    queryBuilder = new DatagridQueryBuilder(@options.schema)
    
    # Create query to get the page of rows at the specific offset
    query = queryBuilder.createQuery(design, { 
      offset: offset
      limit: limit
      extraFilters: filters
    })

    @options.dataSource.performQuery(query, callback)
