WorkspaceDataSource = require './WorkspaceDataSource'

DirectDashboardDataSource = require '../dashboards/DirectDashboardDataSource'
DirectMapDataSource = require '../dashboards/DirectMapDataSource'
DirectDatagridDataSource = require '../dashboards/DirectDatagridDataSource'

# Data source for a workspace to help create the type-specific datasources that maps, dashboards and datagrids need.
module.exports = class DirectWorkspaceDataSource extends WorkspaceDataSource
  # Create workspace data source that uses direct jsonql calls
  # options:
  #   schema: schema to use
  #   dataSource: data source to use
  #   design: design of entire workspace TODO why is this needed
  #   apiUrl: API url to use for talking to mWater server
  #   client: client id to use for talking to mWater server
  constructor: (options) ->
    @options = options

  getDashboardDataSource: (tabId) ->  

  getMapDataSource: (tabId) ->
    return new DirectMapDataSource({
      schema: @options.schema
      dataSource: @options.dataSource
      design: design

    })
TODO: what about popups? they also need data sources.

WHY DO DASHBOARDS need design in direct dataSource?


  # Create map url source that uses direct jsonql maps
  # options:
  #   schema: schema to use
  #   dataSource: general data source
  #   design: design of entire map
  #   apiUrl: API url to use for talking to mWater server
  #   client: client id to use for talking to mWater server
  #   mapId: map _id to allow server printing


  getDatagridDataSource: (tabId) ->
    return new DirectDatagridDataSource({
      schema: @options.schema
      dataSource: @options.dataSource
    })
