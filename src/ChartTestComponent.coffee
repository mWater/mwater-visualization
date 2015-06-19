React = require 'react'
H = React.DOM

module.exports = class ChartTestComponent extends React.Component
  constructor: ->
    super
    @state = { design: design }

  handleDesignChange: (design) =>
    # Clean design
    design = @props.chart.cleanDesign(design)

    @setState(design: design)
    console.log JSON.stringify(design, null, 2)

  render: ->
    # data = {
    #   main: [
    #     { x: "apple", y: 4 }
    #     { x: "banana", y: 20 }
    #   ]
    # }

    H.div className: "row",
      H.div className: "col-xs-6",
        @props.chart.createViewElement(design: @state.design, data: data, width: 500, height: 500)
      H.div className: "col-xs-6",
        @props.chart.createDesignerElement(design: @state.design, onChange: @handleDesignChange)
    
data = {"main":[{"x":"broken","y":"48520"},{"x":null,"y":"2976"},{"x":"ok","y":"173396"},{"x":"maint","y":"12103"},{"x":"missing","y":"3364"}]}    

design = {
  "aesthetics": {
    "x": {
      "expr": {
        "type": "scalar",
        "table": "a",
        "joins": [],
        "expr": {
          "type": "field",
          "table": "a",
          "column": "enum"
        }
      }
    },
    "y": {
      "expr": {
        "type": "scalar",
        "table": "a",
        "joins": [],
        "expr": {
          "type": "field",
          "table": "a",
          "column": "decimal"
        }
      },
      "aggr": "sum"
    }
  },
  "table": "a",
  "filter": {
    "type": "logical",
    "table": "a",
    "op": "and",
    "exprs": [
      {
        "type": "comparison",
        "table": "a",
        "lhs": {
          "type": "scalar",
          "table": "a",
          "joins": [],
          "expr": {
            "type": "field",
            "table": "a",
            "column": "integer"
          }
        },
        "op": "=",
        "rhs": {
          "type": "literal",
          "valueType": "integer",
          "value": 5
        }
      }
    ]
  }
}