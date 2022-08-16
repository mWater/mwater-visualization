"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MWaterAssetSystemsListComponent = void 0;
const lodash_1 = __importDefault(require("lodash"));
const mwater_expressions_1 = require("mwater-expressions");
const react_1 = require("react");
const react_2 = __importDefault(require("react"));
const UIComponents_1 = require("./UIComponents");
const bootstrap_1 = require("react-library/lib/bootstrap");
/** Searchable list of asset system tables */
exports.MWaterAssetSystemsListComponent = (props) => {
    const [systems, setSystems] = react_1.useState();
    const [search, setSearch] = react_1.useState("");
    const [extraTableNeeded, setExtraTableNeeded] = react_1.useState();
    // Get list of all systems
    react_1.useEffect(() => {
        fetch(`${props.apiUrl}asset_systems?client=${props.client || ""}`)
            .then((response) => response.json())
            .then((body) => {
            // Put included ones first
            setSystems(lodash_1.default.sortByAll(body, [
                (m) => (props.extraTables.some(t => t == `assets:${m.sid}`)) ? 0 : 1,
                (m) => mwater_expressions_1.ExprUtils.localizeString(m.design.name, props.locale)
            ]));
        });
    }, []);
    react_1.useEffect(() => {
        if (extraTableNeeded && props.schema.getTable(extraTableNeeded)) {
            props.onChange(extraTableNeeded);
        }
    });
    const selectTable = (system) => {
        const qualifiedTableId = `assets:${system.sid}`;
        // If already included, select it
        if (props.schema.getTable(qualifiedTableId)) {
            props.onChange(qualifiedTableId);
            return;
        }
        // Request extra tables as wildcard
        setExtraTableNeeded(qualifiedTableId);
        props.onExtraTableAdd(qualifiedTableId);
    };
    const handleRemove = (system) => {
        // Remove from extra tables
        const match = props.extraTables.find((t) => t == `assets:${system.sid}`);
        if (match) {
            if (confirm("Remove this table? Some widgets may not work correctly.")) {
                props.onChange(null);
                props.onExtraTableRemove(match);
            }
        }
    };
    if (!systems || extraTableNeeded) {
        return (react_2.default.createElement("div", null,
            react_2.default.createElement("i", { className: "fa fa-spin fa-spinner" }),
            " Loading..."));
    }
    const renderAssetSystems = () => {
        const items = systems
            .map((m) => {
            const alreadyIncluded = props.extraTables.some((t) => t == `systems:${m.sid}`);
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
        renderAssetSystems()));
};
