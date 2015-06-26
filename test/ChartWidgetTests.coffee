assert = require('chai').assert
_ = require 'lodash'
React = require 'react'
H = React.DOM

ChartWidget = require '../src/ChartWidget'
Chart = require '../src/Chart'
DataSource = require '../src/DataSource'
React = require('react/addons')

describe "ChartWidget", ->
  beforeEach ->
    @chart = new MockChart()
    @dataSource = new MockDataSource()
    @design = "some design"

  it "displays validation error if design invalid", ->
    @chart.validateDesign = -> "validation error"

    cw = new ChartWidget(@chart, @design, @dataSource)
    comp = React.addons.TestUtils.renderIntoDocument(cw.createViewElement(width: 100, height: 100))
    assert.match($(React.findDOMNode(comp)).text(), /validation error/)

  it "displays loading when getting data", ->
    dataSourceCb = null
    @dataSource.fetchData = (queries, cb) -> dataSourceCb = cb

    cw = new ChartWidget(@chart, @design, @dataSource)
    comp = React.addons.TestUtils.renderIntoDocument(cw.createViewElement(width: 100, height: 100))
    assert.match($(React.findDOMNode(comp)).text(), /loading/i)

  it "displays error if getting data fails", ->
    dataSourceCb = null
    @dataSource.fetchData = (queries, cb) -> cb(new Error("some error"))

    cw = new ChartWidget(@chart, @design, @dataSource)
    comp = React.addons.TestUtils.renderIntoDocument(cw.createViewElement(width: 100, height: 100))
    assert.match($(React.findDOMNode(comp)).text(), /some error/)

  it "displays data contents after loading", ->
    cw = new ChartWidget(@chart, @design, @dataSource)
    comp = React.addons.TestUtils.renderIntoDocument(cw.createViewElement(width: 100, height: 100))
    assert.match($(React.findDOMNode(comp)).text(), /QUERYA/)

  it "does not requery if queries same", ->
    cw = new ChartWidget(@chart, @design, @dataSource)
    comp = React.addons.TestUtils.renderIntoDocument(React.createElement(ComponentWrapper, {
      children: cw.createViewElement(width: 100, height: 100)
      }))
    assert.match($(React.findDOMNode(comp)).text(), /QUERYA/)

    @dataSource.fetchData = -> throw new Error("should not call")
    comp.setChildren(cw.createViewElement(width: 100, height: 100))

  it "does requery if queries different", ->
    cw = new ChartWidget(@chart, @design, @dataSource)
    comp = React.addons.TestUtils.renderIntoDocument(React.createElement(ComponentWrapper, {
      children: cw.createViewElement(width: 100, height: 100)
      }))
    assert.match($(React.findDOMNode(comp)).text(), /QUERYA/)

    @chart.createQueries = -> { c: "queryc" }
    comp.setChildren(cw.createViewElement(width: 100, height: 100))
    assert.match($(React.findDOMNode(comp)).text(), /QUERYC/)

class MockDataSource
  fetchData: (queries, cb) ->
    # Capitalize queries
    cb(null, _.mapValues(queries, (q) -> q.toUpperCase()))

class MockChart
  cleanDesign: (design) -> design
  validateDesign: (design) -> null

  # Creates a design element with specified options
  # options include design: design and onChange: function
  createDesignerElement: (options) ->
    throw new Error("Not implemented")

  createQueries: (design) -> { a: "querya", b: "queryb" }

  # Options include 
  # design: design of the component
  # data: results from queries
  # width, height: size of the chart view
  createViewElement: (options) ->
    return H.div null, JSON.stringify(options.data)

# Wraps a react component, re-render
class ComponentWrapper extends React.Component
  constructor: (props) ->
    super
    @state = { children: @props.children }

  setChildren: (children) =>
    @setState(children: children)

  render: ->
    H.div null,
      @state.children