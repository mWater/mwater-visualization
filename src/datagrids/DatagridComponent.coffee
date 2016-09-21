_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

AutoSizeComponent = require('react-library/lib/AutoSizeComponent')
ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent')
DatagridViewComponent = require './DatagridViewComponent'
DatagridDesignerComponent = require './DatagridDesignerComponent'
DatagridUtils = require './DatagridUtils'
QuickfiltersComponent = require '../quickfilter/QuickfiltersComponent'
QuickfilterCompiler = require '../quickfilter/QuickfilterCompiler'

# Datagrid with decorations 
# See README.md for description of datagrid format
# Design should be cleaned already before being passed in (see DatagridUtils)
module.exports = class DatagridComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired     # schema to use
    dataSource: React.PropTypes.object.isRequired # dataSource to use
    datagridDataSource: React.PropTypes.object.isRequired # datagrid dataSource to use

    design: React.PropTypes.object.isRequired     # Design of datagrid. See README.md of this folder
    onDesignChange: React.PropTypes.func          # Called when design changes

    titleElem: React.PropTypes.node                     # Extra element to include in title at left
    extraTitleButtonsElem: React.PropTypes.node         # Extra elements to add to right

    # Check if cell is editable
    # If present, called with (tableId, rowId, expr, callback). Callback should be called with (error, true/false)
    canEditCell: React.PropTypes.func             

    # Update cell value
    # Called with (tableId, rowId, expr, value, callback). Callback should be called with (error)
    updateCell:  React.PropTypes.func

    # Called when row is double-clicked with (tableId, rowId)
    onRowDoubleClick: React.PropTypes.func

  constructor: (props) ->
    super(props)

    @state = {
      editingDesign: null   # Design being edited
      cellEditingEnabled: false  # True if cells can be edited directly
      quickfiltersValues: null
    }

  handleCellEditingToggle: =>
    if @state.cellEditingEnabled
      @setState(cellEditingEnabled: false)
    else
      if confirm("Turn on cell editing? This is allow you to edit the live data and is an advanced feature.")
        @setState(cellEditingEnabled: true)

  handleEdit: =>
    @setState(editingDesign: @props.design)

  # Toggle to allow cell editing
  renderCellEdit: ->
    if not @props.canEditCell or not @props.onDesignChange?
      return null

    label = [
      H.i className: if @state.cellEditingEnabled then "fa fa-fw fa-check-square" else "fa fa-fw fa-square-o"
      " "
      "Cell Editing"
    ]

    return H.a 
      key: "cell-edit"
      className: "btn btn-link btn-sm"
      onClick: @handleCellEditingToggle,
        label

  renderEditButton: ->
    if not @props.onDesignChange
      return null

    H.button 
      type: "button"
      className: "btn btn-primary"
      onClick: @handleEdit,
        H.span className: "glyphicon glyphicon-cog"
        " "
        "Settings"

  renderTitleBar: ->
    H.div style: { position: "absolute", top: 0, left: 0, right: 0, height: 40, padding: 4 },
      H.div style: { float: "right" },
        @renderCellEdit()
        @renderEditButton()
        @props.extraTitleButtonsElem
      @props.titleElem

  renderQuickfilter: ->
    H.div style: { position: "absolute", top: 40, left: 0, right: 0, height: 50 },    
      R QuickfiltersComponent, {
        design: @props.design.quickfilters
        schema: @props.schema
        dataSource: @props.dataSource
        values: @state.quickfiltersValues
        table: @props.design.table
        onValuesChange: (values) => @setState(quickfiltersValues: values)
      }

  # Renders the editor modal
  renderEditor:  ->
    if not @state.editingDesign
      return

    R ActionCancelModalComponent, 
      onAction: => 
        @props.onDesignChange(@state.editingDesign)
        @setState(editingDesign: null)

      onCancel: => @setState(editingDesign: null)
      size: "large",
        R DatagridDesignerComponent,
          schema: @props.schema
          dataSource: @props.dataSource
          design: @state.editingDesign
          onDesignChange: (design) => @setState(editingDesign: design)

  render: ->
    # Compile quickfilters
    filters = new QuickfilterCompiler(@props.schema).compile(@props.design.quickfilters, @state.quickfiltersValues)

    hasQuickfilters = @props.design.quickfilters?[0]?

    return H.div style: { width: "100%", height: "100%", position: "relative", paddingTop: (if hasQuickfilters then 90 else 40) },
      @renderTitleBar()
      @renderQuickfilter()

      @renderEditor()

      # Do not render if no table
      if @props.design.table
        R AutoSizeComponent, injectWidth: true, injectHeight: true,
          (size) =>
            # Clean before displaying
            design = new DatagridUtils(@props.schema).cleanDesign(@props.design)

            if not new DatagridUtils(@props.schema).validateDesign(design)
              R DatagridViewComponent, {
                width: size.width
                height: size.height
                pageSize: 100
                schema: @props.schema
                dataSource: @props.dataSource
                datagridDataSource: @props.datagridDataSource
                design: @props.design
                filters: filters
                onDesignChange: @props.onDesignChange
                onRowDoubleClick: @props.onRowDoubleClick
                canEditCell: @props.canEditCell
                updateCell: @props.updateCell
              }
            else
              H.div style: { textAlign: "center", marginTop: size.height / 2 }, 
                H.a onClick: @handleEdit,
                  "Click to configure"
