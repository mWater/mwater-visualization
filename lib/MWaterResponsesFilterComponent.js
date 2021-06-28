"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const mwater_expressions_1 = require("mwater-expressions");
const bootstrap_1 = __importDefault(require("react-library/lib/bootstrap"));
// Implements common filters for responses tables. Allows filtering by final responses only and also
// by latest for each site type linked to responses.
class MWaterResponsesFilterComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleSiteChange = (site) => {
            return this.handleChange(this.isFinal(), site);
        };
        this.handleFinalChange = (final) => {
            return this.handleChange(final, this.getSiteValue());
        };
        // Recreate all filters
        this.handleChange = (final, site) => {
            // Strip all filters
            let filters = this.getFilters();
            // Strip simple
            filters = lodash_1.default.filter(filters, (f) => !lodash_1.default.isEqual(f, this.getFinalFilter()));
            // Strip "is latest" (simplified. just removes all "is latest" from the filter since is a rare op)
            filters = lodash_1.default.filter(filters, (f) => (f === null || f === void 0 ? void 0 : f.op) !== "is latest");
            // If site, create is latest
            if (site) {
                const filter = {
                    type: "op",
                    op: "is latest",
                    table: this.props.table,
                    exprs: [{ type: "field", table: this.props.table, column: site }]
                };
                if (final) {
                    filter.exprs.push(this.getFinalFilter());
                }
                filters.push(filter);
            }
            else if (final) {
                filters.push(this.getFinalFilter());
            }
            return this.setFilters(filters);
        };
    }
    // Expand "and" and null filters into a list of filters
    getFilters() {
        if (!this.props.filter) {
            return [];
        }
        if (this.props.filter.type === "op" && this.props.filter.op === "and") {
            return this.props.filter.exprs;
        }
        return [this.props.filter];
    }
    // Set filters in most compact way possible
    setFilters(filters) {
        if (filters.length === 0) {
            return this.props.onFilterChange(null);
        }
        else if (filters.length === 1) {
            return this.props.onFilterChange(filters[0]);
        }
        else {
            return this.props.onFilterChange({
                type: "op",
                op: "and",
                table: this.props.table,
                exprs: filters
            });
        }
    }
    getFinalFilter() {
        return {
            type: "op",
            op: "= any",
            table: this.props.table,
            exprs: [
                { type: "field", table: this.props.table, column: "status" },
                { type: "literal", valueType: "enumset", value: ["final"] }
            ]
        };
    }
    isFinal() {
        // Determine if final
        return lodash_1.default.any(this.getFilters(), (f) => {
            return (lodash_1.default.isEqual(f, this.getFinalFilter()) || ((f === null || f === void 0 ? void 0 : f.op) === "is latest" && lodash_1.default.isEqual(f.exprs[1], this.getFinalFilter())));
        });
    }
    // Get column id of site filtering on latest
    getSiteValue() {
        const filters = this.getFilters();
        // Get site columns
        for (var column of this.props.schema.getColumns(this.props.table)) {
            if (column.type === "join" &&
                column.join.type === "n-1" &&
                column.join.toTable.startsWith("entities.") &&
                column.id.match(/^data:/)) {
                // Check for match
                if (lodash_1.default.any(filters, (f) => (f === null || f === void 0 ? void 0 : f.op) === "is latest" &&
                    lodash_1.default.isEqual(f.exprs[0], { type: "field", table: this.props.table, column: column.id }))) {
                    return column.id;
                }
            }
        }
        return null;
    }
    render() {
        // Get site columns
        const siteColumns = lodash_1.default.filter(this.props.schema.getColumns(this.props.table), (col) => col.type === "join" &&
            col.join.type === "n-1" &&
            col.join.toTable.startsWith("entities.") &&
            col.id.match(/^data:/));
        const siteColumnId = this.getSiteValue();
        return R("div", { style: { paddingLeft: 5, paddingTop: 5 } }, R("div", { style: { paddingBottom: 5 } }, "Data Source Options:"), R("div", { style: { paddingLeft: 5 } }, siteColumns.length > 0
            ? R("div", null, R("i", null, "This data source contains links to monitoring sites. Would you like to:"), R("div", { style: { paddingLeft: 8 } }, R(bootstrap_1.default.Radio, { key: "all", value: siteColumnId, radioValue: null, onChange: this.handleSiteChange }, "Show all survey responses (even if there are more than one per site)"), lodash_1.default.map(siteColumns, (column) => {
                var _a;
                return R(bootstrap_1.default.Radio, { key: column.id, value: siteColumnId, radioValue: column.id, onChange: this.handleSiteChange }, "Show only the latest response for each ", R("i", null, `${mwater_expressions_1.ExprUtils.localizeString((_a = this.props.schema.getTable(column.join.toTable)) === null || _a === void 0 ? void 0 : _a.name)}`), " in the question ", R("i", null, `'${mwater_expressions_1.ExprUtils.localizeString(column.name)}'`));
            })))
            : undefined, R(bootstrap_1.default.Checkbox, { value: this.isFinal(), onChange: this.handleFinalChange }, "Only include final responses (recommended)")));
    }
}
exports.default = MWaterResponsesFilterComponent;
