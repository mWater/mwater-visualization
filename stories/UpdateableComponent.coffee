_ = require 'lodash'
React = require 'react'

# Convenience wrapper that allows updating state
module.exports = class UpdateableComponent extends React.Component
  constructor: (props) ->
    super(props)
    @state = _.clone(@props or {})

  # Creates update function
  update: (name) =>
    return (value) =>
      upt = {}
      upt[name] = value
      @setState(upt)
      console.log JSON.stringify(upt, null, 2)
      # action("update")(upt)

  render: ->
    @props.children(@state, @update)

