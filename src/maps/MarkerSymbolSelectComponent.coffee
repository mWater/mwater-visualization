PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement
ReactSelect = require('react-select').default
mapSymbols = require('./mapSymbols').mapSymbols

# Allows selecting of map marker symbol
module.exports = class MarkerSymbolSelectComponent extends React.Component
  @propTypes:
    symbol: PropTypes.string
    onChange: PropTypes.func.isRequired

  render: ->
    # Create options
    options = _.pluck(mapSymbolsm, "value", "label")

    optionRenderer = (option) ->
      return R 'span', null,
        R 'i', className: "fa fa-#{option.value.substr(13)}" # Trim "font-awesome/"
        " #{option.label}"

    return R 'div', className: "form-group",
      R 'label', className: "text-muted", 
        R('span', className: "fa fa-star")
        " "
        "Symbol"
      R ReactSelect, {
        placeholder: "Circle"
        value: _.findWhere(options, value: @props.symbol) or null
        options: options
        formatOptionLabel: optionRenderer
        isClearable: true
        onChange: (opt) => @props.onChange(opt?.value or null)
      }
