React = require 'react'
H = React.DOM

module.exports = class ChartTestComponent extends React.Component
  constructor: ->
    super
    @state = { design: {
      aesthetics: {}
      } }

  handleDesignChange: (design) =>
    # Clean design
    design = @props.chart.cleanDesign(design)

    @setState(design: design)

  render: ->
    data = {
      main: [
        { x: "apple", y: 4 }
        { x: "banana", y: 20 }
      ]
    }
    
    H.div className: "row",
      H.div className: "col-xs-6",
        @props.chart.createViewElement(design: @state.design, data: data, width: "100%", height: 500)
      H.div className: "col-xs-6",
        @props.chart.createDesignerElement(design: @state.design, onChange: @handleDesignChange)
        
