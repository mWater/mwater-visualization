# Get widget data directly from the dataSource
module.exports = class DirectWidgetDataSource
  # options:
  #   widget: widget object
  #   schema: schema to use
  #   dataSource: general data source
  #   apiUrl: API url to use for talking to mWater server. Not needed if no map widgets
  #   client: client id to use for talking to mWater server. Not needed if no map widgets
  constructor: (options) ->
    @options = options

  # Get the data that the widget needs. The widget should implement getData method (see above) to get the actual data on the server
  #  design: design of the widget. Ignored in the case of server-side rendering
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  #  callback: (error, data)
  getData: (design, filters, callback) ->
    @options.widget.getData(design, @options.schema, @options.dataSource, filters, callback)

  # For map widgets, the following is required
  #  design: design of the widget. Ignored in the case of server-side rendering
  getMapDataSource: (design) ->
    DirectMapDataSource = require('../maps/DirectMapDataSource').default
    return new DirectMapDataSource({ apiUrl: @options.apiUrl, client: @options.client, design: design, schema: @options.schema, dataSource: @options.dataSource })

  # Get the url to download an image (by id from an image or imagelist column)
  # Height, if specified, is minimum height needed. May return larger image
  getImageUrl: (imageId, height) ->
    return @options.dataSource.getImageUrl(imageId, height)
