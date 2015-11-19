React = require 'react'
ui = require './UIComponents'

module.exports = class TableSelectComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired
    value: React.PropTypes.string  # Current table id
    onChange: React.PropTypes.func.isRequired  # Newly selected table id

  @contextTypes:
    tableSelectElementFactory: React.PropTypes.func  # Can be overridden by setting tableSelectElementFactory in context that takes (schema, value, onChange)

  render: ->
    if @context.tableSelectElementFactory
      return @context.tableSelectElementFactory(@props.schema, @props.value, @props.onChange)    

    return React.createElement ui.ToggleEditComponent,
      forceOpen: not @props.value
      label: if @props.value then @props.schema.getTable(@props.value).name else H.i(null, "Select...")
      editor: (onClose) =>
        React.createElement(ui.OptionListComponent, 
          hint: "Select source to get data from"
          items: _.map(@props.schema.getTables(), (table) => { 
            name: table.name
            desc: table.desc
            onClick: () =>
              onClose() # Close popover first
              onChange(table.id)
          }))
