import { createElement as R } from 'react';
import sinon from 'sinon';
import enzyme from 'enzyme';
import { assert } from 'chai';
import { Schema } from 'mwater-expressions';
import ui from 'react-library/lib/bootstrap';
import { IdLiteralComponent } from 'mwater-expressions-ui';
import MWaterGlobalFiltersComponent from '../src/MWaterGlobalFiltersComponent';

enzyme.configure({ adapter: new (require('enzyme-adapter-react-16'))() }); // Configure enzyme for react 16

describe("MWaterGlobalFiltersComponent", function() {
  it("extracts _managed_by filter", function() {
    const wrapper = enzyme.shallow(R(MWaterGlobalFiltersComponent, { 
      schema: {}, 
      dataSource: {}, 
      filterableTables: [], 
      globalFilters: [{ columnId: "_managed_by", columnType: "id", op: "within", exprs: [{ type: "literal", valueType: "id", idTable: "subjects", value: "group:xyz" }]}],
      onChange() {}
    }
    ));
    
    const managedByControl = wrapper.find(IdLiteralComponent).at(0);
    return assert.equal(managedByControl.prop("value"), "xyz", "Should be displaying group");
  });

  it("updates _managed_by", function() {
    const onChange = sinon.spy();

    const wrapper = enzyme.shallow(R(MWaterGlobalFiltersComponent, { 
      schema: {}, 
      dataSource: {}, 
      filterableTables: [], 
      globalFilters: [{ columnId: "_managed_by", columnType: "id", op: "within", exprs: [{ type: "literal", valueType: "id", idTable: "subjects", value: "group:xyz" }]}],
      onChange
    }
    ));
    
    const managedByControl = wrapper.find(IdLiteralComponent).at(0);
    managedByControl.prop("onChange")("abc");

    // Should set filter
    return assert(onChange.calledWith([{ columnId: "_managed_by", columnType: "id", op: "within", exprs: [{ type: "literal", valueType: "id", idTable: "subjects", value: "group:abc" }]}]));
  });

  it("extracts admin_region", function() {
    const wrapper = enzyme.shallow(R(MWaterGlobalFiltersComponent, { 
      schema: {}, 
      dataSource: {}, 
      filterableTables: [], 
      globalFilters: [{ columnId: "admin_region", columnType: "id", op: "within any", exprs: [{ type: "literal", valueType: "id[]", idTable: "admin_regions", value: [123, 456] }]}],
      onChange() {}
    }
    ));
    
    const adminRegionsControl = wrapper.find(IdLiteralComponent).at(1);
    return assert.deepEqual(adminRegionsControl.prop("value"), [123, 456], "Should be displaying admin_region");
  });

  return it("updates admin_region", function() {
    const onChange = sinon.spy();

    const wrapper = enzyme.shallow(R(MWaterGlobalFiltersComponent, { 
      schema: {}, 
      dataSource: {}, 
      filterableTables: [], 
      globalFilters: [{ columnId: "admin_region", columnType: "id", op: "within any", exprs: [{ type: "literal", valueType: "id[]", idTable: "admin_regions", value: [123, 456] }]}],
      onChange
    }
    ));
    
    const adminRegionsControl = wrapper.find(IdLiteralComponent).at(1);
    adminRegionsControl.prop("onChange")([789]);

    // Should set filter
    return assert(onChange.calledWith([{ columnId: "admin_region", columnType: "id", op: "within any", exprs: [{ type: "literal", valueType: "id[]", idTable: "admin_regions", value: [789] }]}]));
  });
});
