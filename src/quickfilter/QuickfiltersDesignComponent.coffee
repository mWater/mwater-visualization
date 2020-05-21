_ = require 'lodash'
PropTypes = require('prop-types')
React = require 'react'
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

    tables: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired    # List of possible table ids to use

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

    multi = design[index].multi or false
    prevMulti = design[index].multi or false

    if multi != prevMulti
      return false

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
      tables: @props.tables
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
    R 'div', null,
      _.map @props.design, (item, index) => @renderQuickfilter(item, index)

      if @props.tables.length > 0
        R 'button', type: "button", className: "btn btn-sm btn-default", onClick: @handleAdd,
          R 'span', className: "glyphicon glyphicon-plus"
          " Add Quick Filter"

class QuickfilterDesignComponent extends React.Component
  @propTypes:
    design: PropTypes.object.isRequired  # Design of a single quickfilters. See README.md
    onChange: PropTypes.func.isRequired
    onRemove: PropTypes.func.isRequired
    mergeable: PropTypes.bool            # True if can be merged

    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired

    tables: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired    # List of possible table ids to use

  constructor: (props) ->
    super(props)

    # Store table to allow selecting table first, then expression
    @state = {
      table: props.design.expr?.table or props.tables[0] 
    }

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
  handleMultiChange: (multi) => @props.onChange(update(@props.design, { multi: { $set: multi }}))

  render: ->
    # Determine type of expression
    exprType = new ExprUtils(@props.schema).getExprType(@props.design.expr)

    R RemovableComponent, onRemove: @props.onRemove, 
      R 'div', className: "panel panel-default",
        R 'div', className: "panel-body",
          R 'div', className: "form-group", key: "table",
            R 'label', className: "text-muted", "Data Source"
            R ui.Select,
              value: @state.table
              options: _.map(@props.tables, (table) => { value: table, label: ExprUtils.localizeString(@props.schema.getTable(table).name) })
              onChange: @handleTableChange
              nullLabel: "Select..."

          R 'div', className: "form-group", key: "expr",
            R 'label', className: "text-muted", "Filter By"
            R 'div', null,
              R ExprComponent,
                schema: @props.schema
                dataSource: @props.dataSource
                table: @state.table
                value: @props.design.expr
                onChange: @handleExprChange
                types: ['enum', 'text', 'enumset', 'date', 'datetime', 'id[]']

          if @props.design.expr
            R 'div', className: "form-group", key: "label",
              R 'label', className: "text-muted", "Label"
              R 'input', type: "text", className: "form-control input-sm", value: @props.design.label or "", onChange: @handleLabelChange, placeholder: "Optional Label"

          if @props.mergeable
            R ui.Checkbox, 
              value: @props.design.merged
              onChange: @handleMergedChange,
                "Merge with previous quickfilter "
                R 'span', className: "text-muted", "- displays as one single control that filters both"

          if exprType in ['enum', 'text', 'enumset', 'id[]']
            R ui.Checkbox, 
              value: @props.design.multi
              onChange: @handleMultiChange,
                "Allow multiple selections"

# Floats an x to the right on hover
class RemovableComponent extends React.Component
  @propTypes:
    onRemove: PropTypes.func.isRequired

  render: ->
    R 'div', style: { display: "flex" }, className: "hover-display-parent",
      R 'div', style: { flex: "1 1 auto" }, key: "main", 
        @props.children
      R 'div', style: { flex: "0 0 auto", alignSelf: "center" }, className: "hover-display-child", key: "remove",
        R 'a', onClick: @props.onRemove, style: { fontSize: "80%", cursor: "pointer", marginLeft: 5 },
          R 'span', className: "glyphicon glyphicon-remove"
