"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jquery_1 = __importDefault(require("jquery"));
const prop_types_1 = __importDefault(require("prop-types"));
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const querystring_1 = __importDefault(require("querystring"));
const mwater_expressions_1 = require("mwater-expressions");
// List of indicators related to an entity
class MWaterAddRelatedIndicatorComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleSelect = (table) => {
            // Mark as being added
            this.setState({ addingTables: lodash_1.default.union(this.state.addingTables, [table]) });
            return this.props.onSelect(table);
        };
        this.state = {
            addingTables: [],
            indicators: null
        };
    }
    componentDidMount() {
        // Get all response-type indicators
        const query = {};
        query.selector = JSON.stringify({ type: "response" });
        query.fields = JSON.stringify({
            "design.name": 1,
            "design.desc": 1,
            "design.properties": 1,
            "design.recommended": 1,
            deprecated: 1
        });
        if (this.props.client) {
            query.client = this.props.client;
        }
        // Get list of all indicators
        return jquery_1.default.getJSON(this.props.apiUrl + "indicators?" + querystring_1.default.stringify(query), (indicators) => {
            // Filter by table reference
            indicators = lodash_1.default.filter(indicators, (indicator) => this.doesIndicatorReferenceTable(indicator, this.props.table) && !indicator.deprecated);
            // Sort by recommended then name
            indicators = lodash_1.default.sortByOrder(indicators, [
                (indicator) => (indicator.design.recommended ? 0 : 1),
                (indicator) => mwater_expressions_1.ExprUtils.localizeString(indicator.design.name, this.context.locale)
            ], ["asc", "asc"]);
            return this.setState({ indicators });
        }).fail((xhr) => {
            return this.setState({ error: xhr.responseText });
        });
    }
    // See if a property references the indicator
    doesIndicatorReferenceTable(indicator, table) {
        for (let proplist of lodash_1.default.values(indicator.design.properties)) {
            for (let property of flattenProperties(proplist)) {
                if (property.idTable === table) {
                    return true;
                }
            }
        }
        return false;
    }
    render() {
        // Filter out ones that are known and not recently added
        let indicators = lodash_1.default.filter(this.state.indicators, (indicator) => {
            return (!this.props.schema.getTable(`indicator_values:${indicator._id}`) ||
                this.state.addingTables.includes(`indicator_values:${indicator._id}`));
        });
        // Filter by search
        if (this.props.filter) {
            indicators = lodash_1.default.filter(indicators, (indicator) => filterMatches(this.props.filter, mwater_expressions_1.ExprUtils.localizeString(indicator.design.name, this.context.locale)));
        }
        return R("div", null, R("div", { style: { paddingLeft: 5 }, className: "text-muted" }, "Other Available Indicators. Click to enable. ", R("i", { className: "fa fa-check-circle" }), " = recommended", !this.state.indicators
            ? R("div", { className: "text-muted" }, R("i", { className: "fa fa-spin fa-spinner" }), " Loading...")
            : undefined, R("div", { style: { paddingLeft: 10 } }, lodash_1.default.map(indicators, (indicator) => {
            const name = mwater_expressions_1.ExprUtils.localizeString(indicator.design.name, this.context.locale);
            const desc = mwater_expressions_1.ExprUtils.localizeString(indicator.design.desc, this.context.locale);
            // If added, put special message
            if (this.props.schema.getTable(`indicator_values:${indicator._id}`)) {
                return R("div", { key: indicator._id, style: { cursor: "pointer", padding: 4 }, className: "text-success" }, `${name} added. See above.`);
            }
            return R("div", {
                key: indicator._id,
                style: { cursor: "pointer", color: "#478", padding: 4 },
                onClick: this.handleSelect.bind(null, `indicator_values:${indicator._id}`)
            }, 
            // If in process of adding
            this.state.addingTables.includes(indicator._id)
                ? R("i", { className: "fa fa-spin fa-spinner" })
                : undefined, indicator.design.recommended
                ? R("i", { className: "fa fa-check-circle fa-fw", style: { color: "#337ab7" } })
                : undefined, name, desc
                ? R("span", { className: "text-muted", style: { fontSize: 12, paddingLeft: 3 } }, " - " + desc)
                : undefined);
        }))));
    }
}
exports.default = MWaterAddRelatedIndicatorComponent;
MWaterAddRelatedIndicatorComponent.contextTypes = { locale: prop_types_1.default.string };
// Flattens a nested list of properties
function flattenProperties(properties) {
    // Flatten
    let props = [];
    for (let prop of properties) {
        if (prop.contents) {
            props = props.concat(flattenProperties(prop.contents));
        }
        else {
            props.push(prop);
        }
    }
    return props;
}
// Filters text based on lower-case
function filterMatches(filter, text) {
    if (!filter) {
        return true;
    }
    if (!text) {
        return false;
    }
    if (text.match(new RegExp(lodash_1.default.escapeRegExp(filter), "i"))) {
        return true;
    }
    return false;
}
