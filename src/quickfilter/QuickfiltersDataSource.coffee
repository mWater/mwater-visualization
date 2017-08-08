# Data source that returns values for text-based quickfilters. Allows client-server model that supports sharing 
module.exports = class QuickfiltersDataSource
  # Gets the values of the quickfilter at index
  getValues: (index, expr, filters, offset, limit, callback) ->
    throw new Error("Not implemented")