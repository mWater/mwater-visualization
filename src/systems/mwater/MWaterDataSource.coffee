superagent = require("superagent")
DataSource = require '../../DataSource'

# Caching data source for mWater. Requires jQuery
module.exports = class MWaterDataSource extends DataSource
  constructor: (apiUrl, client) ->
    @apiUrl = apiUrl
    @client = client

  performQuery: (query, cb) ->
    superagent.get(@apiUrl + "jsonql")
      .query({ jsonql: JSON.stringify(query), client: @client })
      # Take up to 30 seconds old. This doesn't work in Chrome, but we try anyway
      .set({ "Cache-Control": "max-age=30,must-revalidate" })
      # .set({ "Cache-Control": "no-cache,must-revalidate" })
      .end (err, res) =>
        if err
          return cb(err)
        cb(null, res.body)
