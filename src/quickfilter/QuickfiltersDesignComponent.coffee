React = require 'react'
H = React.DOM
R = React.createElement
update = require 'update-object'
TableSelectComponent = require '../TableSelectComponent'
ExprComponent = require('mwater-expressions-ui').ExprComponent

# Displays quick filters and allows their value to be modified
module.exports = class QuickfiltersDesignComponent extends React.Component
  @propTypes:
    design: React.PropTypes.array.isRequired  # Design of quickfilters. See README.md
    onDesignChange: React.PropTypes.func.isRequired # Called when design changes
    
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired

  @defaultProps:
    design: []

  renderQuickfilter: (item, index) ->
    R QuickfilterDesignComponent, {
      key: index
      design: item
      schema: @props.schema
      dataSource: @props.dataSource
      onChange: (newItem) => 
        design = @props.design.slice()
        design[index] = newItem
        @props.onDesignChange(design)

      onRemove: @handleRemove.bind(null, index)
    }

  handleAdd: =>
    # Add blank to end
    design = @props.design.concat([{}])
    @props.onDesignChange(design)

  handleRemove: (index) =>
    design = @props.design.slice()
    design.splice(index, 1)
    @props.onDesignChange(design)

  render: ->
    H.div null,
      H.h4 null, "Quick Filters"
      H.div className: "text-muted", 
        "Quick filters are shown to the user at the top of the dashboard and can be used to filter data of widgets."

      _.map @props.design, (item, index) => @renderQuickfilter(item, index)

      H.button type: "button", className: "btn btn-sm btn-default", onClick: @handleAdd,
        H.span className: "glyphicon glyphicon-plus"
        " Add Quick Filter"

class QuickfilterDesignComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired  # Design of a single quickfilters. See README.md
    onChange: React.PropTypes.func.isRequired
    onRemove: React.PropTypes.func.isRequired

    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired

  handleTableChange: (table) => 
    design = {
      table: table
      expr: null
      label: null
    }
    @props.onChange(design)

  handleExprChange: (expr) => @props.onChange(update(@props.design, { expr: { $set: expr }}))
  handleLabelChange: (ev) => @props.onChange(update(@props.design, { label: { $set: ev.target.value }}))

  render: ->
    R RemovableComponent, onRemove: @props.onRemove, 
      H.div className: "panel panel-default",
        H.div className: "panel-body",
          H.div className: "form-group", key: "table",
            H.label className: "text-muted", "Data Source"
            R TableSelectComponent, schema: @props.schema, value: @props.design.table, onChange: @handleTableChange

          if @props.design.table
            H.div className: "form-group", key: "expr",
              H.label className: "text-muted", "Filter By"
              H.div null,
                R ExprComponent,
                  schema: @props.schema
                  dataSource: @props.dataSource
                  table: @props.design.table
                  value: @props.design.expr
                  onChange: @handleExprChange
                  types: ['enum', 'text', 'date', 'datetime']

          if @props.design.expr
            H.div className: "form-group", key: "label",
              H.label className: "text-muted", "Label"
              H.input type: "text", className: "form-control input-sm", value: @props.design.label or "", onChange: @handleLabelChange, placeholder: "Optional Label"


# Floats an x to the right on hover
class RemovableComponent extends React.Component
  @propTypes:
    onRemove: React.PropTypes.func.isRequired

  render: ->
    H.div style: { display: "flex" }, className: "hover-display-parent",
      H.div style: { flex: "1 1 auto" }, key: "main", 
        @props.children
      H.div style: { flex: "0 0 auto", alignSelf: "center" }, className: "hover-display-child", key: "remove",
        H.a onClick: @props.onRemove, style: { fontSize: "80%", cursor: "pointer", marginLeft: 5 },
          H.span className: "glyphicon glyphicon-remove"
