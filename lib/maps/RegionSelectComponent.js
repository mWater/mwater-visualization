"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
// Allows selecting of a single region
class RegionSelectComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleChange = (id) => {
            if (!id) {
                this.props.onChange(null, null);
                return;
            }
            // Look up level
            const query = {
                type: "query",
                selects: [{ type: "select", expr: { type: "field", tableAlias: "main", column: "level" }, alias: "level" }],
                from: { type: "table", table: this.props.regionsTable, alias: "main" },
                where: {
                    type: "op",
                    op: "=",
                    exprs: [{ type: "field", tableAlias: "main", column: "_id" }, id]
                }
            };
            // Execute query
            return this.props.dataSource.performQuery(query, (err, rows) => {
                if (err) {
                    console.log("Error getting regions: " + (err === null || err === void 0 ? void 0 : err.message));
                    return;
                }
                return this.props.onChange(id, rows[0].level);
            });
        };
    }
    render() {
        let filter = undefined;
        if (this.props.maxLevel != null) {
            filter = {
                type: "op",
                op: "<=",
                exprs: [{ type: "field", tableAlias: "main", column: "level" }, this.props.maxLevel]
            };
        }
        return R(mwater_expressions_ui_1.IdLiteralComponent, {
            value: this.props.region,
            onChange: this.handleChange,
            idTable: this.props.regionsTable,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            placeholder: this.props.placeholder,
            orderBy: [{ expr: { type: "field", tableAlias: "main", column: "level" }, direction: "asc" }],
            filter
        });
    }
}
exports.default = RegionSelectComponent;
RegionSelectComponent.defaultProps = {
    placeholder: "All Countries",
    regionsTable: "admin_regions"
};
