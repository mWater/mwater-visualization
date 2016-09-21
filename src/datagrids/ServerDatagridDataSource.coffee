querystring = require 'querystring'
DatagridDataSource = require './DatagridDataSource'

# Uses mWater server to get datagrid data to allow sharing with unprivileged users
module.exports = class ServerDatagridDataSource extends DatagridDataSource
  # options:
  #   apiUrl: API url to use for talking to mWater server
  #   client: client id to use for talking to mWater server
  #   share: share id to use for talking to mWater server
  #   datagridId: dashboard id to use on server
  #   rev: revision to use to allow caching
  constructor: (options) ->
    @options = options

  # Get the data that the widget needs. The widget should implement getData method (see above) to get the data from the server
  #  design: design of the widget. Ignored in the case of server-side rendering
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  getRows: (design, offset, limit, filters, callback) ->
    query = {
      client: @options.client
      share: @options.share
      filters: JSON.stringify(filters)
      rev: @options.rev
      offset: offset
      limit: limit
    }

    url = @options.apiUrl + "datagrids/#{@options.datagridId}/data?" + querystring.stringify(query)

    $.getJSON url, (data) =>
      callback(null, data)
    .fail (xhr) =>
      console.log xhr.responseText
      callback(new Error(xhr.responseText))
