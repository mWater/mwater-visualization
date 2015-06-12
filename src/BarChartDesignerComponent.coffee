H = React.DOM
ScalarExprComponent = require './ScalarExprComponent'

module.exports = class BarChartDesignerComponent extends React.Component
  render: ->
    expr = null

    H.div null,
      H.div className: "form-group",
        H.label null, "Bar size"
        React.createElement(ScalarExprComponent, 
          editorTitle: "Bar size"
          schema: @props.schema
          value: null)
        H.p className: "help-block", "Data to control the size of the bars"

      H.div className: "form-group",
        H.label null, "Group By"
        H.input type: "text", className: "form-control", placeholder: "Click to select..."
