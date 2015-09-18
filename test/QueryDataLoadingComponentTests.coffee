assert = require('chai').assert
_ = require 'lodash'
$ = require 'jquery'
React = require 'react'
QueryDataLoadingComponent = require '../src/widgets/QueryDataLoadingComponent'
TestComponent = require './TestComponent'

describe "QueryDataLoadingComponent", ->
  @timeout(10000)
  before ->
    # Create simple mock parts
    @dataSource = (queries, cb) -> cb(null, queries.toUpperCase())
    @elemFactory = (data) -> data

  it "displays created element with data", (done) ->
    comp = new TestComponent(React.createElement(QueryDataLoadingComponent, {
        elemFactory: @elemFactory
        dataSource: @dataSource
        queries: "abc"
      }))
    _.defer () =>
      assert.match($(comp.getComponentNode()).text(), /ABC/)
      done()

  it "displays updated element with data", (done) ->
    comp = new TestComponent(React.createElement(QueryDataLoadingComponent, {
        elemFactory: @elemFactory
        dataSource: @dataSource
        queries: "abc"
      }))
    _.defer () =>
      comp.setElement(React.createElement(QueryDataLoadingComponent, {
        elemFactory: @elemFactory
        dataSource: @dataSource
        queries: "def"
        }))
      _.defer () =>
        assert.match($(comp.getComponentNode()).text(), /DEF/)
        done()

  it "displays faded element with old data if no more factory", (done) ->
    comp = new TestComponent(React.createElement(QueryDataLoadingComponent, {
        elemFactory: @elemFactory
        dataSource: @dataSource
        queries: "abc"
      }))
    _.defer () =>
      comp.setElement(React.createElement(QueryDataLoadingComponent, {
        elemFactory: null
        dataSource: @dataSource
        queries: null
        }))
      _.defer () =>
        assert.match($(comp.getComponentNode()).text(), /ABC/)
        # TODO check faded
        done()

  it "displays faded element with old data if loading", (done) ->
    comp = new TestComponent(React.createElement(QueryDataLoadingComponent, {
        elemFactory: @elemFactory
        dataSource: @dataSource
        queries: "abc"
      }))
    _.defer () =>
      dataSource = () ->
      comp.setElement(React.createElement(QueryDataLoadingComponent, {
        elemFactory: null
        dataSource: dataSource
        queries: null
        }))
      _.defer () =>
        assert.match($(comp.getComponentNode()).text(), /ABC/)
        # TODO check faded
        done()

  it "displays error if loading fails", (done) ->
    comp = new TestComponent(React.createElement(QueryDataLoadingComponent, {
        elemFactory: @elemFactory
        dataSource: @dataSource
        queries: "abc"
      }))
    _.defer () =>
      dataSource = (queries, cb) -> cb("someerror")
      comp.setElement(React.createElement(QueryDataLoadingComponent, {
        elemFactory: @elemFactory
        dataSource: dataSource
        queries: "def"
        }))
      _.defer () =>
        assert.match($(comp.getComponentNode()).text(), /error/i)
        done()

  it "waits until load complete before trying another", (done) ->
    # Store callbacks
    cbs = []
    dataSource = (queries, cb) => 
      cbs.push(cb)

    comp = new TestComponent(React.createElement(QueryDataLoadingComponent, {
        elemFactory: @elemFactory
        dataSource: dataSource
        queries: "abc"
      }))
    _.defer () =>
      # Single request queued
      assert.equal cbs.length, 1

      comp.setElement(React.createElement(QueryDataLoadingComponent, {
        elemFactory: @elemFactory
        dataSource: dataSource
        queries: "def"
        }))
      _.defer () =>
        # Still one request queued
        assert.equal cbs.length, 1

        # Finish first request
        cbs[0](null, "ABC")
        _.defer () =>
          # Does not display since different queries now
          assert.notMatch($(comp.getComponentNode()).text(), /ABC/)

          # Finish second request
          cbs[1](null, "DEF")
          _.defer () =>
            assert.match($(comp.getComponentNode()).text(), /DEF/)
            done()






