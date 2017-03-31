_ = require 'lodash'
React = require 'react'
ReactDOM = require 'react-dom'
R = React.createElement
H = React.DOM

ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent')
ExprUtils = require('mwater-expressions').ExprUtils
TextComponent = require '../../text/TextComponent'

PivotChartUtils = require './PivotChartUtils'
PivotChartLayoutComponent = require './PivotChartLayoutComponent'
PivotChartLayoutBuilder = require './PivotChartLayoutBuilder'
SegmentDesignerComponent = require './SegmentDesignerComponent'
IntersectionDesignerComponent = require './IntersectionDesignerComponent'

# Displays a pivot chart
module.exports = class PivotChartViewComponent extends React.Component
  @propTypes: 
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    design: React.PropTypes.object.isRequired
    data: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func

    width: React.PropTypes.number.isRequired
    standardWidth: React.PropTypes.number  # Deprecated

    scope: React.PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    onScopeChange: React.PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

  @contextTypes:
    locale: React.PropTypes.string  # e.g. "en"

  constructor: ->
    super

    @state = {
      editSegment: null   # Segment being edited
      editIntersectionId: null # id of intersection being edited
      editIntersection: null # value of intersection being edited
    }

  handleHeaderChange: (header) =>
    @props.onDesignChange(_.extend({}, @props.design, header: header))

  handleFooterChange: (footer) =>
    @props.onDesignChange(_.extend({}, @props.design, footer: footer))

  handleEditSection: (sectionId) =>
    # If intersection
    if sectionId.match(":")
      @setState(editIntersectionId: sectionId, editIntersection: @props.design.intersections[sectionId] or {})
    else
      # Find segment
      segment = PivotChartUtils.findSegment(@props.design.rows, sectionId) or PivotChartUtils.findSegment(@props.design.columns, sectionId)
      @setState(editSegment: segment)

  handleSaveEditSegment: =>
    # Always has label when saved
    segment = @state.editSegment

    if not segment.label?
      segment = _.extend({}, segment, label: "")
    
    design = _.extend({}, @props.design, {
      rows: PivotChartUtils.replaceSegment(@props.design.rows, segment)
      columns: PivotChartUtils.replaceSegment(@props.design.columns, segment)
      })

    @props.onDesignChange(design)
    @setState(editSegment: null)

  handleCancelEditSegment: =>
    @setState(editSegment: null)

  handleSaveEditIntersection: =>
    intersections = _.clone(@props.design.intersections)
    intersections[@state.editIntersectionId] = @state.editIntersection

    design = _.extend({}, @props.design, intersections: intersections)
    @props.onDesignChange(design)
    @setState(editIntersectionId: null, editIntersection: null)

  handleCancelEditIntersection: =>
    @setState(editIntersectionId: null, editIntersection: null)

  handleRemoveSegment: (segmentId) =>
    design = _.extend({}, @props.design, {
      rows: PivotChartUtils.removeSegment(@props.design.rows, segmentId)
      columns: PivotChartUtils.removeSegment(@props.design.columns, segmentId)
      })

    @props.onDesignChange(design)

  handleInsertBeforeSegment: (segmentId) =>
    design = _.extend({}, @props.design, {
      rows: PivotChartUtils.insertBeforeSegment(@props.design.rows, segmentId)
      columns: PivotChartUtils.insertBeforeSegment(@props.design.columns, segmentId)
      })

    @props.onDesignChange(design)

  handleInsertAfterSegment: (segmentId) =>
    design = _.extend({}, @props.design, {
      rows: PivotChartUtils.insertAfterSegment(@props.design.rows, segmentId)
      columns: PivotChartUtils.insertAfterSegment(@props.design.columns, segmentId)
      })

    @props.onDesignChange(design)

  handleAddChildSegment: (segmentId) =>
    design = _.extend({}, @props.design, {
      rows: PivotChartUtils.addChildSegment(@props.design.rows, segmentId)
      columns: PivotChartUtils.addChildSegment(@props.design.columns, segmentId)
      })

    @props.onDesignChange(design)

  renderHeader: ->
    return H.div ref: "header", style: { paddingLeft: 10, paddingRight: 10 },
      R TextComponent,
        design: @props.design.header
        onDesignChange: if @props.onDesignChange then @handleHeaderChange
        schema: @props.schema
        dataSource: @props.dataSource
        exprValues: @props.data.header or {}
        width: @props.width
        standardWidth: @props.standardWidth

  renderFooter: ->
    return H.div ref: "footer", style: { paddingLeft: 10, paddingRight: 10 },
      R TextComponent,
        design: @props.design.footer
        onDesignChange: if @props.onDesignChange then @handleFooterChange
        schema: @props.schema
        dataSource: @props.dataSource
        exprValues: @props.data.footer or {}
        width: @props.width
        standardWidth: @props.standardWidth

  renderEditSegmentModal: ->
    if not @state.editSegment
      return

    segmentType = if PivotChartUtils.findSegment(@props.design.rows, @state.editSegment.id) then "row" else "column"

    R ActionCancelModalComponent,
      header: "Edit #{segmentType}"
      onAction: @handleSaveEditSegment
      onCancel: @handleCancelEditSegment,
        R SegmentDesignerComponent,
          segment: @state.editSegment
          table: @props.design.table
          schema: @props.schema
          dataSource: @props.dataSource
          segmentType: segmentType
          onChange: (segment) => @setState(editSegment: segment)

  renderEditIntersectionModal: ->
    if not @state.editIntersectionId
      return

    R ActionCancelModalComponent,
      header: "Edit Value"
      onAction: @handleSaveEditIntersection
      onCancel: @handleCancelEditIntersection,
        R IntersectionDesignerComponent,
          intersection: @state.editIntersection
          table: @props.design.table
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: (intersection) => @setState(editIntersection: intersection)

  render: ->
    layout = new PivotChartLayoutBuilder(schema: @props.schema).buildLayout(@props.design, @props.data, @context.locale)

    H.div style: { width: @props.width, height: @props.height },
      @renderHeader()
      @renderEditSegmentModal()
      @renderEditIntersectionModal()
      H.div key: "layout", style: { margin: 10, marginTop: 15 },  # Leave room for gear menu
        R PivotChartLayoutComponent, 
          layout: layout
          editable: @props.onDesignChange?
          onEditSection: if @props.onDesignChange? then @handleEditSection
          onRemoveSegment: if @props.onDesignChange? then @handleRemoveSegment
          onInsertBeforeSegment: if @props.onDesignChange? then @handleInsertBeforeSegment
          onInsertAfterSegment: if @props.onDesignChange? then @handleInsertAfterSegment
          onAddChildSegment: if @props.onDesignChange? then @handleAddChildSegment

      @renderFooter()
