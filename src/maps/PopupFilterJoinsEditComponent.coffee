PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

ExprComponent = require("mwater-expressions-ui").ExprComponent
ExprUtils = require('mwater-expressions').ExprUtils
ExprCompiler = require('mwater-expressions').ExprCompiler

DashboardUtils = require '../dashboards/DashboardUtils'
PopupFilterJoinsUtils = require './PopupFilterJoinsUtils'

# Designer for popup filter joins (see PopupFilterJoins.md)
module.exports = class PopupFilterJoinsEditComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired # Schema to use
    dataSource: PropTypes.object.isRequired
    table: PropTypes.string.isRequired  # table of the row that the popup will be for
    popup: PropTypes.object.isRequired  # Design of the popup this is for
    design: PropTypes.object            # popup filter joins object
    onDesignChange: PropTypes.func.isRequired # Called with new design

  constructor: (props) ->
    super(props)

    @state = {
      expanded: false
    }

  handleExprChange: (table, expr) => 
    design = @props.design or PopupFilterJoinsUtils.createDefaultPopupFilterJoins(@props.table)

    design = _.clone(design)
    design[table] = expr
    @props.onDesignChange(design)

  render: ->
    if not @state.expanded
      return H.a className: "btn btn-link", onClick: (=> @setState(expanded: true)),
        "Advanced Popup Options"

    # Get filterable tables of popup
    popupDashboard = { items: @props.popup.items, layout: "blocks" }
    filterableTables = DashboardUtils.getFilterableTables(popupDashboard, @props.schema)

    # Always include self as first
    filterableTables = [@props.table].concat(_.without(filterableTables, @props.table))

    # Get popupFilterJoins
    popupFilterJoins = @props.design or PopupFilterJoinsUtils.createDefaultPopupFilterJoins(@props.table)

    return H.div null,
      H.div className: "text-muted", 
        "Optional connections for other tables to filtering the popup"
      H.table className: "table table-condensed table-bordered",
        H.thead null,
          H.tr null,
            H.th null, "Data Source"
            H.th null, "Connection"
        H.tbody null,
          _.map filterableTables, (filterableTable) =>
            H.tr key: filterableTable,
              H.td style: { verticalAlign: "middle" }, 
                ExprUtils.localizeString(@props.schema.getTable(filterableTable)?.name)
              H.td null,
                R ExprComponent,
                  schema: @props.schema
                  dataSource: @props.dataSource
                  table: filterableTable
                  value: popupFilterJoins[filterableTable]
                  onChange: @handleExprChange.bind(null, filterableTable)
                  types: ["id", "id[]"]
                  idTable: @props.table
                  preferLiteral: false
                  placeholder: "None"

        
    