React = require 'react'
H = React.DOM

LargeListComponent = require './LargeListComponent'

$ ->
  sample = React.createElement(LargeListComponent, {
    loadRows: (start, number, cb) => 
      setTimeout () =>
        cb(null, _.range(start, start + number + 1))
      , 400

    renderRow: (row, index) -> H.div(style: {height: 25} , "" + row)
    rowHeight: 25
    pageSize: 50
    height: 500
    rowCount: 10000
    bufferSize: 100
    })
  React.render(sample, document.body)

