
# Data source for a datagrid that allows client-server model that supports sharing of datagrids
module.exports = class DashboardDataSource
  # Gets the rows specified
  getRows: (design, offset, limit, filters, callback) ->
    throw new Error("Not implemented")
