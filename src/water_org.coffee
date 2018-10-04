PropTypes = require('prop-types')
_ = require 'lodash'
visualization = require './index'
jsyaml = require 'js-yaml'
TabbedComponent = require('react-library/lib/TabbedComponent')
React = require 'react'
R = React.createElement

# Pass in:
# schemaUrl (yaml schema url)
# queryUrl (will replace {query} with query)
# loadDesignUrl (gets the current design)
# saveDesignUrl (sets the current design)
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

    # Get the design
    $.get options.loadDesignUrl, (designString) ->
      if designString
        design = JSON.parse(designString)
      else
        # Use default
        design = options.design

      # Convert to tabs if not already 
      if not design.tabs
        design = {
          tabs: [
            { name: "Main", design: design }
          ]
        }

      # Called to update the design and re-render
      updateDesign = (newDesign) ->
        design = newDesign

        # Save to database
        $.post(options.saveDesignUrl, { userdata: JSON.stringify(design) })

        render()

      # Render the dashboard
      render = ->
        elem = R(TabbedDashboard,
          design: design,
          widgetFactory: widgetFactory,
          onDesignChange: updateDesign
        )

        ReactDOM.render(elem, document.getElementById(options.elemId))

      # Initial render
      render()

class TabbedDashboard extends React.Component
  @propTypes: 
    design: PropTypes.object.isRequired
    onDesignChange: PropTypes.func.isRequired
    widgetFactory: PropTypes.object.isRequired

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
          R 'a', key: "renametab", className: "btn btn-link btn-sm", onClick: @handleRenameTab.bind(null, index),
            R 'span', className: "glyphicon glyphicon-pencil"
            " Rename Tab"
          " "
          R 'a', key: "removetab", className: "btn btn-link btn-sm", onClick: @handleRemoveTab.bind(null, index),
            R 'span', className: "glyphicon glyphicon-remove"
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
