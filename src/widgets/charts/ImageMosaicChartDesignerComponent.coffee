_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

ui = require '../../UIComponents'
ExprUtils = require('mwater-expressions').ExprUtils
AxisBuilder = require './../../axes/AxisBuilder'
AxisComponent = require './../../axes/AxisComponent'
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
TableSelectComponent = require '../../TableSelectComponent'

module.exports = class ImageMosaicChartDesignerComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func.isRequired

  # Upimages design with the specified changes
  upimageDesign: (changes) ->
    design = _.extend({}, @props.design, changes)
    @props.onDesignChange(design)

  handleTitleTextChange: (ev) =>  @upimageDesign(titleText: ev.target.value)
  handleTableChange: (table) => @upimageDesign(table: table)
  handleFilterChange: (filter) => @upimageDesign(filter: filter)
  handleImageAxisChange: (imageAxis) => @upimageDesign(imageAxis: imageAxis)

  renderTable: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.span(className: "glyphicon glyphicon-file")
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
        onChange: @handleImageAxisChange)

  render: ->
    H.div null,
      @renderTable()
      @renderImageAxis()
      @renderFilter()
      H.hr()
      @renderTitle()
