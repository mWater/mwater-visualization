PropTypes = require 'prop-types'
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

DateExprComponent = require '../src/quickfilter/DateExprComponent'

storiesOf = require('@kadira/storybook').storiesOf
UpdateableComponent = require './UpdateableComponent'

storiesOf('DateExprComponent', module)
  .add 'date (blank)', => 
    R UpdateableComponent, 
      value: null
      (state, update) =>
        R DateExprComponent,
          type: "date"
          value: state.value
          onValueChange: update("value")

  .add 'date (today)', => 
    R UpdateableComponent, 
      value: { type: "op", op: "today", exprs: [] }
      (state, update) =>
        R DateExprComponent,
          type: "date"
          value: state.value
          onValueChange: update("value")

  .add 'datetime (blank)', => 
    R UpdateableComponent, 
      value: null
      (state, update) =>
        R DateExprComponent,
          type: "date"
          datetime: true
          value: state.value
          onValueChange: update("value")
