_ = require 'lodash'
visualization = require './index'
jsyaml = require 'js-yaml'
TabbedComponent = require './TabbedComponent'
H = React.DOM
R = React.createElement

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

    # Convert to tabs
    if not design.tabs
      design = {
        tabs: [
          { name: "Main", design: design }
        ]
      }

    # Called to update the design and re-render
    updateDesign = (newDesign) ->
      design = newDesign
      window.localStorage["mwater-visualization-test-design"] = JSON.stringify(design)
      render()

    # Render the dashboard
    render = ->
      # dashboardElem = R(visualization.DashboardComponent, {
      #   design: design,
      #   widgetFactory: widgetFactory,
      #   onDesignChange: updateDesign
      # })
      elem = R(TabbedDashboard,
        design: design,
        widgetFactory: widgetFactory,
        onDesignChange: updateDesign
      )

      React.render(elem, document.getElementById(options.elemId))

    # Initial render
    render()

class TabbedDashboard extends React.Component
  @propTypes: 
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func.isRequired
    widgetFactory: React.PropTypes.object.isRequired

  handleDesignChange: (index, design) =>
    tabs = @props.design.tabs.slice()
    tabs[index] = _.extend({}, tabs[index], design: design)
    @props.onDesignChange(_.extend({}, @props.design, tabs: tabs))

  handleAddTab: =>
    tabs = @props.design.tabs.slice()
    # Add new dashboard
    tabs.push({ name: "Untitled", design: { items: {} } })
    @props.onDesignChange(_.extend({}, @props.design, tabs: tabs))

  handleRemoveTab: (index) =>
    if not confirm("Permanently remove this tab? This cannot be undone!")
      return
      
    tabs = @props.design.tabs.slice()
    tabs.splice(index, 1)
    @props.onDesignChange(_.extend({}, @props.design, tabs: tabs))

  handleRenameTab: (index) =>
    name = @props.design.tabs[index].name
    name = prompt("Name of tab", name)
    if name
      tabs = @props.design.tabs.slice()
      tabs[index] = _.extend({}, tabs[index], name: name)
      @props.onDesignChange(_.extend({}, @props.design, tabs: tabs))

  createTab: (tab, index) =>
    return {
      id: "#{index}"
      label: tab.name
      elem: R(visualization.DashboardComponent, {
        design: tab.design,
        widgetFactory: @props.widgetFactory,
        onDesignChange: @handleDesignChange.bind(null, index)
        extraTitleButtonsElem: [
          H.a key: "renametab", className: "btn btn-link btn-sm", onClick: @handleRenameTab.bind(null, index),
            H.span className: "glyphicon glyphicon-pencil"
            " Rename Tab"
          " "
          H.a key: "removetab", className: "btn btn-link btn-sm", onClick: @handleRemoveTab.bind(null, index),
            H.span className: "glyphicon glyphicon-remove"
            " Remove Tab"
        ]
      })
    }

  createTabs: ->
    return _.map(@props.design.tabs, @createTab)

  render: ->
    R(TabbedComponent,
      tabs: @createTabs()
      initialTabId: "0"
      onAddTab: @handleAddTab
      )
