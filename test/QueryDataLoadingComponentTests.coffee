assert = require('chai').assert
_ = require 'lodash'
QueryDataLoadingComponent = require '../src/QueryDataLoadingComponent'
TestComponent = require './TestComponent'

describe "QueryDataLoadingComponent", ->
  before ->
    # Create simple mock parts
    @dataSource = (queries) -> queries.toUpperCase()
    @elemFactory = (data) -> data

  it "displays created element with data", ->
    comp = new TestComponent(React.createElement(QueryDataLoadingComponent, {
        elemFactory: @elemFactory
        dataSource: @dataSource
        queries: "abc"
      }))
    assert.match($(comp.getDOMNode()).text(), /ABC/)

  it "displays faded element with old data if no more factory"
  it "displays faded element with old data if loading"
  it "displays faded element with old data if loading fails"
  it "waits until load complete before trying another"
