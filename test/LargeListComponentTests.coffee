assert = require('chai').assert
_ = require 'lodash'
LargeListComponent = require '../src/LargeListComponent'
TestComponent = require './TestComponent'

# DOESNT WORK AS CAN'T SCROLL INVISIBLE ELEMENTS
# describe "LargeListComponent", ->
#   describe "getVisiblePages", ->
#     it "pages with buffering", (done) ->
#       # page size is 10, height is 500, row height is 20, buffering is 10, rowCount is 10000
#       # At scroll of 1000 pixels
#       # Pixel range visible is 1000-1500
#       # Rows visible is 50-75
#       # With buffering: 40-85
#       # Pages is 4-8
#       comp = new TestComponent(React.createElement(LargeListComponent, {
#         rowSource: null
#         rowRenderer: null
#         rowHeight: 20
#         pageSize: 10
#         height: 500
#         rowCount: 10000
#         bufferSize: 10
#         }))

#       _.defer () =>
#         comp.getComponentNode().scrollTop = 1000
#         _.defer () =>
#           pages = comp.getComponent().getVisiblePages()
#           assert.deepEqual(pages, [4, 5, 6, 7, 8])
#           done()
