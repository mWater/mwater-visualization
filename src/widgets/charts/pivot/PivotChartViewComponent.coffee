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
    }

  handleHeaderChange: (header) =>
    @props.onDesignChange(_.extend({}, @props.design, header: header))

  handleFooterChange: (footer) =>
    @props.onDesignChange(_.extend({}, @props.design, footer: footer))

  handleEditSection: (sectionId) =>
    # If intersection
    if sectionId.match(":")
      alert("TODO")
    else
      # Find segment
      segment = PivotChartUtils.findSegment(@props.design.rows, sectionId) or PivotChartUtils.findSegment(@props.design.columns, sectionId)
      @setState(editSegment: segment)

  handleSaveEditSegment: =>
    design = _.extend({}, @props.design, {
      rows: PivotChartUtils.replaceSegment(@props.design.rows, @state.editSegment)
      columns: PivotChartUtils.replaceSegment(@props.design.columns, @state.editSegment)
      })

    @props.onDesignChange(design)
    @setState(editSegment: null)

  handleCancelEditSegment: =>
    @setState(editSegment: null)

  renderHeader: ->
    return H.div ref: "header",
      R TextComponent,
        design: @props.design.header
        onDesignChange: if @props.onDesignChange then @handleHeaderChange
        schema: @props.schema
        dataSource: @props.dataSource
        exprValues: @props.data.header or {}
        width: @props.width
        standardWidth: @props.standardWidth

  renderFooter: ->
    return H.div ref: "footer",
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
      onAction: @handleSaveEditSegment
      onCancel: @handleCancelEditSegment,
        R SegmentDesignerComponent,
          segment: @state.editSegment
          table: @props.design.table
          schema: @props.schema
          dataSource: @props.dataSource
          segmentType: segmentType
          onChange: (segment) => @setState(editSegment: segment)

  render: ->
    layout = new PivotChartLayoutBuilder(schema: @props.schema).buildLayout(@props.design, @props.data, @context.locale)

    H.div style: { width: @props.width, height: @props.height },
      @renderHeader()
      @renderEditSegmentModal()
      H.div key: "layout", style: { margin: 10 },  # Leave room for gear menu
        R PivotChartLayoutComponent, 
          layout: layout
          editable: @props.onDesignChange?
          onEditSection: @handleEditSection
          # onRemoveSegment: => alert("TODO")
          # onInsertBeforeSegment: => alert("TODO")
          # onInsertAfterSegment: => alert("TODO")
          # onAddChildSegment: => alert("TODO")

      @renderFooter()
