"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const PopoverHelpComponent_1 = __importDefault(require("react-library/lib/PopoverHelpComponent"));
const FiltersDesignerComponent_1 = __importDefault(require("../FiltersDesignerComponent"));
const MapUtils = __importStar(require("./MapUtils"));
// Designer for filters for a map
class MapFiltersDesignerComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleFiltersChange = (filters) => {
            const design = lodash_1.default.extend({}, this.props.design, { filters });
            return this.props.onDesignChange(design);
        };
        this.handleGlobalFiltersChange = (globalFilters) => {
            const design = lodash_1.default.extend({}, this.props.design, { globalFilters });
            return this.props.onDesignChange(design);
        };
    }
    render() {
        // Get filterable tables
        const filterableTables = MapUtils.getFilterableTables(this.props.design, this.props.schema);
        if (filterableTables.length === 0) {
            return null;
        }
        return R("div", null, R("div", { className: "form-group" }, R("label", { className: "text-muted" }, "Filters ", R(PopoverHelpComponent_1.default, { placement: "left" }, "Filters all layers in the map. Individual layers can be filtered by clicking on Customize...")), R("div", { style: { margin: 5 } }, R(FiltersDesignerComponent_1.default, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            filters: this.props.design.filters,
            onFiltersChange: this.handleFiltersChange,
            filterableTables
        }))), this.context.globalFiltersElementFactory
            ? R("div", { className: "form-group" }, R("label", { className: "text-muted" }, "Global Filters "), R("div", { style: { margin: 5 } }, this.context.globalFiltersElementFactory({
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                filterableTables,
                globalFilters: this.props.design.globalFilters || [],
                onChange: this.handleGlobalFiltersChange
            })))
            : undefined);
    }
}
exports.default = MapFiltersDesignerComponent;
MapFiltersDesignerComponent.contextTypes = { globalFiltersElementFactory: prop_types_1.default.func };
