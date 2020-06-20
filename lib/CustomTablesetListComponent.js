"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var mwater_expressions_1 = require("mwater-expressions");
var react_1 = require("react");
var react_2 = __importDefault(require("react"));
var UIComponents_1 = require("./UIComponents");
var bootstrap_1 = require("react-library/lib/bootstrap");
/** Searchable list of custom tables */
exports.CustomTablesetListComponent = function (props) {
    var _a = react_1.useState(), tablesets = _a[0], setTablesets = _a[1];
    var _b = react_1.useState(""), search = _b[0], setSearch = _b[1];
    var _c = react_1.useState(), extraTableNeeded = _c[0], setExtraTableNeeded = _c[1];
    // Get list of all tablesets
    react_1.useEffect(function () {
        fetch(props.apiUrl + "custom_tablesets?client=" + (props.client || "")).then(function (response) { return response.json(); }).then(function (body) {
            // Put included ones first
            setTablesets(lodash_1.default.sortByAll(body, [
                function (ts) { return props.extraTables.some(function (t) { return (t || "").startsWith("custom." + ts.code + "."); }) ? 0 : 1; },
                function (ts) { return mwater_expressions_1.ExprUtils.localizeString(ts.design.name, props.locale); }
            ]));
        });
    }, []);
    react_1.useEffect(function () {
        if (extraTableNeeded && props.schema.getTable(extraTableNeeded)) {
            props.onChange(extraTableNeeded);
        }
    });
    var selectTable = function (ts, tableId) {
        var qualifiedTableId = "custom." + ts.code + "." + tableId;
        // If already included, select it
        if (props.schema.getTable(qualifiedTableId)) {
            props.onChange(qualifiedTableId);
            return;
        }
        // Request extra tables as wildcard
        setExtraTableNeeded(qualifiedTableId);
        props.onExtraTableAdd("custom." + ts.code + ".*");
    };
    var handleRemove = function (ts) {
        // Remove from extra tables
        var match = props.extraTables.find(function (t) { return (t || "").startsWith("custom." + ts.code + "."); });
        if (match) {
            if (confirm("Remove this set of tables? Some widgets may not work correctly.")) {
                props.onChange(null);
                props.onExtraTableRemove(match);
            }
        }
    };
    if (!tablesets || extraTableNeeded) {
        return react_2.default.createElement("div", null,
            react_2.default.createElement("i", { className: "fa fa-spin fa-spinner" }),
            " Loading...");
    }
    var renderTableset = function (ts) {
        var name = mwater_expressions_1.ExprUtils.localizeString(ts.design.name, props.locale);
        // Check search 
        if (search && !name.toLowerCase().includes(search.toLowerCase())) {
            return null;
        }
        var items = ts.design.tables.map(function (t) { return ({
            name: mwater_expressions_1.ExprUtils.localizeString(t.name, props.locale),
            onClick: function () { return selectTable(ts, t.id); }
        }); });
        var alreadyIncluded = props.extraTables.some(function (t) { return (t || "").startsWith("custom." + ts.code + "."); });
        return react_2.default.createElement("div", { key: ts.code },
            alreadyIncluded
                ? react_2.default.createElement("div", { style: { float: "right" } },
                    react_2.default.createElement("button", { className: "btn btn-xs btn-link", type: "button", onClick: function () { return handleRemove(ts); } },
                        react_2.default.createElement("i", { className: "fa fa-remove" })))
                : null,
            react_2.default.createElement("h4", { className: "text-muted" }, name),
            react_2.default.createElement(UIComponents_1.OptionListComponent, { items: items }));
    };
    return react_2.default.createElement("div", null,
        react_2.default.createElement(bootstrap_1.TextInput, { value: search, onChange: setSearch, placeholder: "Search..." }),
        tablesets.map(function (ts) { return renderTableset(ts); }));
};
