React = require('react/addons')
H = React.DOM

module.exports = class TestComponent
  constructor: (elem) ->
    @comp = React.addons.TestUtils.renderIntoDocument(
      React.createElement(ComponentWrapper, children: elem))

  setElement: (elem) ->
    @comp.setChildren(elem)

  getDOMNode: ->
    return React.findDOMNode(@comp)

# Wraps a react component, re-render
class ComponentWrapper extends React.Component
  constructor: (props) ->
    super
    @state = { children: @props.children }

  setChildren: (children) =>
    @setState(children: children)

  render: ->
    H.div null,
      @state.children

