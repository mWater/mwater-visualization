PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

ExprComponent = require("mwater-expressions-ui").ExprComponent
ExprUtils = require('mwater-expressions').ExprUtils
ExprCompiler = require('mwater-expressions').ExprCompiler

DashboardUtils = require '../dashboards/DashboardUtils'

# Designer for popup filter joins (see PopupFilterJoins.md)
module.exports = class PopupFilterJoinsEditComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired # Schema to use
    dataSource: PropTypes.object.isRequired
    table: PropTypes.string.isRequired  # table of the row that the popup will be for
    idTable: PropTypes.string.isRequired # table of the row that join is to. Usually same as table except for choropleth maps
    defaultPopupFilterJoins: PropTypes.object.isRequired # Default popup filter joins
    popup: PropTypes.object.isRequired  # Design of the popup this is for
    design: PropTypes.object            # popup filter joins object
    onDesignChange: PropTypes.func.isRequired # Called with new design

  constructor: (props) ->
    super(props)

    @state = {
      expanded: false
    }

  handleExprChange: (table, expr) => 
    design = @props.design or @props.defaultPopupFilterJoins

    design = _.clone(design)
    design[table] = expr
    @props.onDesignChange(design)

  render: ->
    if not @state.expanded
      return R 'a', className: "btn btn-link", onClick: (=> @setState(expanded: true)),
        "Advanced Popup Options"

    # Get filterable tables of popup
    popupDashboard = { items: @props.popup.items, layout: "blocks" }
    filterableTables = DashboardUtils.getFilterableTables(popupDashboard, @props.schema)

    # Always include self as first
    filterableTables = [@props.table].concat(_.without(filterableTables, @props.table))

    # Get popupFilterJoins
    popupFilterJoins = @props.design or @props.defaultPopupFilterJoins

    return R 'div', null,
      R 'div', className: "text-muted", 
        "Optional connections for other tables to filtering the popup"
      R 'table', className: "table table-condensed table-bordered",
        R 'thead', null,
          R 'tr', null,
            R 'th', null, "Data Source"
            R 'th', null, "Connection"
        R 'tbody', null,
          _.map filterableTables, (filterableTable) =>
            R 'tr', key: filterableTable,
              R 'td', style: { verticalAlign: "middle" }, 
                ExprUtils.localizeString(@props.schema.getTable(filterableTable)?.name)
              R 'td', null,
                R ExprComponent,
                  schema: @props.schema
                  dataSource: @props.dataSource
                  table: filterableTable
                  value: popupFilterJoins[filterableTable]
                  onChange: @handleExprChange.bind(null, filterableTable)
                  types: if @props.table == @props.idTable then ["id", "id[]"] else ["id"]  # TODO support id[] some day for admin choropleth maps too
                  idTable: @props.idTable
                  preferLiteral: false
                  placeholder: "None"

        
    