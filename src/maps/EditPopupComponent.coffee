PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

# Modal for editing design of popup
ModalWindowComponent = require 'react-library/lib/ModalWindowComponent'
BlocksLayoutManager = require '../layouts/blocks/BlocksLayoutManager'
WidgetFactory = require '../widgets/WidgetFactory'
DirectWidgetDataSource = require '../widgets/DirectWidgetDataSource'
DashboardUtils = require '../dashboards/DashboardUtils'

module.exports = class EditPopupComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired # Schema to use
    dataSource: PropTypes.object.isRequired
    design: PropTypes.object.isRequired  # Design of the marker layer
    onDesignChange: PropTypes.func.isRequired # Called with new design
    table: PropTypes.string.isRequired
    
  constructor: ->
    super
    @state = { editing: false }

  handleItemsChange: (items) =>
    popup = @props.design.popup or {}
    popup = _.extend({}, popup, items: items)
    design = _.extend({}, @props.design, popup: popup)
    @props.onDesignChange(design)

  handleRemovePopup: =>
    design = _.omit(@props.design, "popup")
    @props.onDesignChange(design)

  render: ->
    # Get filterable tables of popup
    if @props.design.popup
      popupDashboard = { items: @props.design.popup.items, layout: "blocks" }
      filterableTables = DashboardUtils.getFilterableTables(popupDashboard, @props.schema)

    H.div null, 
      H.a className: "btn btn-link", onClick: (=> @setState(editing: true)),
        H.i className: "fa fa-pencil"
        " Customize Popup"

      if @props.design.popup
        H.a className: "btn btn-link", onClick: @handleRemovePopup,
          H.i className: "fa fa-times"
          " Remove Popup"

      H.pre null, JSON.stringify(filterableTables, null, 2)

      if @state.editing
        R ModalWindowComponent, isOpen: true, onRequestClose: (=> @setState(editing: false)),
          new BlocksLayoutManager().renderLayout({
            items: @props.design.popup?.items
            style: "popup"
            onItemsChange: @handleItemsChange
            disableMaps: true
            renderWidget: (options) =>
              widget = WidgetFactory.createWidget(options.type)

              widgetDataSource = new DirectWidgetDataSource({
                widget: widget
                schema: @props.schema
                dataSource: @props.dataSource
              })

              return widget.createViewElement({
                schema: @props.schema
                dataSource: @props.dataSource
                widgetDataSource: widgetDataSource
                design: options.design
                scope: null
                filters: []
                onScopeChange: null
                onDesignChange: options.onDesignChange
                width: options.width
                height: options.height
                standardWidth: options.standardWidth
                singleRowTable: @props.table
              })  
            })

