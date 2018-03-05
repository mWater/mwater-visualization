R = require('react').createElement
sinon = require 'sinon'
enzyme = require 'enzyme'
assert = require('chai').assert
Schema = require('mwater-expressions').Schema
ui = require 'react-library/lib/bootstrap'
IdLiteralComponent = require('mwater-expressions-ui').IdLiteralComponent

MWaterGlobalFiltersComponent = require '../src/MWaterGlobalFiltersComponent'

enzyme.configure({ adapter: new (require('enzyme-adapter-react-15'))() }) # Configure enzyme for react 15

describe "MWaterGlobalFiltersComponent", ->
  it "extracts _managed_by filter", ->
    wrapper = enzyme.shallow(R(MWaterGlobalFiltersComponent, 
      schema: {}, 
      dataSource: {}, 
      filterableTables: [], 
      globalFilters: [{ columnId: "_managed_by", columnType: "id", op: "within", exprs: [{ type: "literal", valueType: "id", idTable: "subjects", value: "group:xyz" }]}]
      onChange: (->)
    ))
    
    managedByControl = wrapper.find(IdLiteralComponent).at(0)
    assert.equal managedByControl.prop("value"), "xyz", "Should be displaying group"

  it "updates _managed_by", ->
    onChange = sinon.spy()

    wrapper = enzyme.shallow(R(MWaterGlobalFiltersComponent, 
      schema: {}, 
      dataSource: {}, 
      filterableTables: [], 
      globalFilters: [{ columnId: "_managed_by", columnType: "id", op: "within", exprs: [{ type: "literal", valueType: "id", idTable: "subjects", value: "group:xyz" }]}]
      onChange: onChange
    ))
    
    managedByControl = wrapper.find(IdLiteralComponent).at(0)
    managedByControl.prop("onChange")("abc")

    # Should set filter
    assert onChange.calledWith([{ columnId: "_managed_by", columnType: "id", op: "within", exprs: [{ type: "literal", valueType: "id", idTable: "subjects", value: "group:abc" }]}])

  it "extracts admin_region", ->
    wrapper = enzyme.shallow(R(MWaterGlobalFiltersComponent, 
      schema: {}, 
      dataSource: {}, 
      filterableTables: [], 
      globalFilters: [{ columnId: "admin_region", columnType: "id", op: "within any", exprs: [{ type: "literal", valueType: "id[]", idTable: "admin_regions", value: [123, 456] }]}]
      onChange: (->)
    ))
    
    adminRegionsControl = wrapper.find(IdLiteralComponent).at(1)
    assert.deepEqual adminRegionsControl.prop("value"), [123, 456], "Should be displaying admin_region"

  it "updates admin_region", ->
    onChange = sinon.spy()

    wrapper = enzyme.shallow(R(MWaterGlobalFiltersComponent, 
      schema: {}, 
      dataSource: {}, 
      filterableTables: [], 
      globalFilters: [{ columnId: "admin_region", columnType: "id", op: "within any", exprs: [{ type: "literal", valueType: "id[]", idTable: "admin_regions", value: [123, 456] }]}]
      onChange: onChange
    ))
    
    adminRegionsControl = wrapper.find(IdLiteralComponent).at(1)
    adminRegionsControl.prop("onChange")([789])

    # Should set filter
    assert onChange.calledWith([{ columnId: "admin_region", columnType: "id", op: "within any", exprs: [{ type: "literal", valueType: "id[]", idTable: "admin_regions", value: [789] }]}])
