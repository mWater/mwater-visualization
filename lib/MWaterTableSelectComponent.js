"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const uiComponents = __importStar(require("./UIComponents"));
const mwater_expressions_1 = require("mwater-expressions");
const MWaterResponsesFilterComponent_1 = __importDefault(require("./MWaterResponsesFilterComponent"));
const ModalPopupComponent_1 = __importDefault(require("react-library/lib/ModalPopupComponent"));
const MWaterCompleteTableSelectComponent_1 = __importDefault(require("./MWaterCompleteTableSelectComponent"));
// Allows selection of a mwater-visualization table. Loads forms as well and calls event if modified
class MWaterTableSelectComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleChange = (tableId) => {
            // Close toggle edit
            this.toggleEdit.close();
            // Call onChange if different
            if (tableId !== this.props.table) {
                return this.props.onChange(tableId);
            }
        };
        this.handleTableChange = (tableId) => {
            // If not part of extra tables, add it and wait for new schema
            if (tableId && !this.props.schema.getTable(tableId)) {
                return this.setState({ pendingExtraTable: tableId }, () => {
                    return this.props.onExtraTablesChange(lodash_1.default.union(this.props.extraTables, [tableId]));
                });
            }
            else {
                return this.handleChange(tableId);
            }
        };
        this.state = {
            pendingExtraTable: null // Set when waiting for a table to load
        };
    }
    componentWillReceiveProps(nextProps) {
        // If received new schema with pending extra table, select it
        let table;
        if (this.state.pendingExtraTable) {
            table = this.state.pendingExtraTable;
            if (nextProps.schema.getTable(table)) {
                // No longer waiting
                this.setState({ pendingExtraTable: null });
                // Close toggle edit
                this.toggleEdit.close();
                // Fire change
                nextProps.onChange(table);
            }
        }
        // If table is newly selected and is a responses table and no filters, set filters to final only
        if (nextProps.table &&
            nextProps.table.match(/responses:/) &&
            nextProps.table !== this.props.table &&
            !nextProps.filter &&
            nextProps.onFilterChange) {
            return nextProps.onFilterChange({
                type: "op",
                op: "= any",
                table: nextProps.table,
                exprs: [
                    { type: "field", table: nextProps.table, column: "status" },
                    { type: "literal", valueType: "enumset", value: ["final"] }
                ]
            });
        }
    }
    render() {
        var _a;
        const editor = R(EditModeTableSelectComponent, {
            apiUrl: this.props.apiUrl,
            client: this.props.client,
            schema: this.props.schema,
            user: this.props.user,
            table: this.props.table,
            onChange: this.handleTableChange,
            extraTables: this.props.extraTables,
            onExtraTablesChange: this.props.onExtraTablesChange
        });
        return R("div", null, 
        // Show message if loading
        this.state.pendingExtraTable
            ? R("div", { className: "alert alert-info", key: "pendingExtraTable" }, R("i", { className: "fa fa-spinner fa-spin" }), "\u00a0Please wait...")
            : undefined, R(uiComponents.ToggleEditComponent, {
            ref: (c) => {
                return (this.toggleEdit = c);
            },
            forceOpen: !this.props.table,
            label: this.props.table
                ? mwater_expressions_1.ExprUtils.localizeString((_a = this.props.schema.getTable(this.props.table)) === null || _a === void 0 ? void 0 : _a.name, this.context.locale)
                : "",
            editor
        }), 
        // Make sure table still exists
        this.props.table &&
            this.props.onFilterChange &&
            this.props.table.match(/^responses:/) &&
            this.props.schema.getTable(this.props.table)
            ? R(MWaterResponsesFilterComponent_1.default, {
                schema: this.props.schema,
                table: this.props.table,
                filter: this.props.filter,
                onFilterChange: this.props.onFilterChange
            })
            : undefined);
    }
}
exports.default = MWaterTableSelectComponent;
MWaterTableSelectComponent.contextTypes = {
    locale: prop_types_1.default.string,
    // Optional list of tables (ids) being used. Use this to present an initially short list to select from
    activeTables: prop_types_1.default.arrayOf(prop_types_1.default.string.isRequired)
};
// Is the table select component when in edit mode. Toggles between complete list and simplified list
class EditModeTableSelectComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleShowMore = () => {
            return this.setState({ completeMode: true });
        };
        this.handleCompleteChange = (tableId) => {
            this.setState({ completeMode: false });
            return this.props.onChange(tableId);
        };
        this.state = {
            // True when in popup mode that shows all tables
            completeMode: false
        };
    }
    // Get list of tables that should be included in shortlist
    // This is all active tables and all responses tables in schema (so as to include rosters) and all extra tables
    // Also includes current table
    getTableShortlist() {
        let tables = this.context.activeTables || [];
        // Remove dead tables
        tables = tables.filter((t) => this.props.schema.getTable(t) != null && !this.props.schema.getTable(t).deprecated);
        tables = lodash_1.default.union(tables, lodash_1.default.filter(lodash_1.default.pluck(this.props.schema.getTables(), "id"), (t) => t.match(/^responses:/)));
        if (this.props.table) {
            tables = lodash_1.default.union(tables, [this.props.table]);
        }
        for (let extraTable of this.props.extraTables || []) {
            // Check if wildcard
            if (extraTable.match(/\*$/)) {
                for (let table of this.props.schema.getTables()) {
                    if (table.id.startsWith(extraTable.substr(0, extraTable.length - 1)) && !table.deprecated) {
                        tables = lodash_1.default.union(tables, [table.id]);
                    }
                }
            }
            else {
                // Add if exists
                if (this.props.schema.getTable(extraTable) && !this.props.schema.getTable(extraTable).deprecated) {
                    tables = lodash_1.default.union(tables, [extraTable]);
                }
            }
        }
        // Sort by name
        tables = lodash_1.default.sortBy(tables, (tableId) => mwater_expressions_1.ExprUtils.localizeString(this.props.schema.getTable(tableId).name, this.context.locale));
        return tables;
    }
    render() {
        const items = lodash_1.default.map(this.getTableShortlist(), (tableId) => {
            const table = this.props.schema.getTable(tableId);
            return {
                name: mwater_expressions_1.ExprUtils.localizeString(table.name, this.context.locale),
                desc: mwater_expressions_1.ExprUtils.localizeString(table.desc, this.context.locale),
                onClick: this.props.onChange.bind(null, table.id)
            };
        });
        return R("div", null, this.state.completeMode
            ? R(ModalPopupComponent_1.default, {
                header: "Select Data Source",
                onClose: () => this.setState({ completeMode: false }),
                showCloseX: true,
                size: "large"
            }, R(MWaterCompleteTableSelectComponent_1.default, {
                apiUrl: this.props.apiUrl,
                client: this.props.client,
                schema: this.props.schema,
                user: this.props.user,
                table: this.props.table,
                onChange: this.handleCompleteChange,
                extraTables: this.props.extraTables,
                onExtraTablesChange: this.props.onExtraTablesChange
            }))
            : undefined, items.length > 0
            ? [
                R("div", { className: "text-muted" }, "Select Data Source:"),
                R(uiComponents.OptionListComponent, { items }),
                R("div", null, items.length > 0
                    ? R("button", { type: "button", className: "btn btn-link btn-sm", onClick: this.handleShowMore }, "Show All Available Data Sources...")
                    : undefined)
            ]
            : R("button", { type: "button", className: "btn btn-link", onClick: this.handleShowMore }, "Select Data Source..."));
    }
}
EditModeTableSelectComponent.contextTypes = {
    locale: prop_types_1.default.string,
    // Optional list of tables (ids) being used. Use this to present an initially short list to select from
    activeTables: prop_types_1.default.arrayOf(prop_types_1.default.string.isRequired)
};
