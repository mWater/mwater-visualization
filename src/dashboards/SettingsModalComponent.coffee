_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
update = require 'update-object'

ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent')
QuickfiltersDesignComponent = require '../quickfilter/QuickfiltersDesignComponent'

# Popup with settings for dashboard
module.exports = class SettingsModalComponent extends React.Component
  @propTypes:
    onDesignChange: React.PropTypes.func.isRequired
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired

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

  render: ->
    # Don't show if not editing
    if not @state.design
      return null

    return R ActionCancelModalComponent, 
      size: "large"
      onCancel: @handleCancel
      onAction: @handleSave,
        H.div null,
          H.h4 null, "Quick Filters"
          H.div className: "text-muted", 
            "Quick filters are shown to the user at the top of the dashboard and can be used to filter data of widgets."
         
          R QuickfiltersDesignComponent, {
            design: @state.design.quickfilters
            onDesignChange: (design) => @handleDesignChange(update(@state.design, { quickfilters: { $set: design } }))
            schema: @props.schema
            dataSource: @props.dataSource
          }
