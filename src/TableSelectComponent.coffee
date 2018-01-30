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

    # Some table select components (not the default) can also perform filtering. Include these props to enable this
    filter: PropTypes.object
    onFilterChange: PropTypes.func

  @contextTypes:
    tableSelectElementFactory: PropTypes.func  # Can be overridden by setting tableSelectElementFactory in context that takes ({ schema, value, onChange, filter, onFilterChange })
    locale: PropTypes.string  # e.g. "en"

    # Optional list of tables (ids) being used. Some overrides of the table select component may use this to present
    # an initially short list to select from
    activeTables: PropTypes.arrayOf(PropTypes.string.isRequired)  

  render: ->
    if @context.tableSelectElementFactory
      return @context.tableSelectElementFactory(@props)    

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
