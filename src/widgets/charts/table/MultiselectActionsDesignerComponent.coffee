_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

ui = require 'react-library/lib/bootstrap'

# Designs list of multiselectActions (see TableChart.coffee)
module.exports = class MultiselectActionsDesignerComponent extends React.Component
  @propTypes:
    # Actions that can be included
    availableActions: React.PropTypes.arrayOf(React.PropTypes.shape({ id: React.PropTypes.string.isRequired, name: React.PropTypes.string.isRequired })).isRequired 

    multiselectActions: React.PropTypes.arrayOf(React.PropTypes.shape({ action: React.PropTypes.string.isRequired, label: React.PropTypes.string.isRequired }))
    onMultiselectActionsChange: React.PropTypes.func.isRequired

  handleActionChange: (action, value) =>
    multiselectActions = (@props.multiselectActions or []).slice()

    if value
      multiselectActions.push({ action: action.id, label: action.name })
    else
      multiselectActions = _.filter(multiselectActions, (ma) -> ma.action != action.id)

    @props.onMultiselectActionsChange(multiselectActions)

  handleActionLabelChange: (multiselectAction, label) =>
    multiselectActions = _.cloneDeep(@props.multiselectActions or [])

    for ma in multiselectActions
      if ma.action == multiselectAction.action
        ma.label = label

    @props.onMultiselectActionsChange(multiselectActions)

  renderAction: (action) ->
    multiselectAction = _.findWhere(@props.multiselectActions, { action: action.id })

    H.div key: action.id,
      R ui.Checkbox, value: multiselectAction?, onChange: @handleActionChange.bind(null, action),
        action.name
        if multiselectAction
          R ui.TextInput, 
            size: "sm"
            value: multiselectAction.label
            onChange: @handleActionLabelChange.bind(null, multiselectAction)

  render: ->
    return H.div null,
      _.map(@props.availableActions, (action) => @renderAction(action)) 


