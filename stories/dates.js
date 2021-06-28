PropTypes = require 'prop-types'
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

DateExprComponent = require '../src/quickfilter/DateExprComponent'

DateRangeComponent = require '../src/DateRangeComponent'

storiesOf = require('@kadira/storybook').storiesOf
UpdateableComponent = require './UpdateableComponent'

storiesOf('DateExprComponent', module)
  .add 'date (blank)', => 
    R UpdateableComponent, 
      value: null
      (state, update) =>
        R DateExprComponent,
          value: state.value
          onChange: update("value")

  .add 'date (today)', => 
    R UpdateableComponent, 
      value: { type: "op", op: "today", exprs: [] }
      (state, update) =>
        R DateExprComponent,
          value: state.value
          onChange: update("value")

  .add 'datetime (blank)', => 
    R UpdateableComponent, 
      value: null
      (state, update) =>
        R DateExprComponent,
          datetime: true
          value: state.value
          onChange: update("value")

storiesOf('DateRangeComponent', module)
  .add 'date (blank)', => 
    R UpdateableComponent, 
      value: null
      (state, update) =>
        R DateRangeComponent,
          value: state.value
          onChange: update("value")

  .add 'date (today)', => 
    R UpdateableComponent, 
      value: [moment().format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")]
      (state, update) =>
        R DateRangeComponent,
          value: state.value
          onChange: update("value")

  .add 'datetime (blank)', => 
    R UpdateableComponent, 
      value: null
      (state, update) =>
        R DateRangeComponent,
          datetime: true
          value: state.value
          onChange: update("value")
