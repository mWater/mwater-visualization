_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

AxisBuilder = require '../../../axes/AxisBuilder'
ExprUtils = require('mwater-expressions').ExprUtils
ui = require 'react-library/lib/bootstrap'

module.exports = class TableChartViewComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired # Design of chart
    data: React.PropTypes.object.isRequired # Data that the table has requested

    schema: React.PropTypes.object.isRequired # Schema to use
    width: React.PropTypes.number
    height: React.PropTypes.number
    standardWidth: React.PropTypes.number

    # scope of the widget (when the widget self-selects a particular scope)
    scope: React.PropTypes.shape({ 
      name: React.PropTypes.node.isRequired
      filter: React.PropTypes.shape({ table: React.PropTypes.string.isRequired, jsonql: React.PropTypes.object.isRequired })
      data: React.PropTypes.any
    }) 
    onScopeChange: React.PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
  
    onRowClick: React.PropTypes.func # Called with (tableId, rowId) when item is clicked

  shouldComponentUpdate: (prevProps) ->
    not _.isEqual(prevProps, @props)

  render: ->
    # Render in a standard width container and then scale up to ensure that widget always looks consistent
    style = {
      width: @props.standardWidth
      height: @props.height * (@props.standardWidth / @props.width)
      transform: "scale(#{@props.width/@props.standardWidth}, #{@props.width/@props.standardWidth})"
      transformOrigin: "0 0"
    }

    return H.div style: style, className: "overflow-auto-except-print",
      H.div {style: { fontWeight: "bold", textAlign: "center" }, ref: "title"}, @props.design.titleText
      R TableContentsComponent, 
        design: @props.design
        data: @props.data
        schema: @props.schema
        dataSource: @props.dataSource
        onRowClick: @props.onRowClick

class TableContentsComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired # Design of chart
    data: React.PropTypes.object.isRequired # Data that the table has requested
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired # Data source to use

    onRowClick: React.PropTypes.func # Called with (tableId, rowId) when item is clicked

  @contextTypes:
    locale: React.PropTypes.string  # e.g. "en"

  constructor: ->
    super

    @state = {
      selectedIds: {}   # Map of row id to true if selected
    }

  shouldComponentUpdate: (prevProps, prevState) ->
    if prevProps.design != @props.design and not _.isEqual(prevProps.design, @props.design)
      return true

    if prevProps.data != @props.data and not _.isEqual(prevProps.data, @props.data)
      return true

    if prevProps.schema != @props.schema
      return true

    if prevState.selectedIds != @state.selectedIds
      return true

    return false

  handleRowClick: (rowIndex) =>
    row = @props.data.main[rowIndex]  

    # If there is only one id (num_ids = 1)
    if row and row.id and @props.onRowClick
      @props.onRowClick(@props.table, row.id)

  # Toggle selection of a row
  handleSelectRow: (index, selected) =>
    id = @props.data.main[index].id

    selectedIds = _.clone(@state.selectedIds)
    if selected
      delete selectedIds[id]
    else
      selectedIds[id] = true

    @setState(selectedIds: selectedIds)

  # Select all or deselect
  handleSelectAll: (selected) =>
    if selected
      selectedIds = {}
    else
      selectedIds = {}
      for row in @props.data.main
        selectedIds[row.id] = true

    @setState(selectedIds: selectedIds)

  renderHeaderCell: (index) ->
    axisBuilder = new AxisBuilder(schema: @props.schema)
    column = @props.design.columns[index]

    text = column.headerText or axisBuilder.summarizeAxis(column.textAxis, @context.locale)
    H.th { key: index },
      text

  # Render checkbox to select all
  renderSelectAll: ->
    selected = _.keys(@state.selectedIds).length >= @props.data.main.length

    H.th style: { width: 1, color: "#888" }, onClick: @handleSelectAll.bind(null, selected),
      if selected
        H.i className: "fa fa-fw fa-check-square", style: { color: "#2E6DA4" }
      else
        H.i className: "fa fa-fw fa-square-o", style: { color: "#888" }

  renderHeader: ->
    H.thead key: "head",
      H.tr key: "head",
        if @props.design.multiselect
          @renderSelectAll()
        _.map(@props.design.columns, (column, i) => @renderHeaderCell(i))

  renderImage: (id) ->
    url = @props.dataSource.getImageUrl(id)
    return H.a(href: url, key: id, target: "_blank", style: { paddingLeft: 5, paddingRight: 5 }, "Image")

  renderCell: (rowIndex, columnIndex) ->
    row = @props.data.main[rowIndex]  
    column = @props.design.columns[columnIndex]

    exprUtils = new ExprUtils(@props.schema)
    exprType = exprUtils.getExprType(column.textAxis?.expr)

    # Get value
    value = row["c#{columnIndex}"]

    if not value?
      node = null
    else
      # Parse if should be JSON
      if exprType in ['image', 'imagelist', 'geometry', 'text[]'] and _.isString(value)
        value = JSON.parse(value)

      # Convert to node based on type
      switch exprType
        when "text", "number"
          node = value
        when "boolean", "enum", "enumset", "text[]"
          node = exprUtils.stringifyExprLiteral(column.textAxis?.expr, value, @context.locale)
        when "date"
          node = moment(value, "YYYY-MM-DD").format("ll")
        when "datetime"
          node = moment(value, moment.ISO_8601).format("lll")
        when "image"
          node = @renderImage(value.id)
        when "imagelist"
          node = _.map(value, (v) => @renderImage(v.id))
        when "geometry"
          if value.type == "Point"
            node = "#{value.coordinates[1].toFixed(6)} #{value.coordinates[0].toFixed(6)}" 
          else
            node = value.type
        else
          node = "" + value

    return H.td(key: columnIndex, node)

  # Render checkbox column
  renderCheckbox: (index, selected) ->
    H.td key: "checkbox", style: { width: 1 }, onClick: @handleSelectRow.bind(null, index, selected),
      if selected
        H.i className: "fa fa-fw fa-check-square", style: { color: "#2E6DA4" }
      else
        H.i className: "fa fa-fw fa-square-o", style: { color: "#888" }

  renderRow: (index) ->
    # Determine if row is selected
    selected = @props.design.multiselect and @props.data.main[index].id and @state.selectedIds[@props.data.main[index].id]

    H.tr key: index, onClick: @handleRowClick.bind(null, index), style: { backgroundColor: (if selected then "#eee") },
      [
        if @props.design.multiselect
          @renderCheckbox(index, selected)
        _.map(@props.design.columns, (column, i) => @renderCell(index, i))
      ]

  renderBody: ->
    H.tbody key: "body",
      _.map(@props.data.main, (row, i) => @renderRow(i))

  renderActions: ->
    if @props.design.multiselect
      H.div null,
        R ui.Button, 
          disabled: _.isEmpty(@state.selectedIds)
          size: "xs", 
            "Approve Selected"

  render: ->
    H.div null,
      @renderActions()
      H.table className: "table table-condensed table-hover", style: { fontSize: "10pt", marginBottom: 0 },
        @renderHeader()
        @renderBody()


#   renderHeaderCell: (index) ->
#     axisBuilder = new AxisBuilder(schema: @props.schema)
#     column = @props.design.columns[index]

#     text = column.headerText or axisBuilder.summarizeAxis(column.textAxis, @context.locale)
#     H.th {key: index},
#       text

#   renderHeader: ->
#     H.thead null,
#       H.tr { style: { position: "relative"}, ref: "tableHeader"},
#         _.map(@props.design.columns, (column, i) => @renderHeaderCell(i))

#   renderCell: (rowIndex, columnIndex) ->
#     row = @props.data.main[rowIndex]  
#     column = @props.design.columns[columnIndex]

#     # Get value
#     value = row["c#{columnIndex}"]

#     # Convert to string
#     axisBuilder = new AxisBuilder(schema: @props.schema)
#     str = axisBuilder.formatValue(column.textAxis, value, @context.locale)
#     return H.td(key: columnIndex, str)

#   renderRow: (index) ->
#     H.tr key: index,
#       _.map(@props.design.columns, (column, i) => @renderCell(index, i))

#   componentDidUpdate: (prevProps, prevState) ->
#     @calculateHeadersWidth()

#   componentDidMount: ->
#     @calculateHeadersWidth()

#   calculateHeadersWidth: ->
#     tr = $(@refs.tableBody).find("tr").first()
#     headers = $(@refs.tableHeader).find("th")
#     body = $(@refs.tableBody)
#     bodyContainer = $(@refs.tableBodyContainer)

#     tr.find("td").each (i, el) =>
#       cellWIdth = $(el).width()
#       headers.eq(i).width(cellWIdth)

#       if headers.eq(i).width() != cellWIdth
#         @setColumnWidth(i, headers.eq(i).width())

#     height = @props.height * (@props.standardWidth / @props.width) - $(@refs.title).outerHeight() - $(@refs.tableHeader).outerHeight()
#     bodyContainer.height(height)

#   setColumnWidth: (column,width) ->
#     body = $(@refs.tableBody)
#     body.find('tr').each (i, el) ->
#       $(el).find('td').eq(column).width(width)

#   renderBody: ->
# #    height = @props.height * (@props.standardWidth / @props.width) - $(@refs.title).outerHeight()
# #    tbodyStyle =


#     H.tbody { ref: "tableBody"},
#       _.map(@props.data.main, (row, i) => @renderRow(i))

#   shouldComponentUpdate: (prevProps) ->
#     not _.isEqual(prevProps, @props)

#   render: ->
#     # Render in a standard width container and then scale up to ensure that widget always looks consistent
#     style = {
#       width: @props.standardWidth
#       height: @props.height * (@props.standardWidth / @props.width)
#       transform: "scale(#{@props.width/@props.standardWidth}, #{@props.width/@props.standardWidth})"
#       transformOrigin: "0 0"
#       overflow: 'hidden'
#     }

#     containerStyle =
#       overflow: "auto"
#       height: height

#     height = @props.height * (@props.standardWidth / @props.width) - $(@refs.title).outerHeight() - 25

#     return H.div style: style, className: "overflow-auto-except-print",
#       H.div {style: { fontWeight: "bold", textAlign: "center" }, ref: "title"}, @props.design.titleText
#       H.table className: "table table-condensed table-hover", style: { fontSize: "10pt", marginBottom: 0 },
#         @renderHeader()
#       H.div {ref: "tableBodyContainer", style: containerStyle},
#         H.table className: "table table-condensed table-hover", style: { fontSize: "10pt" },
#           @renderBody()

