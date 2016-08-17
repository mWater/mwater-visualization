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

  handleStyleChange: (ev) =>
    @handleDesignChange(_.extend({}, @state.design, { style: ev.target.value or null }))

  render: ->
    # Don't show if not editing
    if not @state.design
      return null

    return R ActionCancelModalComponent, 
      size: "large"
      onCancel: @handleCancel
      onAction: @handleSave,
        R QuickfiltersDesignComponent, {
          design: @state.design.quickfilters
          onDesignChange: (design) => @handleDesignChange(update(@state.design, { quickfilters: { $set: design } }))
          schema: @props.schema
          dataSource: @props.dataSource
        }
        H.div className: "form-group",
          H.label null, "Style"
          H.select className: "form-control", value: @state.design.style or "", onChange: @handleStyleChange,
            H.option key: "none", value: "", "Default"
            H.option key: "greybg", value: "greybg", "White on Grey"
