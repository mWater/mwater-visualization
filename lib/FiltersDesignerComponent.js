"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let FiltersDesignerComponent;
const lodash_1 = __importDefault(require("lodash"));
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const mwater_expressions_1 = require("mwater-expressions");
const mwater_expressions_2 = require("mwater-expressions");
// Designer for filters of multiple tables. Used for maps and dashboards
// Filters are in format mwater-expression filter expression indexed by table. e.g. { sometable: logical expression, etc. }
exports.default = FiltersDesignerComponent = (function () {
    FiltersDesignerComponent = class FiltersDesignerComponent extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this.handleFilterChange = (table, expr) => {
                // Clean filter
                expr = new mwater_expressions_1.ExprCleaner(this.props.schema).cleanExpr(expr, { table });
                const filters = lodash_1.default.clone(this.props.filters || {});
                filters[table] = expr;
                return this.props.onFiltersChange(filters);
            };
            this.renderFilterableTable = (table) => {
                var _a;
                const name = mwater_expressions_2.ExprUtils.localizeString(this.props.schema.getTable(table).name, this.context.locale);
                return R("div", { key: table }, R("label", null, name), react_1.default.createElement(mwater_expressions_ui_1.FilterExprComponent, {
                    schema: this.props.schema,
                    dataSource: this.props.dataSource,
                    onChange: this.handleFilterChange.bind(null, table),
                    table,
                    value: (_a = this.props.filters) === null || _a === void 0 ? void 0 : _a[table]
                }));
            };
        }
        static initClass() {
            this.propTypes = {
                schema: prop_types_1.default.object.isRequired,
                dataSource: prop_types_1.default.object.isRequired,
                filterableTables: prop_types_1.default.arrayOf(prop_types_1.default.string),
                filters: prop_types_1.default.object,
                onFiltersChange: prop_types_1.default.func.isRequired // Called with new filters
            };
            this.contextTypes = { locale: prop_types_1.default.string };
            // e.g. "en"
        }
        render() {
            return R("div", null, lodash_1.default.map(this.props.filterableTables, this.renderFilterableTable));
        }
    };
    FiltersDesignerComponent.initClass();
    return FiltersDesignerComponent;
})();
