"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const react_select_1 = __importDefault(require("react-select"));
// Select detail level within an admin region
class DetailLevelSelectComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = { options: null };
    }
    componentWillMount() {
        return this.loadLevels(this.props);
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.scope !== this.props.scope) {
            return this.loadLevels(nextProps);
        }
    }
    loadLevels(props) {
        // Get country id of scope
        let query = {
            type: "query",
            selects: [{ type: "select", expr: { type: "field", tableAlias: "main", column: "level0" }, alias: "level0" }],
            from: { type: "table", table: "admin_regions", alias: "main" },
            where: {
                type: "op",
                op: "=",
                exprs: [{ type: "field", tableAlias: "main", column: "_id" }, props.scope]
            }
        };
        // Execute query
        return props.dataSource.performQuery(query, (err, rows) => {
            if (err) {
                alert("Error loading detail levels");
                return;
            }
            const countryId = rows[0].level0;
            // Get levels
            query = {
                type: "query",
                selects: [
                    { type: "select", expr: { type: "field", tableAlias: "main", column: "level" }, alias: "level" },
                    { type: "select", expr: { type: "field", tableAlias: "main", column: "name" }, alias: "name" }
                ],
                from: { type: "table", table: "admin_region_levels", alias: "main" },
                where: {
                    type: "op",
                    op: "=",
                    exprs: [{ type: "field", tableAlias: "main", column: "country_id" }, countryId]
                },
                orderBy: [{ ordinal: 1, direction: "asc" }]
            };
            // Execute query
            return props.dataSource.performQuery(query, (err, rows) => {
                if (err) {
                    alert("Error loading detail levels");
                    return;
                }
                // Only greater than current scope level
                rows = lodash_1.default.filter(rows, (r) => r.level > props.scopeLevel);
                // If detail level set (defaults to zero), and has an option, auto-select
                if (this.props.detailLevel <= this.props.scopeLevel && rows.length > 0) {
                    this.props.onChange(rows[0].level);
                }
                const options = lodash_1.default.map(rows, (r) => ({
                    value: r.level,
                    label: r.name
                }));
                return this.setState({ options });
            });
        });
    }
    render() {
        if (this.state.options) {
            return R(react_select_1.default, {
                value: lodash_1.default.findWhere(this.state.options, { value: this.props.detailLevel }) || null,
                options: this.state.options,
                onChange: (opt) => this.props.onChange(opt.value)
            });
        }
        else {
            return R("div", { className: "text-muted" }, R("i", { className: "fa fa-spinner fa-spin" }), " Loading...");
        }
    }
}
exports.default = DetailLevelSelectComponent;
