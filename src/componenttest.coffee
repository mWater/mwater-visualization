React = require 'react'
H = React.DOM

LargeListComponent = require './LargeListComponent'

$ ->
  sample = React.createElement(LargeListComponent, {
    loadRows: (start, number, cb) => 
      # console.log start
      # console.log number
      setTimeout () =>
        cb(null, _.range(start, start + number))
      , 200

    renderRow: (row, index) -> H.div(style: { height: 25 }, key: index + "", "" + row)
    rowHeight: 25
    pageSize: 100
    height: 500
    rowCount: 10000
    bufferSize: 100
    })
  React.render(sample, document.body)

