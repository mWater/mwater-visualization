React = require 'react'
ReactDOM = require 'react-dom'
H = React.DOM
R = React.createElement

BlocksDesignerComponent = require './blocks/BlocksDesignerComponent'
BlockRenderer = require './blocks/BlockRenderer'

class DemoComponent extends React.Component
  constructor: ->
    super

    @state = { design: design }

  render: ->
    renderBlock = new BlockRenderer().renderBlock

    R BlocksDesignerComponent, 
      renderBlock: renderBlock
      design: @state.design
      onDesignChange: (design) => @setState(design: design)

$ ->
  sample = H.div className: "container-fluid", style: { height: "100%", paddingLeft: 0, paddingRight: 0 },
    H.style null, '''html, body, #main { height: 100% }'''
    React.createElement(DemoComponent)

  ReactDOM.render(sample, document.getElementById("main"))

design = {
  id: "root"
  type: "root"
  design: {
    blocks: [
      { id: "1", type: "horizontal", design: { blocks: [
        { id: "2", type: "text" }
        { id: "3", type: "image" }
        ]}}
      { id: "4", type: "text" }
    ]
  }    
}