PropTypes = require 'prop-types'
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

datagridDesign = require './datagridDesign'

storiesOf = require('@kadira/storybook').storiesOf

DatagridComponent = require '../src/datagrids/DatagridComponent'
DirectDatagridDataSource = require '../src/datagrids/DirectDatagridDataSource'
MWaterLoaderComponent = require '../src/MWaterLoaderComponent'
UpdateableComponent = require './UpdateableComponent'

storiesOf('Datagrid', module)
  .add 'datagrid with serial number', => 
    R SerialNumberDatagrid, design: datagridDesign


class SerialNumberDatagrid extends React.Component
  @propTypes:
    design: PropTypes.object.isRequired

  render: ->
    R UpdateableComponent, 
      design: @props.design
      (state, update) =>
        apiUrl = "https://api.mwater.co/v3/"
        R MWaterLoaderComponent, {
          apiUrl: apiUrl
          client: null
          user: null
          # onExtraTablesChange: (extraTables) => @setState(extraTables: extraTables)
          # extraTables: @state.extraTables
        }, (error, config) =>
          if error
            alert("Error: " + error.message)
            return null

          datagridDataSource = new DirectDatagridDataSource({
            # apiUrl: apiUrl
            # client: null
            # design: state.design
            schema: config.schema
            dataSource: config.dataSource
          })

          H.div style: { height: 800 },
            React.createElement(DatagridComponent, {
              schema: config.schema
              dataSource: config.dataSource
              datagridDataSource: datagridDataSource
              design: state.design
              onDesignChange: update("design")
              titleElem: "Sample"
              height: 400
              # quickfilterLocks: [{ expr: { type: "field", table: "entities.water_point", column: "type" }, value: "Protected dug well" }]
            })