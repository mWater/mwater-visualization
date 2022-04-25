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
const jquery_1 = __importDefault(require("jquery"));
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const querystring_1 = __importDefault(require("querystring"));
const TabbedComponent_1 = __importDefault(require("react-library/lib/TabbedComponent"));
const uiComponents = __importStar(require("./UIComponents"));
const mwater_expressions_1 = require("mwater-expressions");
const moment_1 = __importDefault(require("moment"));
const ModalPopupComponent_1 = __importDefault(require("react-library/lib/ModalPopupComponent"));
const MWaterCustomTablesetListComponent_1 = require("./MWaterCustomTablesetListComponent");
const MWaterMetricsTableListComponent_1 = require("./MWaterMetricsTableListComponent");
const MWaterAssetSystemsListComponent_1 = require("./MWaterAssetSystemsListComponent");
const sitesOrder = {
    "entities.water_point": 1,
    "entities.sanitation_facility": 2,
    "entities.household": 3,
    "entities.community": 4,
    "entities.school": 5,
    "entities.health_facility": 6,
    "entities.place_of_worship": 7,
    "entities.water_system": 8,
    "entities.water_system_component": 9,
    "entities.wastewater_treatment_system": 10,
    "entities.waste_disposal_site": 11
};
// Allows selection of a table. Is the complete list mode of tables
class MWaterCompleteTableSelectComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleExtraTableAdd = (tableId) => {
            return this.props.onExtraTablesChange(lodash_1.default.union(this.props.extraTables, [tableId]));
        };
        this.handleExtraTableRemove = (tableId) => {
            // Set to null if current table
            if (this.props.table === tableId) {
                this.props.onChange(null);
            }
            return this.props.onExtraTablesChange(lodash_1.default.without(this.props.extraTables, tableId));
        };
    }
    renderSites() {
        let table;
        let types = [];
        for (table of this.props.schema.getTables()) {
            if (table.deprecated) {
                continue;
            }
            if (!table.id.match(/^entities\./)) {
                continue;
            }
            types.push(table.id);
        }
        // Sort by order if present
        types = lodash_1.default.sortBy(types, (type) => sitesOrder[type] || 999);
        return R(uiComponents.OptionListComponent, {
            items: lodash_1.default.compact(lodash_1.default.map(types, (tableId) => {
                table = this.props.schema.getTable(tableId);
                return {
                    name: mwater_expressions_1.ExprUtils.localizeString(table.name, this.context.locale),
                    desc: mwater_expressions_1.ExprUtils.localizeString(table.desc, this.context.locale),
                    onClick: this.props.onChange.bind(null, table.id)
                };
            }))
        });
    }
    renderForms() {
        return R(FormsListComponent, {
            schema: this.props.schema,
            client: this.props.client,
            apiUrl: this.props.apiUrl,
            user: this.props.user,
            onChange: this.props.onChange,
            extraTables: this.props.extraTables,
            onExtraTableAdd: this.handleExtraTableAdd,
            onExtraTableRemove: this.handleExtraTableRemove
        });
    }
    renderIndicators() {
        return R(IndicatorsListComponent, {
            schema: this.props.schema,
            client: this.props.client,
            apiUrl: this.props.apiUrl,
            user: this.props.user,
            onChange: this.props.onChange,
            extraTables: this.props.extraTables,
            onExtraTableAdd: this.handleExtraTableAdd,
            onExtraTableRemove: this.handleExtraTableRemove
        });
    }
    renderIssues() {
        return R(IssuesListComponent, {
            schema: this.props.schema,
            client: this.props.client,
            apiUrl: this.props.apiUrl,
            user: this.props.user,
            onChange: this.props.onChange,
            extraTables: this.props.extraTables,
            onExtraTableAdd: this.handleExtraTableAdd,
            onExtraTableRemove: this.handleExtraTableRemove
        });
    }
    renderSweetSense() {
        let sweetSenseTables = this.getSweetSenseTables();
        sweetSenseTables = lodash_1.default.sortBy(sweetSenseTables, (table) => table.name.en);
        return R(uiComponents.OptionListComponent, {
            items: lodash_1.default.map(sweetSenseTables, (table) => {
                return {
                    name: mwater_expressions_1.ExprUtils.localizeString(table.name, this.context.locale),
                    desc: mwater_expressions_1.ExprUtils.localizeString(table.desc, this.context.locale),
                    onClick: this.props.onChange.bind(null, table.id)
                };
            })
        });
    }
    renderTablesets() {
        return R(MWaterCustomTablesetListComponent_1.MWaterCustomTablesetListComponent, {
            schema: this.props.schema,
            client: this.props.client,
            apiUrl: this.props.apiUrl,
            user: this.props.user,
            onChange: this.props.onChange,
            extraTables: this.props.extraTables,
            onExtraTableAdd: this.handleExtraTableAdd,
            onExtraTableRemove: this.handleExtraTableRemove,
            locale: this.context.locale
        });
    }
    renderMetrics() {
        return R(MWaterMetricsTableListComponent_1.MWaterMetricsTableListComponent, {
            schema: this.props.schema,
            client: this.props.client,
            apiUrl: this.props.apiUrl,
            user: this.props.user,
            onChange: this.props.onChange,
            extraTables: this.props.extraTables,
            onExtraTableAdd: this.handleExtraTableAdd,
            onExtraTableRemove: this.handleExtraTableRemove,
            locale: this.context.locale
        });
    }
    renderAssets() {
        return R(MWaterAssetSystemsListComponent_1.MWaterAssetSystemsListComponent, {
            schema: this.props.schema,
            client: this.props.client,
            apiUrl: this.props.apiUrl,
            user: this.props.user,
            onChange: this.props.onChange,
            extraTables: this.props.extraTables,
            onExtraTableAdd: this.handleExtraTableAdd,
            onExtraTableRemove: this.handleExtraTableRemove,
            locale: this.context.locale
        });
    }
    renderOther() {
        let otherTables = lodash_1.default.filter(this.props.schema.getTables(), (table) => {
            // Remove deprecated
            if (table.deprecated) {
                return false;
            }
            // Remove sites
            if (table.id.match(/^entities\./)) {
                return false;
            }
            // sweetsense tables
            if (table.id.match(/^sweetsense/)) {
                return false;
            }
            // Remove responses
            if (table.id.match(/^responses:/)) {
                return false;
            }
            // Remove indicators
            if (table.id.match(/^indicator_values:/)) {
                return false;
            }
            // Remove issues
            if (table.id.match(/^(issues|issue_events):/)) {
                return false;
            }
            // Remove custom tablesets
            if (table.id.match(/^custom\./)) {
                return false;
            }
            // Remove metrics
            if (table.id.match(/^metrics:/)) {
                return false;
            }
            // Remove assets
            if (table.id.match(/^assets:/)) {
                return false;
            }
            return true;
        });
        otherTables = lodash_1.default.sortBy(otherTables, (table) => table.name.en);
        return R(uiComponents.OptionListComponent, {
            items: lodash_1.default.map(otherTables, (table) => {
                return {
                    name: mwater_expressions_1.ExprUtils.localizeString(table.name, this.context.locale),
                    desc: mwater_expressions_1.ExprUtils.localizeString(table.desc, this.context.locale),
                    onClick: this.props.onChange.bind(null, table.id)
                };
            })
        });
    }
    getSweetSenseTables() {
        return lodash_1.default.filter(this.props.schema.getTables(), (table) => {
            if (table.deprecated) {
                return false;
            }
            if (table.id.match(/^sweetsense/)) {
                return true;
            }
            return false;
        });
    }
    render() {
        const sweetSenseTables = this.getSweetSenseTables();
        const tabs = [
            { id: "sites", label: [R("i", { className: "fa fa-map-marker" }), " Sites"], elem: this.renderSites() },
            { id: "forms", label: [R("i", { className: "fa fa-th-list" }), " Surveys"], elem: this.renderForms() },
            {
                id: "indicators",
                label: [R("i", { className: "fa fa-check-circle" }), " Indicators"],
                elem: this.renderIndicators()
            },
            {
                id: "issues",
                label: [R("i", { className: "fa fa-exclamation-circle" }), " Issues"],
                elem: this.renderIssues()
            },
            { id: "tablesets", label: [R("i", { className: "fa fa-table" }), " Tables"], elem: this.renderTablesets() },
            { id: "metrics", label: [R("i", { className: "fa fa-line-chart" }), " Metrics"], elem: this.renderMetrics() },
            { id: "assets", label: [R("i", { className: "fas fa-map-pin" }), " Assets"], elem: this.renderAssets() }
        ];
        if (sweetSenseTables.length > 0) {
            tabs.push({ id: "sensors", label: " Sensors", elem: this.renderSweetSense() });
        }
        tabs.push({ id: "other", label: "Advanced", elem: this.renderOther() });
        return R("div", null, R("div", { className: "text-muted" }, "Select data from sites, surveys or an advanced category below. Indicators can be found within their associated site types."), R(TabbedComponent_1.default, {
            tabs,
            initialTabId: "sites"
        }));
    }
}
exports.default = MWaterCompleteTableSelectComponent;
MWaterCompleteTableSelectComponent.contextTypes = { locale: prop_types_1.default.string };
// Searchable list of forms
class FormsListComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleTableRemove = (table) => {
            if (confirm(`Remove ${mwater_expressions_1.ExprUtils.localizeString(table.name, this.context.locale)}? Any widgets that depend on it will no longer work properly.`)) {
                return this.props.onExtraTableRemove(table.id);
            }
        };
        this.searchRef = (comp) => {
            // Focus
            if (comp) {
                return comp.focus();
            }
        };
        this.state = {
            forms: null,
            search: ""
        };
    }
    componentDidMount() {
        // Get names and basic of forms
        const query = {};
        query.fields = JSON.stringify({
            "design.name": 1,
            "design.description": 1,
            roles: 1,
            created: 1,
            modified: 1,
            state: 1,
            isMaster: 1
        });
        query.selector = JSON.stringify({ design: { $exists: true }, state: { $ne: "deleted" } });
        query.client = this.props.client;
        // Get list of all form names
        jquery_1.default.getJSON(this.props.apiUrl + "forms?" + querystring_1.default.stringify(query), (forms) => {
            // Sort by modified.on desc but first by user
            forms = lodash_1.default.sortByOrder(forms, [
                (form) => ((this.props.extraTables || []).includes("responses:" + form._id) ? 1 : 0),
                (form) => (form.created.by === this.props.user ? 1 : 0),
                (form) => { var _a; return (_a = form.modified) === null || _a === void 0 ? void 0 : _a.on; }
            ], ["desc", "desc", "desc"]);
            // TODO use name instead of design.name
            this.setState({
                forms: lodash_1.default.map(forms, (form) => {
                    var _a;
                    let desc = mwater_expressions_1.ExprUtils.localizeString(form.design.description, this.context.locale) || "";
                    if (desc) {
                        desc += " - ";
                    }
                    desc += `Modified ${moment_1.default((_a = form.modified) === null || _a === void 0 ? void 0 : _a.on, moment_1.default.ISO_8601).format("ll")}`;
                    return {
                        id: form._id,
                        name: mwater_expressions_1.ExprUtils.localizeString(form.design.name, this.context.locale),
                        desc
                    };
                })
            });
        }).fail((xhr) => {
            this.setState({ error: xhr.responseText });
        });
    }
    render() {
        let forms;
        if (this.state.error) {
            return R("div", { className: "alert alert-danger" }, this.state.error);
        }
        // Filter forms
        if (this.state.search) {
            const escapeRegExp = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
            const searchStringRegExp = new RegExp(escapeRegExp(this.state.search), "i");
            forms = lodash_1.default.filter(this.state.forms, (form) => form.name.match(searchStringRegExp));
        }
        else {
            ;
            ({ forms } = this.state);
        }
        // Remove if already included
        forms = lodash_1.default.filter(forms || [], (f) => !(this.props.extraTables || []).includes(`responses:${f.id}`));
        let tables = lodash_1.default.filter(this.props.schema.getTables(), (table) => (table.id.match(/^responses:/) || table.id.match(/^master_responses:/)) && !table.deprecated);
        tables = lodash_1.default.sortBy(tables, (t) => t.name.en);
        return R("div", null, R("label", null, "Included Surveys:"), tables.length > 0
            ? R(uiComponents.OptionListComponent, {
                items: lodash_1.default.map(tables, (table) => {
                    return {
                        name: mwater_expressions_1.ExprUtils.localizeString(table.name, this.context.locale),
                        desc: mwater_expressions_1.ExprUtils.localizeString(table.desc, this.context.locale),
                        onClick: this.props.onChange.bind(null, table.id),
                        onRemove: this.handleTableRemove.bind(null, table)
                    };
                })
            })
            : R("div", null, "None"), R("br"), R("label", null, "All Surveys:"), !this.state.forms || this.state.forms.length === 0
            ? R("div", { className: "alert alert-info" }, R("i", { className: "fa fa-spinner fa-spin" }), "\u00A0Loading...")
            : [
                R("input", {
                    type: "text",
                    className: "form-control form-control-sm",
                    placeholder: "Search...",
                    key: "search",
                    ref: this.searchRef,
                    style: { maxWidth: "20em", marginBottom: 10 },
                    value: this.state.search,
                    onChange: (ev) => this.setState({ search: ev.target.value })
                }),
                R(uiComponents.OptionListComponent, {
                    items: lodash_1.default.map(forms, (form) => ({
                        name: form.name,
                        desc: form.desc,
                        onClick: this.props.onChange.bind(null, "responses:" + form.id)
                    }))
                })
            ]);
    }
}
FormsListComponent.contextTypes = { locale: prop_types_1.default.string };
// Searchable list of indicators
class IndicatorsListComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleTableRemove = (table) => {
            if (confirm(`Remove ${mwater_expressions_1.ExprUtils.localizeString(table.name, this.context.locale)}? Any widgets that depend on it will no longer work properly.`)) {
                return this.props.onExtraTableRemove(table.id);
            }
        };
        this.searchRef = (comp) => {
            // Focus
            if (comp) {
                return comp.focus();
            }
        };
        this.handleSelect = (tableId) => {
            // Add table if not present
            if (!this.props.schema.getTable(tableId)) {
                this.props.onExtraTableAdd(tableId);
            }
            this.addIndicatorConfirmPopup.show(tableId);
        };
        this.state = {
            indicators: null,
            search: ""
        };
    }
    componentDidMount() {
        // Get names and basic of forms
        const query = {};
        query.fields = JSON.stringify({ "design.name": 1, "design.desc": 1, "design.recommended": 1, deprecated: 1 });
        query.client = this.props.client;
        // Get list of all indicator names
        return jquery_1.default.getJSON(this.props.apiUrl + "indicators?" + querystring_1.default.stringify(query), (indicators) => {
            // Remove deprecated
            indicators = lodash_1.default.filter(indicators, (indicator) => !indicator.deprecated);
            // Sort by name
            indicators = lodash_1.default.sortByOrder(indicators, [
                (indicator) => ((this.props.extraTables || []).includes("indicator_values:" + indicator._id) ? 0 : 1),
                (indicator) => (indicator.design.recommended ? 0 : 1),
                (indicator) => mwater_expressions_1.ExprUtils.localizeString(indicator.design.name, this.context.locale)
            ], ["asc", "asc", "asc"]);
            return this.setState({
                indicators: lodash_1.default.map(indicators, (indicator) => ({
                    id: indicator._id,
                    name: mwater_expressions_1.ExprUtils.localizeString(indicator.design.name, this.context.locale),
                    desc: mwater_expressions_1.ExprUtils.localizeString(indicator.design.desc, this.context.locale)
                }))
            });
        }).fail((xhr) => {
            return this.setState({ error: xhr.responseText });
        });
    }
    render() {
        let indicators;
        if (this.state.error) {
            return R("div", { className: "alert alert-danger" }, this.state.error);
        }
        // Filter indicators
        if (this.state.search) {
            const escapeRegExp = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
            const searchStringRegExp = new RegExp(escapeRegExp(this.state.search), "i");
            indicators = lodash_1.default.filter(this.state.indicators || [], (indicator) => indicator.name.match(searchStringRegExp));
        }
        else {
            ;
            ({ indicators } = this.state);
        }
        // Remove if already included
        indicators = lodash_1.default.filter(indicators || [], (f) => !(this.props.extraTables || []).includes(`indicator_values:${f.id}`));
        let tables = lodash_1.default.filter(this.props.schema.getTables(), (table) => table.id.match(/^indicator_values:/) && !table.deprecated);
        tables = lodash_1.default.sortBy(tables, (t) => t.name.en);
        return R("div", null, R(AddIndicatorConfirmPopupComponent, {
            schema: this.props.schema,
            onChange: this.props.onChange,
            onExtraTableAdd: this.props.onExtraTableAdd,
            ref: (c) => {
                this.addIndicatorConfirmPopup = c;
            }
        }), R("label", null, "Included Indicators:"), tables.length > 0
            ? R(uiComponents.OptionListComponent, {
                items: lodash_1.default.map(tables, (table) => {
                    return {
                        name: mwater_expressions_1.ExprUtils.localizeString(table.name, this.context.locale),
                        desc: mwater_expressions_1.ExprUtils.localizeString(table.desc, this.context.locale),
                        onClick: this.handleSelect.bind(null, table.id),
                        onRemove: this.handleTableRemove.bind(null, table)
                    };
                })
            })
            : R("div", null, "None"), R("br"), R("label", null, "All Indicators:"), !this.state.indicators || this.state.indicators.length === 0
            ? R("div", { className: "alert alert-info" }, R("i", { className: "fa fa-spinner fa-spin" }), "\u00A0Loading...")
            : [
                R("input", {
                    type: "text",
                    className: "form-control form-control-sm",
                    placeholder: "Search...",
                    key: "search",
                    ref: this.searchRef,
                    style: { maxWidth: "20em", marginBottom: 10 },
                    value: this.state.search,
                    onChange: (ev) => this.setState({ search: ev.target.value })
                }),
                R(uiComponents.OptionListComponent, {
                    items: lodash_1.default.map(indicators, (indicator) => ({
                        name: indicator.name,
                        desc: indicator.desc,
                        onClick: this.handleSelect.bind(null, "indicator_values:" + indicator.id)
                    }))
                })
            ]);
    }
}
IndicatorsListComponent.contextTypes = { locale: prop_types_1.default.string };
class AddIndicatorConfirmPopupComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            indicatorTable: null
        };
    }
    show(indicatorTable) {
        return this.setState({ visible: true, indicatorTable });
    }
    renderContents() {
        // Show loading if table not loaded
        if (!this.props.schema.getTable(this.state.indicatorTable)) {
            return R("div", { className: "alert alert-info" }, R("i", { className: "fa fa-spinner fa-spin" }), "\u00A0Loading...");
        }
        // Find entity links
        const entityColumns = lodash_1.default.filter(this.props.schema.getColumns(this.state.indicatorTable), (col) => { var _a, _b; return (_b = (_a = col.join) === null || _a === void 0 ? void 0 : _a.toTable) === null || _b === void 0 ? void 0 : _b.match(/^entities\./); });
        return R("div", null, R("p", null, `In general, it is better to get indicator values from the related site. Please select the site 
below, then find the indicator values in the 'Related Indicators' section. Or click on 'Use Raw Indicator' if you 
are certain that you want to use the raw indicator table`), R(uiComponents.OptionListComponent, {
            items: lodash_1.default.map(entityColumns, (entityColumn) => ({
                name: mwater_expressions_1.ExprUtils.localizeString(entityColumn.name, this.context.locale),
                desc: mwater_expressions_1.ExprUtils.localizeString(entityColumn.desc, this.context.locale),
                onClick: () => {
                    // Select table
                    this.props.onChange(entityColumn.join.toTable);
                    return this.setState({ visible: false });
                }
            }))
        }), R("br"), R("div", null, R("a", { className: "link-plain", onClick: this.props.onChange.bind(null, this.state.indicatorTable) }, "Use Raw Indicator")));
    }
    render() {
        if (!this.state.visible) {
            return null;
        }
        return R(ModalPopupComponent_1.default, {
            showCloseX: true,
            onClose: () => this.setState({ visible: false }),
            header: "Add Indicator"
        }, this.renderContents());
    }
}
AddIndicatorConfirmPopupComponent.contextTypes = { locale: prop_types_1.default.string };
// Searchable list of issue types
class IssuesListComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleTableRemove = (table) => {
            if (confirm(`Remove ${mwater_expressions_1.ExprUtils.localizeString(table.name, this.context.locale)}? Any widgets that depend on it will no longer work properly.`)) {
                return this.props.onExtraTableRemove(table.id);
            }
        };
        this.searchRef = (comp) => {
            // Focus
            if (comp) {
                return comp.focus();
            }
        };
        this.state = {
            issueTypes: null,
            search: ""
        };
    }
    componentDidMount() {
        // Get names and basic of issueTypes
        const query = {};
        query.fields = JSON.stringify({ name: 1, desc: 1, roles: 1, created: 1, modified: 1 });
        query.client = this.props.client;
        // Get list of all issueType names
        return jquery_1.default.getJSON(this.props.apiUrl + "issue_types?" + querystring_1.default.stringify(query), (issueTypes) => {
            // Sort by modified.on desc but first by user
            issueTypes = lodash_1.default.sortByOrder(issueTypes, [
                (issueType) => ((this.props.extraTables || []).includes("issues:" + issueType._id) ? 0 : 1),
                (issueType) => (issueType.created.by === this.props.user ? 0 : 1),
                (issueType) => mwater_expressions_1.ExprUtils.localizeString(issueType.name, this.context.locale)
            ], ["asc", "asc", "asc"]);
            return this.setState({
                issueTypes: lodash_1.default.map(issueTypes, (issueType) => ({
                    id: issueType._id,
                    name: mwater_expressions_1.ExprUtils.localizeString(issueType.name, this.context.locale),
                    desc: mwater_expressions_1.ExprUtils.localizeString(issueType.desc, this.context.locale)
                }))
            });
        }).fail((xhr) => {
            return this.setState({ error: xhr.responseText });
        });
    }
    render() {
        let issueTypes;
        if (this.state.error) {
            return R("div", { className: "alert alert-danger" }, this.state.error);
        }
        // Filter issueTypes
        if (this.state.search) {
            const escapeRegExp = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
            const searchStringRegExp = new RegExp(escapeRegExp(this.state.search), "i");
            issueTypes = lodash_1.default.filter(this.state.issueTypes || [], (issueType) => issueType.name.match(searchStringRegExp));
        }
        else {
            ;
            ({ issueTypes } = this.state);
        }
        // Remove if already included
        issueTypes = lodash_1.default.filter(issueTypes || [], (f) => !(this.props.extraTables || []).includes(`issues:${f.id}`));
        let tables = lodash_1.default.filter(this.props.schema.getTables(), (table) => (table.id.match(/^issues:/) || table.id.match(/^issue_events:/)) && !table.deprecated);
        tables = lodash_1.default.sortBy(tables, (t) => t.name.en);
        return R("div", null, R("label", null, "Included Issues:"), tables.length > 0
            ? R(uiComponents.OptionListComponent, {
                items: lodash_1.default.map(tables, (table) => {
                    return {
                        name: mwater_expressions_1.ExprUtils.localizeString(table.name, this.context.locale),
                        desc: mwater_expressions_1.ExprUtils.localizeString(table.desc, this.context.locale),
                        onClick: this.props.onChange.bind(null, table.id),
                        onRemove: this.handleTableRemove.bind(null, table)
                    };
                })
            })
            : R("div", null, "None"), R("br"), R("label", null, "All Issues:"), !this.state.issueTypes || this.state.issueTypes.length === 0
            ? R("div", { className: "alert alert-info" }, R("i", { className: "fa fa-spinner fa-spin" }), "\u00A0Loading...")
            : [
                R("input", {
                    type: "text",
                    className: "form-control form-control-sm",
                    placeholder: "Search...",
                    key: "search",
                    ref: this.searchRef,
                    style: { maxWidth: "20em", marginBottom: 10 },
                    value: this.state.search,
                    onChange: (ev) => this.setState({ search: ev.target.value })
                }),
                R(uiComponents.OptionListComponent, {
                    items: lodash_1.default.map(issueTypes, (issueType) => ({
                        name: issueType.name,
                        desc: issueType.desc,
                        onClick: this.props.onChange.bind(null, "issues:" + issueType.id)
                    }))
                })
            ]);
    }
}
IssuesListComponent.contextTypes = { locale: prop_types_1.default.string };
