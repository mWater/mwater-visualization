"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MWaterMetricsTableListComponent = void 0;
const lodash_1 = __importDefault(require("lodash"));
const mwater_expressions_1 = require("mwater-expressions");
const react_1 = require("react");
const react_2 = __importDefault(require("react"));
const UIComponents_1 = require("./UIComponents");
const bootstrap_1 = require("react-library/lib/bootstrap");
/** Searchable list of metric tables */
const MWaterMetricsTableListComponent = (props) => {
    const [metrics, setMetrics] = (0, react_1.useState)();
    const [search, setSearch] = (0, react_1.useState)("");
    const [extraTableNeeded, setExtraTableNeeded] = (0, react_1.useState)();
    // Get list of all metrics
    (0, react_1.useEffect)(() => {
        fetch(`${props.apiUrl}metrics?client=${props.client || ""}`)
            .then((response) => response.json())
            .then((body) => {
            // Put included ones first
            setMetrics(lodash_1.default.sortByAll(body, [
                (m) => (props.extraTables.some((t) => (t = `metrics:${m._id}`)) ? 0 : 1),
                (m) => mwater_expressions_1.ExprUtils.localizeString(m.design.name, props.locale)
            ]));
        });
    }, []);
    (0, react_1.useEffect)(() => {
        if (extraTableNeeded && props.schema.getTable(extraTableNeeded)) {
            props.onChange(extraTableNeeded);
        }
    });
    const selectTable = (metric) => {
        const qualifiedTableId = `metrics:${metric._id}`;
        // If already included, select it
        if (props.schema.getTable(qualifiedTableId)) {
            props.onChange(qualifiedTableId);
            return;
        }
        // Request extra tables as wildcard
        setExtraTableNeeded(qualifiedTableId);
        props.onExtraTableAdd(qualifiedTableId);
    };
    const handleRemove = (metric) => {
        // Remove from extra tables
        const match = props.extraTables.find((t) => t == `metrics:${metric._id}`);
        if (match) {
            if (confirm("Remove this tables? Some widgets may not work correctly.")) {
                props.onChange(null);
                props.onExtraTableRemove(match);
            }
        }
    };
    if (!metrics || extraTableNeeded) {
        return (react_2.default.createElement("div", null,
            react_2.default.createElement("i", { className: "fa fa-spin fa-spinner" }),
            " Loading..."));
    }
    const renderMetrics = () => {
        const items = metrics
            .filter((m) => !m.design.deprecated)
            .map((m) => {
            const alreadyIncluded = props.extraTables.some((t) => t == `metrics:${m._id}`);
            return {
                name: mwater_expressions_1.ExprUtils.localizeString(m.design.name, props.locale) || "",
                onClick: () => selectTable(m),
                onRemove: alreadyIncluded ? handleRemove.bind(null, m) : undefined
            };
        })
            .filter((item) => !search || !item.name.toLowerCase().includes(search.toLowerCase()));
        return react_2.default.createElement(UIComponents_1.OptionListComponent, { items: items });
    };
    return (react_2.default.createElement("div", null,
        react_2.default.createElement(bootstrap_1.TextInput, { value: search, onChange: setSearch, placeholder: "Search..." }),
        renderMetrics()));
};
exports.MWaterMetricsTableListComponent = MWaterMetricsTableListComponent;
