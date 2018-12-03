PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
ReactDOM = require 'react-dom'
R = React.createElement

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
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired
    design: PropTypes.object.isRequired
    data: PropTypes.object.isRequired
    onDesignChange: PropTypes.func

    width: PropTypes.number.isRequired
    standardWidth: PropTypes.number  # Deprecated

    scope: PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    onScopeChange: PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
    filters: PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  constructor: (props) ->
    super(props)

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

  handleSummarizeSegment: (segmentId) =>
    design = PivotChartUtils.summarizeSegment(@props.design, segmentId, "Summary")

    @props.onDesignChange(design)

  renderHeader: ->
    return R 'div', style: { paddingLeft: 10, paddingRight: 10 },
      R TextComponent,
        design: @props.design.header
        onDesignChange: if @props.onDesignChange then @handleHeaderChange
        schema: @props.schema
        dataSource: @props.dataSource
        exprValues: @props.data.header or {}
        width: @props.width
        standardWidth: @props.standardWidth

  renderFooter: ->
    return R 'div', style: { paddingLeft: 10, paddingRight: 10 },
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
          filters: @props.filters

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
          filters: @props.filters

  render: ->
    layout = new PivotChartLayoutBuilder(schema: @props.schema).buildLayout(@props.design, @props.data, @context.locale)

    R 'div', style: { width: @props.width, height: @props.height },
      @renderHeader()
      @renderEditSegmentModal()
      @renderEditIntersectionModal()
      R 'div', key: "layout", style: { margin: 5, marginTop: 12, overflowX: "auto", padding: 7 }, # Allow table to scroll since tables have hard minimum widths, Leave room for gear menu
        R PivotChartLayoutComponent, 
          layout: layout
          editable: @props.onDesignChange?
          onEditSection: if @props.onDesignChange? then @handleEditSection
          onRemoveSegment: if @props.onDesignChange? then @handleRemoveSegment
          onInsertBeforeSegment: if @props.onDesignChange? then @handleInsertBeforeSegment
          onInsertAfterSegment: if @props.onDesignChange? then @handleInsertAfterSegment
          onAddChildSegment: if @props.onDesignChange? then @handleAddChildSegment
          onSummarizeSegment: if @props.onDesignChange? then @handleSummarizeSegment

      @renderFooter()
