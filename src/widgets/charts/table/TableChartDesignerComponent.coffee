_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
uuid = require 'uuid'

ui = require 'react-library/lib/bootstrap'
update = require 'react-library/lib/update'

ExprUtils = require('mwater-expressions').ExprUtils
AxisBuilder = require '../../../axes/AxisBuilder'
LinkComponent = require('mwater-expressions-ui').LinkComponent
ExprComponent = require("mwater-expressions-ui").ExprComponent
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
OrderingsComponent = require './OrderingsComponent'
TableSelectComponent = require '../../../TableSelectComponent'
ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent")
DashboardPopupSelectorComponent = require '../../../dashboards/DashboardPopupSelectorComponent'

module.exports = class TableChartDesignerComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    widgetDataSource: React.PropTypes.object.isRequired # dashboard data source for widget
    onDesignChange: React.PropTypes.func.isRequired

    # All dashboard popups
    popups: React.PropTypes.arrayOf(React.PropTypes.shape({ id: React.PropTypes.string.isRequired, design: React.PropTypes.object.isRequired })).isRequired
    onPopupsChange: React.PropTypes.func               # If not set, readonly

    onRowClick: React.PropTypes.func     # Called with (tableId, rowId) when item is clicked
    namedStrings: React.PropTypes.object # Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget

    # Filters to add to the dashboard
    filters: React.PropTypes.arrayOf(React.PropTypes.shape({
      table: React.PropTypes.string.isRequired    # id table to filter
      jsonql: React.PropTypes.object.isRequired   # jsonql filter with {alias} for tableAlias
    }))

  update: => update(@props.design, @props.onDesignChange, arguments)

  handleTitleTextChange: (ev) =>  @update(titleText: ev.target.value)
  handleTableChange: (table) => @update(table: table)
  handleFilterChange: (filter) => @update(filter: filter)
  handleOrderingsChange: (orderings) => @update(orderings: orderings)

  handleColumnChange: (index, column) =>
    columns = @props.design.columns.slice()
    columns[index] = column
    @update(columns: columns)

  handleRemoveColumn: (index) =>
    columns = @props.design.columns.slice()
    columns.splice(index, 1)
    @update(columns: columns)

  handleAddColumn: =>
    columns = @props.design.columns.slice()
    columns.push({id: uuid()})
    @update(columns: columns)

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

  renderColumn: (column, index, connectDragSource, connectDragPreview, connectDropTarget) =>
    style = {
      borderTop: "solid 1px #EEE"
      paddingTop: 10
      paddingBottom: 10
    }

    connectDragPreview(connectDropTarget(H.div key: index, style: style,
      React.createElement(TableChartColumnDesignerComponent, {
        design: @props.design
        schema: @props.schema
        dataSource: @props.dataSource
        index: index
        onChange: @handleColumnChange.bind(null, index)
        onRemove: @handleRemoveColumn.bind(null, index)
        connectDragSource: connectDragSource
        })))

  handleReorder: (map) =>
    @update(columns: map)

  renderColumns: ->
    if not @props.design.table
      return

    H.div null,
      R ReorderableListComponent,
        items: @props.design.columns
        onReorder: @handleReorder
        renderItem: @renderColumn
        getItemId: (item) => item.id
      H.button className: "btn btn-default btn-sm", type: "button", onClick: @handleAddColumn,
        H.span className: "glyphicon glyphicon-plus"
        " Add Column"
    # return H.div className: "form-group",
    #   _.map(@props.design.columns, (column, i) => @renderColumn(i))
    #

  renderOrderings: ->
    # If no table, hide
    if not @props.design.table
      return null

    return H.div className: "form-group",
      H.label className: "text-muted",
        H.span(className: "glyphicon glyphicon-sort-by-attributes")
        " "
        "Ordering"
      H.div style: { marginLeft: 8 },
        React.createElement(OrderingsComponent,
          schema: @props.schema
          dataSource: @props.dataSource
          orderings: @props.design.orderings
          onOrderingsChange: @handleOrderingsChange
          table: @props.design.table)

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

  renderAdvanced: ->
    R ui.CollapsibleSection,
      label: "Advanced"
      labelMuted: true,
        R ui.FormGroup, 
          labelMuted: true
          label: "When row is clicked:",
            R ui.Select,
              value: @props.design.clickAction or null
              onChange: @update("clickAction")
              options: [
                { value: null, label: "Do nothing"}
                { value: "scope", label: "Filter other widgets"}
                { value: "popup", label: "Open popup"}
              ]

        if @props.design.clickAction == "popup"
          R DashboardPopupSelectorComponent,
            popups: @props.popups
            onPopupsChange: @props.onPopupsChange
            schema: @props.schema
            dataSource: @props.dataSource
            widgetDataSource: @props.widgetDataSource
            onRowClick: @props.onRowClick
            namedStrings: @props.namedStrings
            filters: @props.filters
            popupId: @props.design.clickActionPopup
            onPopupIdChange: @update("clickActionPopup")

  render: ->
    H.div null,
      @renderTable()
      @renderColumns()
      if @props.design.table then H.hr()
      @renderOrderings()
      @renderFilter()
      H.hr()
      @renderTitle()
      if @props.design.table
        @renderAdvanced()

class TableChartColumnDesignerComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    index: React.PropTypes.number.isRequired
    onChange: React.PropTypes.func.isRequired
    onRemove: React.PropTypes.func.isRequired

  @contextTypes:
    locale: React.PropTypes.string  # e.g. "en"

  # Updates column with the specified changes
  updateColumn: (changes) ->
    column = _.extend({}, @props.design.columns[@props.index], changes)
    @props.onChange(column)

  updateTextAxis: (changes) ->
    textAxis = _.extend({}, @props.design.columns[@props.index].textAxis, changes)
    @updateColumn(textAxis: textAxis)

  handleExprChange: (expr) => @updateTextAxis(expr: expr)
  handleHeaderTextChange: (ev) => @updateColumn(headerText: ev.target.value)
  handleAggrChange: (aggr) => @updateTextAxis(aggr: aggr)

  renderRemove: ->
    if @props.design.columns.length > 1
      H.button className: "btn btn-xs btn-link pull-right", type: "button", onClick: @props.onRemove,
        H.span className: "glyphicon glyphicon-remove"

  renderExpr: ->
    column = @props.design.columns[@props.index]

    title = "Value"

    H.div null,
      H.label className: "text-muted", title
      ": "
      React.createElement(ExprComponent,
        schema: @props.schema
        dataSource: @props.dataSource
        table: @props.design.table
        value: if column.textAxis then column.textAxis.expr
        onChange: @handleExprChange
        aggrStatuses: ["literal", "individual", "aggregate"]
      )

  renderHeader: ->
    column = @props.design.columns[@props.index]

    axisBuilder = new AxisBuilder(schema: @props.schema)
    placeholder = axisBuilder.summarizeAxis(column.textAxis, @context.locale)

    H.div null,
      H.label className: "text-muted", "Header"
      ": "
      H.input
        type: "text"
        className: "form-control input-sm"
        style: { display: "inline-block", width: "15em" }
        value: column.headerText
        onChange: @handleHeaderTextChange
        placeholder: placeholder

  render: ->
    iconStyle =
      cursor: "move"
      marginRight: 8
      opacity: 0.5
      fontSize: 12
      height: 20
    H.div null,
      @props.connectDragSource(H.i(className: "fa fa-bars", style: iconStyle))
      @renderRemove()
      H.label null, "Column #{@props.index+1}"
      H.div style: { marginLeft: 5 },
        @renderExpr()
        @renderHeader()
