React = require 'react'
H = React.DOM

LargeListComponent = require './LargeListComponent'

$ ->
  sample = React.createElement(LargeListComponent, {
    rowSource: null
    rowRenderer: null
    rowHeight: 25
    pageSize: 50
    height: 500
    rowCount: 10000
    bufferSize: null
    })
  React.render(sample, document.body)

