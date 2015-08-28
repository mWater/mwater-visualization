assert = require('chai').assert
_ = require 'lodash'
LargeListComponent = require '../src/LargeListComponent'
TestComponent = require './TestComponent'

describe "LargeListComponent", ->
  describe "getVisiblePages", ->
    it "pages with buffering", (done) ->
      # page size is 10, height is 500, row height is 20, buffering is 10, rowCount is 10000
      # At scroll of 1000 pixels
      # Pixel range visible is 1000-1500
      # Rows visible is 50-75
      # With buffering: 40-85
      # Pages is 4-8
      comp = new TestComponent(React.createElement(LargeListComponent, {
        rowSource: null
        rowRenderer: null
        rowHeight: 20
        pageSize: 10
        height: 500
        rowCount: 10000
        bufferSize: 10
        }))

      _.defer () =>
        comp.getComponentNode().scrollTop = 1000
        _.defer () =>
          pages = comp.getComponent().getVisiblePages()
          assert.deepEqual(pages, [4, 5, 6, 7, 8])
          done()


  # it "displays created element with data", (done) ->
  #   comp = new TestComponent(React.createElement(QueryDataLoadingComponent, {
  #       elemFactory: @elemFactory
  #       dataSource: @dataSource
  #       queries: "abc"
  #     }))
  #   _.defer () =>
  #     assert.match($(comp.getDOMNode()).text(), /ABC/)
  #     done()

  # it "displays updated element with data", (done) ->
  #   comp = new TestComponent(React.createElement(QueryDataLoadingComponent, {
  #       elemFactory: @elemFactory
  #       dataSource: @dataSource
  #       queries: "abc"
  #     }))
  #   _.defer () =>
  #     comp.setElement(React.createElement(QueryDataLoadingComponent, {
  #       elemFactory: @elemFactory
  #       dataSource: @dataSource
  #       queries: "def"
  #       }))
  #     _.defer () =>
  #       assert.match($(comp.getDOMNode()).text(), /DEF/)
  #       done()

  # it "displays faded element with old data if no more factory", (done) ->
  #   comp = new TestComponent(React.createElement(QueryDataLoadingComponent, {
  #       elemFactory: @elemFactory
  #       dataSource: @dataSource
  #       queries: "abc"
  #     }))
  #   _.defer () =>
  #     comp.setElement(React.createElement(QueryDataLoadingComponent, {
  #       elemFactory: null
  #       dataSource: @dataSource
  #       queries: null
  #       }))
  #     _.defer () =>
  #       assert.match($(comp.getDOMNode()).text(), /ABC/)
  #       # TODO check faded
  #       done()

  # it "displays faded element with old data if loading", (done) ->
  #   comp = new TestComponent(React.createElement(QueryDataLoadingComponent, {
  #       elemFactory: @elemFactory
  #       dataSource: @dataSource
  #       queries: "abc"
  #     }))
  #   _.defer () =>
  #     dataSource = () ->
  #     comp.setElement(React.createElement(QueryDataLoadingComponent, {
  #       elemFactory: null
  #       dataSource: dataSource
  #       queries: null
  #       }))
  #     _.defer () =>
  #       assert.match($(comp.getDOMNode()).text(), /ABC/)
  #       # TODO check faded
  #       done()

  # it "displays error if loading fails", (done) ->
  #   comp = new TestComponent(React.createElement(QueryDataLoadingComponent, {
  #       elemFactory: @elemFactory
  #       dataSource: @dataSource
  #       queries: "abc"
  #     }))
  #   _.defer () =>
  #     dataSource = (queries, cb) -> cb("someerror")
  #     comp.setElement(React.createElement(QueryDataLoadingComponent, {
  #       elemFactory: @elemFactory
  #       dataSource: dataSource
  #       queries: "def"
  #       }))
  #     _.defer () =>
  #       assert.match($(comp.getDOMNode()).text(), /error/i)
  #       done()

  # it "waits until load complete before trying another", (done) ->
  #   # Store callbacks
  #   cbs = []
  #   dataSource = (queries, cb) => 
  #     cbs.push(cb)

  #   comp = new TestComponent(React.createElement(QueryDataLoadingComponent, {
  #       elemFactory: @elemFactory
  #       dataSource: dataSource
  #       queries: "abc"
  #     }))
  #   _.defer () =>
  #     # Single request queued
  #     assert.equal cbs.length, 1

  #     comp.setElement(React.createElement(QueryDataLoadingComponent, {
  #       elemFactory: @elemFactory
  #       dataSource: dataSource
  #       queries: "def"
  #       }))
  #     _.defer () =>
  #       # Still one request queued
  #       assert.equal cbs.length, 1

  #       # Finish first request
  #       cbs[0](null, "ABC")
  #       _.defer () =>
  #         # Does not display since different queries now
  #         assert.notMatch($(comp.getDOMNode()).text(), /ABC/)

  #         # Finish second request
  #         cbs[1](null, "DEF")
  #         _.defer () =>
  #           assert.match($(comp.getDOMNode()).text(), /DEF/)
  #           done()






