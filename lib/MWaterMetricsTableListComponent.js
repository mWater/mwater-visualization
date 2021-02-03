"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MWaterMetricsTableListComponent = void 0;
var lodash_1 = __importDefault(require("lodash"));
var mwater_expressions_1 = require("mwater-expressions");
var react_1 = require("react");
var react_2 = __importDefault(require("react"));
var UIComponents_1 = require("./UIComponents");
var bootstrap_1 = require("react-library/lib/bootstrap");
/** Searchable list of metric tables */
exports.MWaterMetricsTableListComponent = function (props) {
    var _a = react_1.useState(), metrics = _a[0], setMetrics = _a[1];
    var _b = react_1.useState(""), search = _b[0], setSearch = _b[1];
    var _c = react_1.useState(), extraTableNeeded = _c[0], setExtraTableNeeded = _c[1];
    // Get list of all metrics
    react_1.useEffect(function () {
        fetch(props.apiUrl + "metrics?client=" + (props.client || "")).then(function (response) { return response.json(); }).then(function (body) {
            // Put included ones first
            setMetrics(lodash_1.default.sortByAll(body, [
                function (m) { return props.extraTables.some(function (t) { return t = "metrics:" + m._id; }) ? 0 : 1; },
                function (m) { return mwater_expressions_1.ExprUtils.localizeString(m.design.name, props.locale); }
            ]));
        });
    }, []);
    react_1.useEffect(function () {
        if (extraTableNeeded && props.schema.getTable(extraTableNeeded)) {
            props.onChange(extraTableNeeded);
        }
    });
    var selectTable = function (metric) {
        var qualifiedTableId = "metrics:" + metric._id;
        // If already included, select it
        if (props.schema.getTable(qualifiedTableId)) {
            props.onChange(qualifiedTableId);
            return;
        }
        // Request extra tables as wildcard
        setExtraTableNeeded(qualifiedTableId);
        props.onExtraTableAdd(qualifiedTableId);
    };
    var handleRemove = function (metric) {
        // Remove from extra tables
        var match = props.extraTables.find(function (t) { return t == "metrics:" + metric._id; });
        if (match) {
            if (confirm("Remove this tables? Some widgets may not work correctly.")) {
                props.onChange(null);
                props.onExtraTableRemove(match);
            }
        }
    };
    if (!metrics || extraTableNeeded) {
        return react_2.default.createElement("div", null,
            react_2.default.createElement("i", { className: "fa fa-spin fa-spinner" }),
            " Loading...");
    }
    var renderMetrics = function () {
        var items = metrics.filter(function (m) { return !m.design.deprecated; }).map(function (m) {
            var alreadyIncluded = props.extraTables.some(function (t) { return t == "metrics:" + m._id; });
            return {
                name: mwater_expressions_1.ExprUtils.localizeString(m.design.name, props.locale) || "",
                onClick: function () { return selectTable(m); },
                onRemove: alreadyIncluded ? handleRemove.bind(null, m) : undefined
            };
        }).filter(function (item) { return !search || !item.name.toLowerCase().includes(search.toLowerCase()); });
        return react_2.default.createElement(UIComponents_1.OptionListComponent, { items: items });
    };
    return react_2.default.createElement("div", null,
        react_2.default.createElement(bootstrap_1.TextInput, { value: search, onChange: setSearch, placeholder: "Search..." }),
        renderMetrics());
};
