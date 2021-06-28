"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const bootstrap_1 = __importDefault(require("react-library/lib/bootstrap"));
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
// Control to edit the global filters (_managed_by and admin_region)
class MWaterGlobalFiltersComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleRegionsChange = (regions) => {
            // Remove existing filter
            const globalFilters = lodash_1.default.filter(this.props.globalFilters || [], (gf) => !(gf.op === "within any" && gf.columnId === "admin_region"));
            // Add new filter if present
            if (regions && regions.length > 0) {
                globalFilters.push({
                    columnId: "admin_region",
                    columnType: "id",
                    op: "within any",
                    exprs: [{ type: "literal", valueType: "id[]", idTable: "admin_regions", value: regions }]
                });
            }
            return this.props.onChange(globalFilters);
        };
        this.handleManagedByChange = (managedBy) => {
            // Remove existing filter
            const globalFilters = lodash_1.default.filter(this.props.globalFilters || [], (gf) => !(gf.op === "within" && gf.columnId === "_managed_by"));
            // Add new filter if present
            if (managedBy) {
                globalFilters.push({
                    columnId: "_managed_by",
                    columnType: "id",
                    op: "within",
                    exprs: [{ type: "literal", valueType: "id", idTable: "subjects", value: "group:" + managedBy }]
                });
            }
            return this.props.onChange(globalFilters);
        };
    }
    render() {
        // Find managed by
        let adminRegions, managedBy;
        const managedByEntry = lodash_1.default.find(this.props.globalFilters, (gf) => gf.op === "within" && gf.columnId === "_managed_by");
        if (managedByEntry) {
            managedBy = managedByEntry.exprs[0].value.split(":")[1];
        }
        else {
            managedBy = null;
        }
        // Find admin region
        const adminRegionEntry = lodash_1.default.find(this.props.globalFilters, (gf) => gf.op === "within any" && gf.columnId === "admin_region");
        if (adminRegionEntry) {
            adminRegions = adminRegionEntry.exprs[0].value;
        }
        else {
            adminRegions = null;
        }
        return R("div", null, R(bootstrap_1.default.FormGroup, { label: "Only sites managed by", labelMuted: true }, R(mwater_expressions_ui_1.IdLiteralComponent, {
            value: managedBy,
            onChange: this.handleManagedByChange,
            idTable: "groups",
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            placeholder: "All Organizations",
            multi: false,
            filter: { type: "field", tableAlias: "main", column: "canManageEntities" }
        })), R(bootstrap_1.default.FormGroup, { label: "Only sites located in", labelMuted: true }, R(mwater_expressions_ui_1.IdLiteralComponent, {
            value: adminRegions,
            onChange: this.handleRegionsChange,
            idTable: "admin_regions",
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            placeholder: "All Regions",
            multi: true,
            orderBy: [{ expr: { type: "field", tableAlias: "main", column: "level" }, direction: "asc" }]
        })));
    }
}
exports.default = MWaterGlobalFiltersComponent;
