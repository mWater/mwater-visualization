PropTypes = require('prop-types')
React = require 'react'
ui = require './UIComponents'
ExprUtils = require("mwater-expressions").ExprUtils
H = React.DOM

module.exports = class TableSelectComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired
    value: PropTypes.string  # Current table id
    onChange: PropTypes.func.isRequired  # Newly selected table id

  @contextTypes:
    tableSelectElementFactory: PropTypes.func  # Can be overridden by setting tableSelectElementFactory in context that takes (schema, value, onChange)
    locale: PropTypes.string  # e.g. "en"

  render: ->
    if @context.tableSelectElementFactory
      return @context.tableSelectElementFactory(@props.schema, @props.value, @props.onChange)    

    return React.createElement ui.ToggleEditComponent,
      forceOpen: not @props.value
      label: if @props.value then ExprUtils.localizeString(@props.schema.getTable(@props.value).name, @context.locale) else H.i(null, "Select...")
      editor: (onClose) =>
        React.createElement(ui.OptionListComponent, 
          hint: "Select source to get data from"
          items: _.map(_.filter(@props.schema.getTables(), (table) -> not table.deprecated), (table) => { 
            name: ExprUtils.localizeString(table.name, @context.locale)
            desc: ExprUtils.localizeString(table.desc, @context.locale)
            onClick: () =>
              onClose()
              @props.onChange(table.id)
          }))
