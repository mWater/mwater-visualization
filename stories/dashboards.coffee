PropTypes = require 'prop-types'
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

storiesOf = require('@kadira/storybook').storiesOf

DashboardComponent = require '../src/dashboards/DashboardComponent'
DirectDashboardDataSource = require '../src/dashboards/DirectDashboardDataSource'
MWaterLoaderComponent = require '../src/MWaterLoaderComponent'
UpdateableComponent = require './UpdateableComponent'

storiesOf('dashboard', module)
  .add 'empty dashboard', => 
    R DashboardTest

 .add 'table dashboard', => 
    R DashboardTest, design: tableDashboardDesign

  .add 'popup', => 
    R DashboardPopupTest


tableDashboardDesign = {
  "items": {
    "id": "root",
    "type": "root",
    "blocks": [
      {
        "type": "widget",
        "aspectRatio": 1.4,
        "widgetType": "TableChart",
        "design": {
          "version": 1,
          "columns": [
            {
              "id": "f1532afb-c0ea-48de-8e4e-931b147eeb6f",
              "textAxis": {
                "expr": {
                  "type": "field",
                  "table": "entities.place_of_worship",
                  "column": "name"
                }
              }
            }
          ],
          "orderings": [],
          "table": "entities.place_of_worship"
        },
        "id": "193bbc40-9177-4547-8b83-c2b5441f72c3"
      }
    ]
  },
  "layout": "blocks"
}


class DashboardTest extends React.Component
  @propTypes:
    design: PropTypes.object

  render: ->
    R UpdateableComponent, 
      design: @props.design or { items: { id: "root", type: "root", blocks: [] }, layout: "blocks" }
      (state, update) =>
        apiUrl = "https://api.mwater.co/v3/"
        R MWaterLoaderComponent, {
          apiUrl: apiUrl
          client: null
          user: null
          onExtraTablesChange: update("extraTables")
          extraTables: state.extraTables
        }, (error, config) =>
          if error
            alert("Error: " + error.message)
            return null

          dashboardDataSource = new DirectDashboardDataSource({
            apiUrl: apiUrl
            client: null
            design: state.design
            schema: config.schema
            dataSource: config.dataSource
          })

          H.div style: { height: 800 },
            React.createElement(DashboardComponent, {
              schema: config.schema
              dataSource: config.dataSource
              dashboardDataSource: dashboardDataSource
              design: state.design
              onDesignChange: update("design")
              titleElem: "Sample"
              # quickfilterLocks: [{ expr: { type: "field", table: "entities.water_point", column: "type" }, value: "Protected dug well" }]
            })


class DashboardPopupTest extends React.Component
  render: ->
    R UpdateableComponent, 
      popup: { name: "Untitled", design: { items: { id: "root", type: "root", blocks: [] }, layout: "blocks" } }
      (state, update) =>
        apiUrl = "https://api.mwater.co/v3/"
        R MWaterLoaderComponent, {
          apiUrl: apiUrl
          client: null
          user: null
          # onExtraTablesChange: (extraTables) => @setState(extraTables: extraTables)
          # extraTables: @state.extraTables
        }, (error, config) =>
          if error
            alert("Error: " + error.message)
            return null

          dashboardDataSource = new DirectDashboardDataSource({
            apiUrl: apiUrl
            client: null
            design: state.popup.design
            schema: config.schema
            dataSource: config.dataSource
          })

          return H.div null,
            R DashboardPopupComponent, 
              ref: (comp) => @popupComponent = comp
              schema: config.schema
              dataSource: config.dataSource
              dashboardDataSource: dashboardDataSource
              popup: state.popup
              onPopupChange: update("popup")

            H.button 
              type: "button"
              onClick: => @popupComponent.show()
              className: "btn btn-default",
                "Show"


ModalWindowComponent = require 'react-library/lib/ModalWindowComponent'
ui = require 'react-library/lib/bootstrap'
update = require 'react-library/lib/update'

class DashboardPopupComponent extends React.Component
  @propTypes:
    popup: PropTypes.object.isRequired
    onPopupChange: PropTypes.func               # If not set, readonly
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired
    dashboardDataSource: PropTypes.object.isRequired # dashboard data source

    onRowClick: PropTypes.func     # Called with (tableId, rowId) when item is clicked
    namedStrings: PropTypes.object # Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget

    # Filters to add to the dashboard
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired    # id table to filter
      jsonql: PropTypes.object.isRequired   # jsonql filter with {alias} for tableAlias
    }))

  constructor: ->
    super

    @state = {
      open: false
    }

  # Updates with the specified changes
  update: => update(@props.popup, @props.onPopupChange, arguments)

  show: ->
    @setState(open: true)

  render: ->
    R ModalWindowComponent, 
      onRequestClose: => @setState(open: false)
      isOpen: @state.open,
        R DashboardComponent, {
          schema: @props.schema
          dataSource: @props.dataSource
          dashboardDataSource: @props.dashboardDataSource
          design: @props.popup.design
          onDesignChange: @update("design")
          # titleElem: H.span style: { fontSize: 20, cursor: "pointer" },
          #   H.span className: "text-muted", onClick: (=> @setState(open: false)),
          #     R ui.Icon, id: "fa-arrow-left"
        }


