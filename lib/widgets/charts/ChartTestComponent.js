// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
// React = require 'react'
// R = React.createElement
// module.exports = class ChartTestComponent extends React.Component
//   constructor: ->
//     super
//     @state = { design: design }
//   handleDesignChange: (design) =>
//     # Clean design
//     design = @props.chart.cleanDesign(design)
//     @setState(design: design)
//   render: ->
//     R 'div', className: "row",
//       R 'div', className: "col-xs-6",
//         @props.chart.createViewElement(design: @state.design, data: data, width: 300, height: 300)
//       R 'div', className: "col-xs-6",
//         @props.chart.createDesignerElement(design: @state.design, onChange: @handleDesignChange)
// data = {"main":[{"x":"broken","y":"48520"},{"x":null,"y":"2976"},{"x":"ok","y":"173396"},{"x":"maint","y":"12103"},{"x":"missing","y":"3364"}]}
// design = {
//   "aesthetics": {
//     "x": {
//       "expr": {
//         "type": "scalar",
//         "table": "a",
//         "joins": [],
//         "expr": {
//           "type": "field",
//           "table": "a",
//           "column": "enum"
//         }
//       }
//     },
//     "y": {
//       "expr": {
//         "type": "scalar",
//         "table": "a",
//         "joins": [],
//         "expr": {
//           "type": "field",
//           "table": "a",
//           "column": "decimal"
//         }
//       },
//       "aggr": "sum"
//     }
//   },
//   "table": "a",
//   "filter": {
//     "type": "logical",
//     "table": "a",
//     "op": "and",
//     "exprs": [
//       {
//         "type": "comparison",
//         "table": "a",
//         "lhs": {
//           "type": "scalar",
//           "table": "a",
//           "joins": [],
//           "expr": {
//             "type": "field",
//             "table": "a",
//             "column": "integer"
//           }
//         },
//         "op": "=",
//         "rhs": {
//           "type": "literal",
//           "valueType": "integer",
//           "value": 5
//         }
//       }
//     ]
//   }
// }
