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
const jquery_1 = __importDefault(require("jquery"));
const prop_types_1 = __importDefault(require("prop-types"));
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const moment_1 = __importDefault(require("moment"));
const ModalPopupComponent_1 = __importDefault(require("react-library/lib/ModalPopupComponent"));
const querystring_1 = __importDefault(require("querystring"));
const mwater_expressions_1 = require("mwater-expressions");
const ui = __importStar(require("./UIComponents"));
const formUtils = __importStar(require("mwater-forms/lib/formUtils")); // TODO requireing this directly because of bizarre backbone issue
// Link that when clicked popup up a modal window allowing user to select a form
// with an Entity/Site question to the extraTables
class MWaterAddRelatedFormComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleOpen = () => {
            return this.setState({ open: true });
        };
        this.handleSelect = (table) => {
            this.setState({ open: false });
            // Wait for table if not in schema
            if (!this.props.schema.getTable(table)) {
                this.setState({ waitingForTable: table });
            }
            return this.props.onSelect(table);
        };
        this.state = {
            open: false,
            waitingForTable: null // Set to table id that is being waited for as the result of being selected
        };
    }
    componentWillReceiveProps(nextProps) {
        // If waiting and table has arrived, cancel waiting
        if (this.state.waitingForTable && nextProps.schema.getTable(this.state.waitingForTable)) {
            return this.setState({ waitingForTable: null });
        }
    }
    render() {
        return R("div", null, this.state.waitingForTable
            ? R("div", null, R("i", { className: "fa fa-spin fa-spinner" }), " Adding...")
            : R("a", { className: "btn btn-link", onClick: this.handleOpen }, "+ Add Related Survey"), this.state.open
            ? R(AddRelatedFormModalComponent, {
                table: this.props.table,
                apiUrl: this.props.apiUrl,
                client: this.props.client,
                user: this.props.user,
                onSelect: this.handleSelect,
                onCancel: () => this.setState({ open: false })
            })
            : undefined);
    }
}
exports.default = MWaterAddRelatedFormComponent;
// Actual modal that displays the
class AddRelatedFormModalComponent extends react_1.default.Component {
    static initClass() {
        this.contextTypes = { locale: prop_types_1.default.string };
        // e.g. "en"
    }
    constructor(props) {
        super(props);
        this.state = {
            items: null,
            search: ""
        };
    }
    componentDidMount() {
        // Get all forms visible to user
        const query = {};
        query.selector = JSON.stringify({ state: { $ne: "deleted" } });
        if (this.props.client) {
            query.client = this.props.client;
        }
        // Get list of all form names
        return jquery_1.default.getJSON(this.props.apiUrl + "forms?" + querystring_1.default.stringify(query), (forms) => {
            // Sort by modified.on desc but first by user
            forms = lodash_1.default.sortByOrder(forms, [(form) => (form.created.by === this.props.user ? 1 : 0), (form) => form.modified.on], ["desc", "desc"]);
            // Filter by Entity and Site questions of tableId type
            forms = lodash_1.default.filter(forms, (form) => formUtils.findEntityQuestion(form.design, this.props.table.split(".")[1]));
            // Get _id, name, and description
            const items = lodash_1.default.map(forms, (form) => ({
                name: mwater_expressions_1.ExprUtils.localizeString(form.design.name, this.context.locale),
                desc: `Modified ${moment_1.default(form.modified.on, moment_1.default.ISO_8601).format("ll")}`,
                onClick: this.props.onSelect.bind(null, "responses:" + form._id)
            }));
            return this.setState({ items });
        }).fail((xhr) => {
            return this.setState({ error: xhr.responseText });
        });
    }
    renderContents() {
        if (!this.state.items) {
            return R("div", { className: "alert alert-info" }, R("i", { className: "fa fa-spin fa-spinner" }), " Loading...");
        }
        let { items } = this.state;
        // Filter by search
        if (this.state.search) {
            const searchStringRegExp = new RegExp(escapeRegex(this.state.search), "i");
            items = lodash_1.default.filter(items, (item) => item.name.match(searchStringRegExp));
        }
        return R("div", null, R("input", {
            type: "text",
            className: "form-control",
            placeholder: "Search...",
            key: "search",
            ref: this.searchRef,
            style: { marginBottom: 10 },
            value: this.state.search,
            onChange: (ev) => this.setState({ search: ev.target.value })
        }), R(ui.OptionListComponent, { items }));
    }
    render() {
        return R(ModalPopupComponent_1.default, {
            showCloseX: true,
            onClose: this.props.onCancel,
            header: "Add Related Survey"
        }, this.renderContents());
    }
}
AddRelatedFormModalComponent.initClass();
function escapeRegex(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}
