// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import { createElement as R } from "react"
import sinon from "sinon"
import enzyme from "enzyme"
import { assert } from "chai"
import { Schema } from "mwater-expressions"
import ui from "react-library/lib/bootstrap"
import MWaterResponsesFilterComponent from "../src/MWaterResponsesFilterComponent"

enzyme.configure({ adapter: new (require("enzyme-adapter-react-16"))() }) // Configure enzyme for react 16

describe("MWaterResponsesFilterComponent", function () {
  before(function () {
    this.schema = new Schema()
    this.schema = this.schema.addTable({
      id: "responses:xyz",
      name: { en: "Survey" },
      primaryKey: "_id",
      contents: [
        { id: "status", type: "enum", name: { en: "Status" }, enumValues: [{ id: "final", name: { en: "Final" } }] },
        {
          id: "data:site1",
          type: "join",
          name: { en: "Site1" },
          join: {
            type: "n-1",
            toTable: "entities.water_point",
            fromColumn: "data:site1",
            toColumn: "code"
          }
        },
        {
          id: "data:site2",
          type: "join",
          name: { en: "Site2" },
          join: {
            type: "n-1",
            toTable: "entities.community",
            fromColumn: "data:site2",
            toColumn: "code"
          }
        }
      ]
    })

    this.finalFilter = {
      type: "op",
      op: "= any",
      table: "responses:xyz",
      exprs: [
        { type: "field", table: "responses:xyz", column: "status" },
        { type: "literal", valueType: "enumset", value: ["final"] }
      ]
    }

    this.latestFilter = {
      type: "op",
      op: "is latest",
      table: "responses:xyz",
      exprs: [{ type: "field", table: "responses:xyz", column: "data:site1" }]
    }

    this.latestFinalFilter = {
      type: "op",
      op: "is latest",
      table: "responses:xyz",
      exprs: [{ type: "field", table: "responses:xyz", column: "data:site1" }, this.finalFilter]
    }

    return (this.otherFilter = { type: "field", table: "responses:xyz", column: "other" })
  })

  it("filters from none to final", function () {
    const onChange = sinon.spy()
    const wrapper = enzyme.shallow(
      R(MWaterResponsesFilterComponent, {
        table: "responses:xyz",
        schema: this.schema,
        filter: null,
        onFilterChange: onChange
      })
    )

    // Set checkbox to true
    wrapper.find(ui.Checkbox).prop("onChange")(true)

    // Should set filter
    return assert(onChange.calledWith(this.finalFilter))
  })

  it("clears final filter, preserving others", function () {
    const onChange = sinon.spy()
    const filter = {
      type: "op",
      table: "responses:xyz",
      op: "and",
      exprs: [this.otherFilter, this.finalFilter]
    }
    const wrapper = enzyme.shallow(
      R(MWaterResponsesFilterComponent, {
        table: "responses:xyz",
        schema: this.schema,
        filter,
        onFilterChange: onChange
      })
    )

    // Final checkbox should be true
    assert.isTrue(wrapper.find(ui.Checkbox).prop("value"))

    // Set checkbox to false
    wrapper.find(ui.Checkbox).prop("onChange")(false)

    // Should set filter
    return assert.isTrue(onChange.calledWith(this.otherFilter))
  })

  it("lists site questions + all", function () {
    const wrapper = enzyme.shallow(
      R(MWaterResponsesFilterComponent, {
        table: "responses:xyz",
        schema: this.schema,
        filter: null,
        onFilterChange() {}
      })
    )
    return assert.equal(wrapper.find(ui.Radio).length, 3)
  })

  it("adds non-final site", function () {
    const onChange = sinon.spy()
    const wrapper = enzyme.shallow(
      R(MWaterResponsesFilterComponent, {
        table: "responses:xyz",
        schema: this.schema,
        filter: null,
        onFilterChange: onChange
      })
    )

    const radio = wrapper.find(ui.Radio).at(1)
    radio.prop("onChange")(radio.prop("radioValue"))

    return assert.isTrue(onChange.calledWith(this.latestFilter), JSON.stringify(onChange.firstCall.args))
  })

  return it("adds final site", function () {
    const onChange = sinon.spy()
    const wrapper = enzyme.shallow(
      R(MWaterResponsesFilterComponent, {
        table: "responses:xyz",
        schema: this.schema,
        filter: this.finalFilter,
        onFilterChange: onChange
      })
    )

    const radio = wrapper.find(ui.Radio).at(1)
    radio.prop("onChange")(radio.prop("radioValue"))

    return assert.isTrue(onChange.calledWith(this.latestFinalFilter), JSON.stringify(onChange.firstCall.args))
  })
})
