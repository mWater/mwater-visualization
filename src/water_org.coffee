visualization = require './index'
jsyaml = require 'js-yaml'

# Pass in:
# schemaUrl (yaml schema url)
# queryUrl (will replace {query} with query)
# design (initial design)
# elemId (id of to render into)
exports.loadDashboard = (options) ->
  # First get the schema 
  $.get options.schemaUrl, (schemaYaml) ->
    # Load the schema
    schema = new visualization.Schema()
    schemaJson = jsyaml.safeLoad(schemaYaml)
    schema.loadFromJSON(schemaJson)

    # Create the data source
    dataSource = new visualization.CachingDataSource({
        perform: (query, cb) ->
          url = options.queryUrl.replace(/\{query\}/, encodeURIComponent(JSON.stringify(query)))
          $.getJSON(url, (rows) ->
            cb(null, rows)
          ).fail((xhr) ->
            console.error(xhr.responseText)
            cb(new Error(xhr.responseText))
          )
      })

    # Create the widget factory
    widgetFactory = new visualization.WidgetFactory({ schema: schema, dataSource: dataSource })

    # Get from local storage
    design = options.design
    if window.localStorage["mwater-visualization-test-design"]
      design = JSON.parse(window.localStorage["mwater-visualization-test-design"])

    # Called to update the design and re-render
    updateDesign = (newDesign) ->
      design = newDesign
      window.localStorage["mwater-visualization-test-design"] = JSON.stringify(design)
      render()

    # Render the dashboard
    render = ->
      dashboardElem = React.createElement(visualization.DashboardComponent, {
        design: design,
        widgetFactory: widgetFactory,
        onDesignChange: updateDesign
      })

      React.render(dashboardElem, document.getElementById(options.elemId))

    # Initial render
    render()