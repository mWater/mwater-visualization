React = require('react')
ReactDOM = require('react-dom')
TestUtils = require('react-addons-test-utils')
R = React.createElement

module.exports = class TestComponent
  constructor: (elem) ->
    @comp = TestUtils.renderIntoDocument(
      React.createElement(ComponentWrapper, elem: elem))

  setElement: (elem) ->
    @comp.setElement(elem)

  getComponent: ->
    return @comp.getComponent()

  getComponentNode: ->
    return @comp.getComponentNode()

# Wraps a react component, re-render
class ComponentWrapper extends React.Component
  constructor: (props) ->
    super(props)
    @state = { elem: @props.elem }

  setElement: (elem) =>
    @setState(elem: elem)

  getComponent: ->
    return @refs.comp

  getComponentNode: ->
    return ReactDOM.findDOMNode(@refs.comp)

  render: ->
    R 'div', null,
      React.cloneElement(@state.elem, ref: "comp")

