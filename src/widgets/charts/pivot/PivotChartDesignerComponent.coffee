React = require 'react'
H = React.DOM
R = React.createElement

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent
TableSelectComponent = require '../../../TableSelectComponent'

module.exports = class PivotChartDesignerComponent extends React.Component
  @propTypes: 
    design: React.PropTypes.object.isRequired
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func.isRequired

  # Updates design with the specified changes
  updateDesign: (changes) ->
    design = _.extend({}, @props.design, changes)
    @props.onDesignChange(design)

  handleTableChange: (table) => @updateDesign(table: table)
  handleFilterChange: (filter) => @updateDesign(filter: filter)

  renderTable: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        H.i(className: "fa fa-database")
        " "
        "Data Source"
      ": "
      R(TableSelectComponent, { schema: @props.schema, value: @props.design.table, onChange: @handleTableChange })

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
        R(FilterExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: @handleFilterChange
          table: @props.design.table
          value: @props.design.filter)

  render: ->
    H.div null,
      @renderTable()
      @renderFilter()
      if @props.design.table and (not @props.design.rows[0].label? and not @props.design.rows[0].valueAxis? or not @props.design.columns[0].label? and not @props.design.columns[0].valueAxis?)
        H.div className: "alert alert-info",
          '''
          Your pivot table is ready to configure! Close this popup with the "x" at the top right corner
          and then click on the rows, columns or the data areas to set up the table. 
          '''
          H.br()
          '''
          For advanced options, click on the pencil menu that appears when you hover over a section. 
          '''
