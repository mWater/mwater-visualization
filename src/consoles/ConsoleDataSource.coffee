# Data source for a console to help create the type-specific datasources that maps, dashboards and datagrids need.
module.exports = class ConsoleDataSource
  getDashboardTabDataSource: (tabId) ->  throw new Error("Not implemented")
  getMapTabDataSource: (tabId) ->  throw new Error("Not implemented")
  getDatagridTabDataSource: (tabId) ->  throw new Error("Not implemented")

  getDashboardPopupDataSource: (popupId) ->  throw new Error("Not implemented")
  getMapPopupDataSource: (popupId) ->  throw new Error("Not implemented")
  getDatagridPopupDataSource: (popupId) ->  throw new Error("Not implemented")
