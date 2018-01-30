PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

AutoSizeComponent = require('react-library/lib/AutoSizeComponent')
ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent')
ExprCompiler = require('mwater-expressions').ExprCompiler
DatagridViewComponent = require './DatagridViewComponent'
DatagridDesignerComponent = require './DatagridDesignerComponent'
DatagridUtils = require './DatagridUtils'
QuickfiltersComponent = require '../quickfilter/QuickfiltersComponent'
QuickfilterCompiler = require '../quickfilter/QuickfilterCompiler'
FindReplaceModalComponent = require './FindReplaceModalComponent'

# Datagrid with decorations 
# See README.md for description of datagrid format
# Design should be cleaned already before being passed in (see DatagridUtils)
module.exports = class DatagridComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired     # schema to use
    dataSource: PropTypes.object.isRequired # dataSource to use
    datagridDataSource: PropTypes.object.isRequired # datagrid dataSource to use

    design: PropTypes.object.isRequired     # Design of datagrid. See README.md of this folder
    onDesignChange: PropTypes.func          # Called when design changes

    titleElem: PropTypes.node                     # Extra element to include in title at left
    extraTitleButtonsElem: PropTypes.node         # Extra elements to add to right

    # Check if expression of table row is editable
    # If present, called with (tableId, rowId, expr, callback). Callback should be called with (error, true/false)
    canEditValue: PropTypes.func             

    # Update table row expression with a new value
    # Called with (tableId, rowId, expr, value, callback). Callback should be called with (error)
    updateValue:  PropTypes.func

    # Called when row is double-clicked with (tableId, rowId)
    onRowDoubleClick: PropTypes.func

    quickfilterLocks: PropTypes.array             # Locked quickfilter values. See README in quickfilters

  constructor: (props) ->
    super(props)

    @state = {
      editingDesign: false   # is design being edited
      cellEditingEnabled: false  # True if cells can be edited directly
      quickfiltersHeight: null   # Height of quickfilters
      quickfiltersValues: null
    }

  componentDidMount: -> 
    @updateHeight()

  componentDidUpdate: ->
    @updateHeight()

  updateHeight: ->
    # Calculate quickfilters height
    if @refs.quickfilters 
      if @state.quickfiltersHeight != @refs.quickfilters.offsetHeight
        @setState(quickfiltersHeight: @refs.quickfilters.offsetHeight)
    else
      @setState(quickfiltersHeight: 0)

  # Get the values of the quick filters
  getQuickfilterValues: =>
    return @state.quickfiltersValues or []

  handleCellEditingToggle: =>
    if @state.cellEditingEnabled
      @setState(cellEditingEnabled: false)
    else
      if confirm("Turn on cell editing? This is allow you to edit the live data and is an advanced feature.")
        @setState(cellEditingEnabled: true)

  handleEdit: =>
    @setState(editingDesign: true)

  # Get datagrid filter compiled for quickfilter filtering
  getCompiledFilters: ->
    exprCompiler = new ExprCompiler(@props.schema)

    compiledFilters = []

    if @props.design.filter
      jsonql = exprCompiler.compileExpr(expr: @props.design.filter, tableAlias: "{alias}")
      if jsonql
        compiledFilters.push({
          table: @props.design.table
          jsonql: jsonql
        })

    return compiledFilters

  # Toggle to allow cell editing
  renderCellEdit: ->
    if not @props.canEditValue or not @props.onDesignChange?
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

  renderFindReplace: ->
    if not @state.cellEditingEnabled
      return null

    return H.a 
      key: "findreplace"
      className: "btn btn-link btn-sm"
      onClick: (=> @refs.findReplaceModal.show()),
        "Find/Replace"

  renderTitleBar: ->
    H.div style: { position: "absolute", top: 0, left: 0, right: 0, height: 40, padding: 4 },
      H.div style: { float: "right" },
        @renderFindReplace()
        @renderCellEdit()
        @renderEditButton()
        @props.extraTitleButtonsElem
      @props.titleElem

  renderQuickfilter: ->
    H.div style: { position: "absolute", top: 40, left: 0, right: 0 }, ref: "quickfilters",
      R QuickfiltersComponent, {
        design: @props.design.quickfilters
        schema: @props.schema
        quickfiltersDataSource: @props.datagridDataSource.getQuickfiltersDataSource()
        values: @state.quickfiltersValues
        table: @props.design.table
        onValuesChange: (values) => @setState(quickfiltersValues: values)
        locks: @props.quickfilterLocks
        filters: @getCompiledFilters()
      }

  # Renders the editor modal
  renderEditor:  ->
    if not @state.editingDesign
      return

    R DatagridEditorComponent,
      schema: @props.schema
      dataSource: @props.dataSource
      design: @props.design
      onDesignChange: (design) => 
        # If quickfilters have changed, reset values
        if not _.isEqual(@props.design.quickfilters, design.quickfilters)
          @setState(quickfiltersValues: null)
          
        @props.onDesignChange(design)

        @setState(editingDesign: false)
      onCancel: => @setState(editingDesign: false)

  renderFindReplaceModal: (filters) ->
    R FindReplaceModalComponent, 
      ref: "findReplaceModal"
      schema: @props.schema
      dataSource: @props.dataSource
      datagridDataSource: @props.datagridDataSource
      design: @props.design
      filters: filters
      canEditValue: @props.canEditValue
      updateValue: @props.updateValue
      onUpdate: =>
        # Reload
        @datagridView?.reload()

  render: ->
    # Compile quickfilters
    filters = new QuickfilterCompiler(@props.schema).compile(@props.design.quickfilters, @state.quickfiltersValues, @props.quickfilterLocks)

    hasQuickfilters = @props.design.quickfilters?[0]?

    return H.div style: { width: "100%", height: "100%", position: "relative", paddingTop: 40 + (@state.quickfiltersHeight or 0) },
      @renderTitleBar(filters)
      @renderQuickfilter()

      @renderEditor()
      @renderFindReplaceModal(filters)

      R AutoSizeComponent, injectWidth: true, injectHeight: true,
        (size) =>
          # Clean before displaying
          design = new DatagridUtils(@props.schema).cleanDesign(@props.design)

          if not new DatagridUtils(@props.schema).validateDesign(design)
            R DatagridViewComponent, {
              ref: (view) => @datagridView = view
              width: size.width - 1 # minus 1 px to test if it solves the jitter with scroll
              height: size.height - 1
              pageSize: 100
              schema: @props.schema
              dataSource: @props.dataSource
              datagridDataSource: @props.datagridDataSource
              design: design
              filters: filters
              onDesignChange: @props.onDesignChange
              onRowDoubleClick: @props.onRowDoubleClick
              canEditCell: if @state.cellEditingEnabled then @props.canEditValue
              updateCell: if @state.cellEditingEnabled then @props.updateValue
            }
          else if @props.onDesignChange
            H.div style: { textAlign: "center", marginTop: size.height / 2 }, 
              H.a className: "btn btn-link", onClick: @handleEdit, 
                "Click Here to Configure"
          else
            null

# Popup editor
class DatagridEditorComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired     # schema to use
    dataSource: PropTypes.object.isRequired # dataSource to use
    design: PropTypes.object.isRequired     # Design of datagrid. See README.md of this folder
    onDesignChange: PropTypes.func.isRequired # Called when design changes
    onCancel: PropTypes.func.isRequired     # Called when cancelled

  constructor: (props) ->
    super(props)

    @state = {
      design: props.design   
    }

  render: ->
    R ActionCancelModalComponent, 
      onAction: => 
        @props.onDesignChange(@state.design)
        @setState(design: @props.design)
      onCancel: @props.onCancel
      size: "large",
        R DatagridDesignerComponent,
          schema: @props.schema
          dataSource: @props.dataSource
          design: @state.design
          onDesignChange: (design) => @setState(design: design)
