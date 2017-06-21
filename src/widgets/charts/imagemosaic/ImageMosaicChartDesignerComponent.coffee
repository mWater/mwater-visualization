PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

ui = require '../../../UIComponents'
ExprUtils = require('mwater-expressions').ExprUtils
AxisBuilder = require '../../../axes/AxisBuilder'
AxisComponent = require '../../../axes/AxisComponent'
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
TableSelectComponent = require '../../../TableSelectComponent'

module.exports = class ImageMosaicChartDesignerComponent extends React.Component
  @propTypes:
    design: PropTypes.object.isRequired
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired
    onDesignChange: PropTypes.func.isRequired
    filters: PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  # Updates design with the specified changes
  updateDesign: (changes) ->
    design = _.extend({}, @props.design, changes)
    @props.onDesignChange(design)

  handleTitleTextChange: (ev) =>  @updateDesign(titleText: ev.target.value)
  handleTableChange: (table) => @updateDesign(table: table)
  handleFilterChange: (filter) => @updateDesign(filter: filter)
  handleImageAxisChange: (imageAxis) => @updateDesign(imageAxis: imageAxis)

  renderTable: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.i(className: "fa fa-database")
        " "
        "Data Source"
      ": "
      React.createElement(TableSelectComponent, { schema: @props.schema, value: @props.design.table, onChange: @handleTableChange })

  renderTitle: ->
    H.div className: "form-group",
      H.label className: "text-muted", "Title"
      H.input type: "text", className: "form-control input-sm", value: @props.design.titleText, onChange: @handleTitleTextChange, placeholder: "Untitled"

  renderFilter: ->
    # If no table, hide
    if not @props.design.table
      return null

    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-filter")
        " "
        "Filters"
      H.div style: { marginLeft: 8 }, 
        React.createElement(FilterExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: @handleFilterChange
          table: @props.design.table
          value: @props.design.filter)

  renderImageAxis: ->
    if not @props.design.table
      return

    R ui.SectionComponent, label: "Image Axis",
      R(AxisComponent, 
        schema: @props.schema
        dataSource: @props.dataSource
        table: @props.design.table
        types: ["image", "imagelist"]
        aggrNeed: "none"
        required: true
        value: @props.design.imageAxis 
        onChange: @handleImageAxisChange
        filters: @props.filters)

  render: ->
    H.div null,
      @renderTable()
      @renderImageAxis()
      @renderFilter()
      H.hr()
      @renderTitle()
