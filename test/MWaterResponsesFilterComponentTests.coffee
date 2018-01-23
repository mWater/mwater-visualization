R = require('react').createElement
sinon = require 'sinon'
enzyme = require 'enzyme'
assert = require('chai').assert
Schema = require('mwater-expressions').Schema
ui = require 'react-library/lib/bootstrap'

MWaterResponsesFilterComponent = require '../src/MWaterResponsesFilterComponent'

enzyme.configure({ adapter: new (require('enzyme-adapter-react-15'))() }) # Configure enzyme for react 15

describe "MWaterResponsesFilterComponent", ->
  before ->
    @schema = new Schema()
    @schema = @schema.addTable({ id: "responses:xyz", name: { en: "Survey" }, primaryKey: "_id", contents: [
      { id: "status", type: "enum", name: { en: "Status" }, enumValues: [{ id: "final", name: { en: "Final" } }] }
      { 
        id: "site1"
        type: "join"
        name: { en: "Site1" }
        join: {
          type: "n-1"
          toTable: "entities.water_point"
          fromColumn: "site1"
          toColumn: "code"
        }
      }
      { 
        id: "site2"
        type: "join"
        name: { en: "Site2" }
        join: {
          type: "n-1"
          toTable: "entities.community"
          fromColumn: "site2"
          toColumn: "code"
        }
      }
    ]})

    @finalFilter = { type: "op", op: "=", table: "responses:xyz", exprs: [
      { type: "field", table: "responses:xyz", column: "status" }
      { type: "literal", valueType: "enum", value: "final" }
    ]}

    @latestFilter = { type: "op", op: "is latest", table: "responses:xyz", exprs: [
      { type: "field", table: "responses:xyz", column: "site1" }
    ]}

    @latestFinalFilter = { type: "op", op: "is latest", table: "responses:xyz", exprs: [
      { type: "field", table: "responses:xyz", column: "site1" }
      @finalFilter
    ]}

    @otherFilter = { type: "field", table: "responses:xyz", column: "other" }

  it "filters from none to final", ->
    onChange = sinon.spy()
    wrapper = enzyme.shallow(R(MWaterResponsesFilterComponent, table: "responses:xyz", schema: @schema, filter: null, onFilterChange: onChange))

    # Set checkbox to true
    wrapper.find(ui.Checkbox).prop("onChange")(true)

    # Should set filter
    assert onChange.calledWith(@finalFilter)
 
  it "clears final filter, preserving others", ->
    onChange = sinon.spy()
    filter = {
      type: "op"
      table: "responses:xyz"
      op: "and"
      exprs: [@otherFilter, @finalFilter]
    }
    wrapper = enzyme.shallow(R(MWaterResponsesFilterComponent, table: "responses:xyz", schema: @schema, filter: filter, onFilterChange: onChange))

    # Final checkbox should be true
    assert.isTrue wrapper.find(ui.Checkbox).prop("value")

    # Set checkbox to false
    wrapper.find(ui.Checkbox).prop("onChange")(false)

    # Should set filter
    assert.isTrue onChange.calledWith(@otherFilter)

  it "lists site questions + all", ->
    wrapper = enzyme.shallow(R(MWaterResponsesFilterComponent, table: "responses:xyz", schema: @schema, filter: null, onFilterChange: ->))
    assert.equal wrapper.find(ui.Radio).length, 3

  it "adds non-final site", ->
    onChange = sinon.spy()
    wrapper = enzyme.shallow(R(MWaterResponsesFilterComponent, table: "responses:xyz", schema: @schema, filter: null, onFilterChange: onChange))
    
    radio = wrapper.find(ui.Radio).at(1)
    radio.prop("onChange")(radio.prop("radioValue"))

    assert.isTrue onChange.calledWith(@latestFilter), JSON.stringify(onChange.firstCall.args)

  it "adds final site", ->
    onChange = sinon.spy()
    wrapper = enzyme.shallow(R(MWaterResponsesFilterComponent, table: "responses:xyz", schema: @schema, filter: @finalFilter, onFilterChange: onChange))
    
    radio = wrapper.find(ui.Radio).at(1)
    radio.prop("onChange")(radio.prop("radioValue"))

    assert.isTrue onChange.calledWith(@latestFinalFilter), JSON.stringify(onChange.firstCall.args)
