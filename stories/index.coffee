_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

storiesOf = require('@kadira/storybook').storiesOf
action = require('@kadira/storybook').action
UpdateableComponent = require './UpdateableComponent'

MultiselectActionsDesignerComponent = require "../src/widgets/charts/table/MultiselectActionsDesignerComponent"

require './dashboards'
require './pivotChart'

require './maps'

storiesOf('MultiselectActionsDesignerComponent', module)
  .add 'empty', => 
    R UpdateableComponent, 
      multiselectActions: [],
      (state, update) =>
        R MultiselectActionsDesignerComponent, 
          availableActions: [{ id: "a", name: "Action A" }, { id: "b", name: "Action B" }]
          multiselectActions: state.multiselectActions
          onMultiselectActionsChange: update("multiselectActions")
