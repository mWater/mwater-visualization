"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MWaterCustomTablesetListComponent = void 0;
const lodash_1 = __importDefault(require("lodash"));
const mwater_expressions_1 = require("mwater-expressions");
const react_1 = require("react");
const react_2 = __importDefault(require("react"));
const UIComponents_1 = require("./UIComponents");
const bootstrap_1 = require("react-library/lib/bootstrap");
/** Searchable list of custom tables */
exports.MWaterCustomTablesetListComponent = (props) => {
    const [tablesets, setTablesets] = react_1.useState();
    const [search, setSearch] = react_1.useState("");
    const [extraTableNeeded, setExtraTableNeeded] = react_1.useState();
    // Get list of all tablesets
    react_1.useEffect(() => {
        fetch(`${props.apiUrl}custom_tablesets?client=${props.client || ""}`).then(response => response.json()).then(body => {
            // Put included ones first
            setTablesets(lodash_1.default.sortByAll(body, [
                ts => props.extraTables.some(t => (t || "").startsWith(`custom.${ts.code}.`)) ? 0 : 1,
                ts => mwater_expressions_1.ExprUtils.localizeString(ts.design.name, props.locale)
            ]));
        });
    }, []);
    react_1.useEffect(() => {
        if (extraTableNeeded && props.schema.getTable(extraTableNeeded)) {
            props.onChange(extraTableNeeded);
        }
    });
    const selectTable = (ts, tableId) => {
        const qualifiedTableId = `custom.${ts.code}.${tableId}`;
        // If already included, select it
        if (props.schema.getTable(qualifiedTableId)) {
            props.onChange(qualifiedTableId);
            return;
        }
        // Request extra tables as wildcard
        setExtraTableNeeded(qualifiedTableId);
        props.onExtraTableAdd(`custom.${ts.code}.*`);
    };
    const handleRemove = (ts) => {
        // Remove from extra tables
        const match = props.extraTables.find(t => (t || "").startsWith(`custom.${ts.code}.`));
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
    const renderTableset = (ts) => {
        const name = mwater_expressions_1.ExprUtils.localizeString(ts.design.name, props.locale) || "";
        // Check search 
        if (search && !name.toLowerCase().includes(search.toLowerCase())
            && !ts.design.tables.some(t => mwater_expressions_1.ExprUtils.localizeString(t.name).toLowerCase().includes(search.toLowerCase()))) {
            return null;
        }
        const items = ts.design.tables.filter(t => !t.deprecated).map(t => ({
            name: mwater_expressions_1.ExprUtils.localizeString(t.name, props.locale),
            onClick: () => selectTable(ts, t.id)
        }));
        const alreadyIncluded = props.extraTables.some(t => (t || "").startsWith(`custom.${ts.code}.`));
        return react_2.default.createElement("div", { key: ts.code },
            alreadyIncluded
                ? react_2.default.createElement("div", { style: { float: "right" } },
                    react_2.default.createElement("button", { className: "btn btn-xs btn-link", type: "button", onClick: () => handleRemove(ts) },
                        react_2.default.createElement("i", { className: "fa fa-remove" })))
                : null,
            react_2.default.createElement("h4", { className: "text-muted" }, name),
            react_2.default.createElement(UIComponents_1.OptionListComponent, { items: items }));
    };
    return react_2.default.createElement("div", null,
        react_2.default.createElement(bootstrap_1.TextInput, { value: search, onChange: setSearch, placeholder: "Search..." }),
        tablesets.map(ts => renderTableset(ts)));
};
