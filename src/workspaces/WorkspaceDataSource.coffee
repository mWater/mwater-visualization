# Data source for a workspace to help create the type-specific datasources that maps, dashboards and datagrids need.
module.exports = class WorkspaceDataSource
  getDashboardDataSource: (tabId) ->  throw new Error("Not implemented")
  getMapDataSource: (tabId) ->  throw new Error("Not implemented")
  getDatagridDataSource: (tabId) ->  throw new Error("Not implemented")
