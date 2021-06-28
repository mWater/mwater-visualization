PropTypes = require 'prop-types'
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

datagridDesign = require './datagridDesign'

storiesOf = require('@kadira/storybook').storiesOf

ExprComponent = require("mwater-expressions-ui").ExprComponent
MWaterLoaderComponent = require '../src/MWaterLoaderComponent'
UpdateableComponent = require './UpdateableComponent'

storiesOf('ExprComponent', module)
  .add 'blank', => 
    R UpdateableComponent, 
      value: null
      (state, update) =>
        # apiUrl = "https://api.mwater.co/v3/"
        apiUrl = "http://localhost:1234/v3/"
        R MWaterLoaderComponent, {
          apiUrl: apiUrl
          client: null
          user: null
          onExtraTablesChange: update("extraTables")
          extraTables: state.extraTables
        }, (error, config) =>
          if error
            alert("Error: " + error.message)
            return null

          React.createElement(ExprComponent, {
            schema: config.schema
            dataSource: config.dataSource
            table: "entities.water_point"
            value: state.value
            onChange: update("value")
          })