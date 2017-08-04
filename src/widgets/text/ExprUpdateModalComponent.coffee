PropTypes = require('prop-types')
React = require 'react'
H = React.DOM
R = React.createElement

ExprUtils = require("mwater-expressions").ExprUtils
ExprComponent = require("mwater-expressions-ui").ExprComponent
ActionCancelModalComponent = require("react-library/lib/ActionCancelModalComponent")
TableSelectComponent = require '../../TableSelectComponent'

ExprItemEditorComponent = require './ExprItemEditorComponent'

# Modal that displays an expression builder for updating an expression
module.exports = class ExprUpdateModalComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired   # Schema to use
    dataSource: PropTypes.object.isRequired # Data source to use to get values
    singleRowTable: PropTypes.string  # Table that is filtered to have one row

  constructor: ->
    super

    @state = {
      open: false
      exprItem: null
      onUpdate: null
    }

  open: (item, onUpdate) ->
    @setState(open: true, exprItem: item, onUpdate: onUpdate)

  render: ->
    if not @state.open
      return null

    R ActionCancelModalComponent, 
      actionLabel: "Update"
      onAction: => 
        # Close first to avoid strange effects when mixed with pojoviews
        @setState(open: false, =>
          @state.onUpdate(@state.exprItem)
        )
      onCancel: => @setState(open: false)
      title: "Update Field",
        R ExprItemEditorComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          exprItem: @state.exprItem
          onChange: (exprItem) => @setState(exprItem: exprItem)
          singleRowTable: @props.singleRowTable