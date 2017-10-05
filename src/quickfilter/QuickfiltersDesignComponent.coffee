PropTypes = require('prop-types')
React = require 'react'
H = React.DOM
R = React.createElement
update = require 'update-object'
TableSelectComponent = require '../TableSelectComponent'
ExprComponent = require('mwater-expressions-ui').ExprComponent
ExprUtils = require('mwater-expressions').ExprUtils
ui = require 'react-library/lib/bootstrap'

# Displays quick filters and allows their value to be modified
module.exports = class QuickfiltersDesignComponent extends React.Component
  @propTypes:
    design: PropTypes.array.isRequired  # Design of quickfilters. See README.md
    onDesignChange: PropTypes.func.isRequired # Called when design changes
    
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired

    table: PropTypes.string     # If present, forces table. TODO does not appear to be used

  @defaultProps:
    design: []

  handleDesignChange: (design) =>
    design = design.slice()
    
    # Update merged, clearing if not mergeable
    for index in [0...design.length]
      if design[index].merged and not @isMergeable(design, index)
        design[index] = _.extend({}, design[index], merged: false)

    @props.onDesignChange(design)

  # Determine if quickfilter at index is mergeable with previous (same type, id table and enum values)
  isMergeable: (design, index) ->
    if index == 0
      return false

    exprUtils = new ExprUtils(@props.schema)

    type = exprUtils.getExprType(design[index].expr)
    prevType = exprUtils.getExprType(design[index - 1].expr)

    idTable = exprUtils.getExprIdTable(design[index].expr)
    prevIdTable = exprUtils.getExprIdTable(design[index - 1].expr)

    enumValues = exprUtils.getExprEnumValues(design[index].expr)
    prevEnumValues = exprUtils.getExprEnumValues(design[index - 1].expr)

    if not type or type != prevType
      return false

    if idTable != prevIdTable
      return false

    if enumValues and not _.isEqual(_.pluck(enumValues, "id"), _.pluck(prevEnumValues, "id"))
      return false

    return true

  renderQuickfilter: (item, index) ->
    R QuickfilterDesignComponent, {
      key: index
      design: item
      schema: @props.schema
      dataSource: @props.dataSource
      table: @props.table
      mergeable: @isMergeable(@props.design, index)
      onChange: (newItem) => 
        design = @props.design.slice()
        design[index] = newItem
        @handleDesignChange(design)

      onRemove: @handleRemove.bind(null, index)
    }

  handleAdd: =>
    # Add blank to end
    design = @props.design.concat([{ }])
    @props.onDesignChange(design)

  handleRemove: (index) =>
    design = @props.design.slice()
    design.splice(index, 1)
    @props.onDesignChange(design)

  render: ->
    H.div null,
      _.map @props.design, (item, index) => @renderQuickfilter(item, index)

      H.button type: "button", className: "btn btn-sm btn-default", onClick: @handleAdd,
        H.span className: "glyphicon glyphicon-plus"
        " Add Quick Filter"

class QuickfilterDesignComponent extends React.Component
  @propTypes:
    design: PropTypes.object.isRequired  # Design of a single quickfilters. See README.md
    onChange: PropTypes.func.isRequired
    onRemove: PropTypes.func.isRequired
    mergeable: PropTypes.bool            # True if can be merged

    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired

    table: PropTypes.string     # If present, forces table

  constructor: (props) ->
    super

    # Store table to allow selecting table first, then expression
    @state = {
      table: props.table or props.design.expr?.table
    }

  componentWillReceiveProps: (nextProps) ->
    table = nextProps.table or nextProps.design.expr?.table
    if table and table != @state.table
      @setState(table: table)

  handleTableChange: (table) => 
    @setState(table: table)
    design = {
      expr: null
      label: null
    }
    @props.onChange(design)

  handleExprChange: (expr) => @props.onChange(update(@props.design, { expr: { $set: expr }}))
  handleLabelChange: (ev) => @props.onChange(update(@props.design, { label: { $set: ev.target.value }}))
  handleMergedChange: (merged) => @props.onChange(update(@props.design, { merged: { $set: merged }}))

  render: ->
    R RemovableComponent, onRemove: @props.onRemove, 
      H.div className: "panel panel-default",
        H.div className: "panel-body",
          # If table not forced
          if not @props.table
            H.div className: "form-group", key: "table",
              H.label className: "text-muted", "Data Source"
              R TableSelectComponent, schema: @props.schema, value: @state.table, onChange: @handleTableChange

          if @state.table
            H.div className: "form-group", key: "expr",
              H.label className: "text-muted", "Filter By"
              H.div null,
                R ExprComponent,
                  schema: @props.schema
                  dataSource: @props.dataSource
                  table: @state.table
                  value: @props.design.expr
                  onChange: @handleExprChange
                  types: ['enum', 'text', 'date', 'datetime']

          if @props.design.expr
            H.div className: "form-group", key: "label",
              H.label className: "text-muted", "Label"
              H.input type: "text", className: "form-control input-sm", value: @props.design.label or "", onChange: @handleLabelChange, placeholder: "Optional Label"

          if @props.mergeable
            R ui.Checkbox, 
              value: @props.design.merged
              onChange: @handleMergedChange,
                "Merge with previous quickfilter"


# Floats an x to the right on hover
class RemovableComponent extends React.Component
  @propTypes:
    onRemove: PropTypes.func.isRequired

  render: ->
    H.div style: { display: "flex" }, className: "hover-display-parent",
      H.div style: { flex: "1 1 auto" }, key: "main", 
        @props.children
      H.div style: { flex: "0 0 auto", alignSelf: "center" }, className: "hover-display-child", key: "remove",
        H.a onClick: @props.onRemove, style: { fontSize: "80%", cursor: "pointer", marginLeft: 5 },
          H.span className: "glyphicon glyphicon-remove"
