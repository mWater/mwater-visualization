_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

storiesOf = require('@kadira/storybook').storiesOf
action = require('@kadira/storybook').action

WidgetFactory = require '../src/widgets/WidgetFactory'
DirectWidgetDataSource = require '../src/widgets/DirectWidgetDataSource'
MWaterLoaderComponent = require '../src/MWaterLoaderComponent'

storiesOf('Pivot Chart', module)
  .add 'blank', => 
    return R UpdateableComponent, 
      design: {},
      (state, update) =>
        R MWaterLoaderComponent, {
          apiUrl: "https://api.mwater.co/v3/"
          client: null
          user: null
          # onExtraTablesChange: (extraTables) => @setState(extraTables: extraTables)
          # extraTables: @state.extraTables
        }, (error, config) =>
          if error
            alert("Error: " + error.message)
            return null

          widget = WidgetFactory.createWidget("WidgetFactory")
      
          widgetDataSource = new DirectWidgetDataSource({
            widget: widget
            schema: config.schema
            dataSource: config.dataSource
          })

          widget.createViewElement({
            schema: config.schema
            dataSource: config.dataSource
            widgetDataSource: widgetDataSource
            design: state.design
            scope: null
            filters: null
            onScopeChange: null
            onDesignChange: update("design")
            width: 800
          })

# Convenience wrapper that allows updating state
class UpdateableComponent extends React.Component
  constructor: (props) ->
    super
    @state = _.clone(@props or {})

  # Creates update function
  update: (name) =>
    return (value) =>
      upt = {}
      upt[name] = value
      @setState(upt)
      action("update")(upt)

  render: ->
    @props.children(@state, @update)

