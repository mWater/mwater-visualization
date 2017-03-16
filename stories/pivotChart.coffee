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
  .add 'water types', => 
    R PivotTest, design: {
      table: "entities.water_point"
      rows: [
        { 
          id: "row1"
          valueAxis: { expr: { type: "field", table: "entities.water_point", column: "type" } }
        }
      ]
      columns: [{ id: "col1", label: "Test" }]
      intersections: {
        "row1:col1": {
          valueAxis: { expr: { type: "op", op: "count", table: "entities.water_point", exprs: [] } }
        }
      }
    }

  .add 'water types with label', => 
    R PivotTest, design: {
      table: "entities.water_point"
      rows: [
        { 
          id: "row1"
          valueAxis: { expr: { type: "field", table: "entities.water_point", column: "type" } }
          label: "Type"
        }
      ]
      columns: [{ id: "col1", label: "Count" }]
      intersections: {
        "row1:col1": {
          valueAxis: { expr: { type: "op", op: "count", table: "entities.water_point", exprs: [] } }
        }
      }
    }

  .add 'water types by functionality', => 
    R PivotTest, design: {
      table: "entities.water_point"
      rows: [
        { 
          id: "row1"
          valueAxis: { expr: { type: "field", table: "entities.water_point", column: "type" } }
          label: "Type"
        }
      ]
      columns: [
        { 
          id: "col1"
          valueAxis: {"expr":{"type":"scalar","table":"entities.water_point","joins":["!indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9.Water point"],"expr":{"type":"op","op":"last","table":"indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9","exprs":[{"type":"field","table":"indicator_values:c0adc9f1c9be4271af9d722b7e50b4c9","column":"Functionality"}]}}}
          label: "Functionality"
        }
      ]
      intersections: {
        "row1:col1": {
          valueAxis: { expr: { type: "op", op: "count", table: "entities.water_point", exprs: [] } }
        }
      }
    }


class PivotTest extends React.Component
  render: ->
    R UpdateableComponent, 
      design: @props.design,
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

