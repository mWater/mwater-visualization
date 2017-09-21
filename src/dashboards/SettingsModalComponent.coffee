PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
update = require 'update-object'
languages = require 'languages'

ui = require 'react-library/lib/bootstrap'
ReactSelect = require 'react-select'

DashboardUtils = require './DashboardUtils'
ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent')
QuickfiltersDesignComponent = require '../quickfilter/QuickfiltersDesignComponent'
FiltersDesignerComponent = require '../FiltersDesignerComponent'

# Popup with settings for dashboard
module.exports = class SettingsModalComponent extends React.Component
  @propTypes:
    onDesignChange: PropTypes.func.isRequired
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired

  constructor: (props) ->
    super
    @state = { 
      design: null # Set when being edited
    }

  show: (design) ->
    @setState(design: design)

  handleSave: =>
    @props.onDesignChange(@state.design)
    @setState(design: null)

  handleCancel: => @setState(design: null)

  handleDesignChange: (design) => @setState(design: design)

  handleFiltersChange: (filters) =>
    design = _.extend({}, @state.design, filters: filters)
    @handleDesignChange(design)

  render: ->
    # Don't show if not editing
    if not @state.design
      return null

    # Get filterable tables
    filterableTables = DashboardUtils.getFilterableTables(@state.design, @props.schema)

    localeOptions = _.map languages.getAllLanguageCode(), (code) =>
      { 
        value: code
        label: languages.getLanguageInfo(code).name + " (" + languages.getLanguageInfo(code).nativeName + ")" 
      }

    return R ActionCancelModalComponent, 
      size: "large"
      onCancel: @handleCancel
      onAction: @handleSave,
        H.div style: { paddingBottom: 200 },
          H.h4 null, "Quick Filters"
          H.div className: "text-muted", 
            "Quick filters are shown to the user as a dropdown at the top of the dashboard and can be used to filter data of widgets."
         
          R QuickfiltersDesignComponent, {
            design: @state.design.quickfilters
            onDesignChange: (design) => @handleDesignChange(update(@state.design, { quickfilters: { $set: design } }))
            schema: @props.schema
            dataSource: @props.dataSource
          }

          H.h4 style: { paddingTop: 10 },
            "Filters"
          H.div className: "text-muted", 
            "Filters are built in to the dashboard and cannot be changed by viewers of the dashboard."
          
          if filterableTables.length > 0         
            R FiltersDesignerComponent, 
              schema: @props.schema
              dataSource: @props.dataSource
              filters: @state.design.filters
              onFiltersChange: @handleFiltersChange
              filterableTables: filterableTables
          else
            "Nothing to filter. Add widgets to the dashboard"

          H.h4 style: { paddingTop: 10 },
            "Language"
          H.div className: "text-muted", 
            "Controls the preferred language of widgets and uses specified language when available"

          R ReactSelect, 
            value: @state.design.locale or "en"
            options: localeOptions
            clearable: false
            onChange: (value) => @handleDesignChange(update(@state.design, { locale: { $set: value } }))

          H.h4 style: { paddingTop: 10 },
            "Advanced"
          R ui.Checkbox, 
            value: (if @state.design.implicitFiltersEnabled? then @state.design.implicitFiltersEnabled else true)
            onChange: ((value) => @handleDesignChange(update(@state.design, { implicitFiltersEnabled: { $set: value } }))),
              "Enable Implicit Filtering (leave unchecked for new dashboards)"