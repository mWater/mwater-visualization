React = require 'react'
H = React.DOM

# LargeListComponent = require './LargeListComponent'

VerticalLayoutComponent = require './VerticalLayoutComponent'

class Parent extends React.Component
  componentDidMount: ->
    console.log @refs

  render: ->
    H.div null,
      H.div ref: "simple",
        H.div ref: "complex"
      React.createElement(Child, {},
        H.div ref: "simple2",
          H.div ref: "complex2"
        )

class Child extends React.Component
  render: ->
    H.div style: { height: @props.height, backgroundColor: @props.backgroundColor },
      @props.children

$ ->
  sample = React.createElement(VerticalLayoutComponent,
    height: 200
    relativeHeights: { a: 0.6, b: 0.4 },
      React.createElement(Child, key: "a", backgroundColor: "red")
      React.createElement(Child, key: "b", backgroundColor: "green")
      React.createElement(Child, key: "c", backgroundColor: "blue", height: 50)

    )
  # sample = React.createElement(LargeListComponent, {
  #   loadRows: (start, number, cb) => 
  #     # console.log start
  #     # console.log number
  #     setTimeout () =>
  #       cb(null, _.range(start, start + number))
  #     , 200

  #   renderRow: (row, index) -> H.div(style: { height: 25 }, key: index + "", "" + row)
  #   rowHeight: 25
  #   pageSize: 100
  #   height: 500
  #   rowCount: 10000
  #   bufferSize: 100
  #   })
  React.render(sample, document.body)

