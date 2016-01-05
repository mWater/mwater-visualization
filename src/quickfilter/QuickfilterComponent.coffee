React = require 'react'
H = React.DOM
ReactSelect = require 'react-select'

# Displays quick filters and allows their value to be modified
module.exports = class QuickfilterComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired  # Design of quickfilter. See README.md
    value: React.PropTypes.object              # Current value of quickfilter (state of filters selected)
    onValueChange: React.PropTypes.func.isRequired # Called when value changes
    
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired

  render: ->
    H.div null,
      H.span style: { color: "gray" }, "Program" + ":\u00a0"
      H.div style: { display: "inline-block", minWidth: "10em", verticalAlign: "middle" },
        React.createElement ReactSelect, {
          placeholder: "All"
          value: @props.value
          multi: false
          options: [{ value: "a", label: "Apple"}, { value: "b", label: "Banana"}]
          onChange: @props.onValueChange
        }
      "\u00a0"
      "\u00a0"
      "\u00a0"
      H.span style: { color: "gray" }, "Initiative" + ":\u00a0"
      H.div style: { display: "inline-block", minWidth: "10em", verticalAlign: "middle" },
        React.createElement ReactSelect, {
          placeholder: "All"
          value: @props.value
          multi: false
          options: [{ value: "a", label: "Apple"}, { value: "b", label: "Banana"}]
          onChange: @props.onValueChange
        }



