H = React.DOM

module.exports = class ChartTestComponent extends React.Component
  render: ->
    H.div className: "row",
      H.div className: "col-xs-8",
        React.createElement(BarChartComponent, width: "100%", height: 500)
      H.div className: "col-xs-4",
        React.createElement(BarChartDesignerComponent)


class BarChartDesignerComponent extends React.Component
  render: ->
    H.div null,
      H.div className: "form-group",
        H.label null, "Bar size"
        H.input type: "text", className: "form-control", placeholder: "Click to select..."
        H.p className: "help-block", "Data to control the size of the bars"

      H.div className: "form-group",
        H.label null, "Group By"
        H.input type: "text", className: "form-control", placeholder: "Click to select..."



barChartData = [
    {
        key: "Cumulative Return",
        values: [
            {
                "label" : "A" ,
                "value" : 29.765957771107
            } ,
            {
                "label" : "B" ,
                "value" : 0
            } ,
            {
                "label" : "C" ,
                "value" : 32.807804682612
            } ,
            {
                "label" : "D" ,
                "value" : 196.45946739256
            } ,
            {
                "label" : "E" ,
                "value" : 0.19434030906893
            } ,
            {
                "label" : "F" ,
                "value" : 98.079782601442
            } ,
            {
                "label" : "G" ,
                "value" : 13.925743130903
            } ,
            {
                "label" : "H" ,
                "value" : 5.1387322875705
            }
        ]
    }
];


class BarChartComponent extends React.Component

  componentDidMount: ->
    el = React.findDOMNode(@refs.chart)

    nv.addGraph =>
      chart = nv.models.discreteBarChart()
          .x((d) -> d.label)
          .y((d) -> d.value)
          .staggerLabels(true)
          #.staggerLabels(historicalBarChart[0].values.length > 8)
          .showValues(true)
          .duration(250)
          # .height(200)
          # .width(300)
          
      d3.select(el)
          .datum(barChartData)
          .call(chart)
      # nv.utils.windowResize(chart.update)
      return ChartTestComponent

  render: ->
    H.div style: { width: @props.width, height: @props.height }, 
      H.svg ref: "chart"
