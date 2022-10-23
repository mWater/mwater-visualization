"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prop_types_1 = __importDefault(require("prop-types"));
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const update_object_1 = __importDefault(require("update-object"));
const languages_1 = __importDefault(require("languages"));
const ui = __importStar(require("react-library/lib/bootstrap"));
const react_select_1 = __importDefault(require("react-select"));
const DashboardUtils = __importStar(require("./DashboardUtils"));
const ActionCancelModalComponent_1 = __importDefault(require("react-library/lib/ActionCancelModalComponent"));
const QuickfiltersDesignComponent_1 = __importDefault(require("../quickfilter/QuickfiltersDesignComponent"));
const FiltersDesignerComponent_1 = __importDefault(require("../FiltersDesignerComponent"));
// Popup with settings for dashboard
class SettingsModalComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleSave = () => {
            this.props.onDesignChange(this.state.design);
            return this.setState({ design: null });
        };
        this.handleCancel = () => {
            return this.setState({ design: null });
        };
        this.handleDesignChange = (design) => {
            return this.setState({ design });
        };
        this.handleFiltersChange = (filters) => {
            const design = lodash_1.default.extend({}, this.state.design, { filters });
            return this.handleDesignChange(design);
        };
        this.handleGlobalFiltersChange = (globalFilters) => {
            const design = lodash_1.default.extend({}, this.state.design, { globalFilters });
            return this.handleDesignChange(design);
        };
        this.state = {
            design: null // Set when being edited
        };
    }
    show(design) {
        return this.setState({ design });
    }
    render() {
        // Don't show if not editing
        if (!this.state.design) {
            return null;
        }
        // Get filterable tables
        const filterableTables = DashboardUtils.getFilterableTables(this.state.design, this.props.schema);
        const localeOptions = lodash_1.default.map(languages_1.default.getAllLanguageCode(), (code) => {
            return {
                value: code,
                label: languages_1.default.getLanguageInfo(code).name + " (" + languages_1.default.getLanguageInfo(code).nativeName + ")"
            };
        });
        return R(ActionCancelModalComponent_1.default, {
            size: "large",
            onCancel: this.handleCancel,
            onAction: this.handleSave
        }, R("div", { style: { paddingBottom: 200 } }, R("h4", null, "Quick Filters"), R("div", { className: "text-muted" }, "Quick filters are shown to the user as a dropdown at the top of the dashboard and can be used to filter data of widgets."), filterableTables.length > 0
            ? R(QuickfiltersDesignComponent_1.default, {
                design: this.state.design.quickfilters || [],
                onDesignChange: (design) => this.handleDesignChange((0, update_object_1.default)(this.state.design, { quickfilters: { $set: design } })),
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                tables: filterableTables
            })
            : "Nothing to quickfilter. Add widgets to the dashboard", R("h4", { style: { paddingTop: 10 } }, "Filters"), R("div", { className: "text-muted" }, "Filters are built in to the dashboard and cannot be changed by viewers of the dashboard."), filterableTables.length > 0
            ? R(FiltersDesignerComponent_1.default, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                filters: this.state.design.filters,
                onFiltersChange: this.handleFiltersChange,
                filterableTables
            })
            : "Nothing to filter. Add widgets to the dashboard", this.context.globalFiltersElementFactory
            ? R("div", null, R("h4", { style: { paddingTop: 10 } }, "Global Filters"), this.context.globalFiltersElementFactory({
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                filterableTables,
                globalFilters: this.state.design.globalFilters || [],
                onChange: this.handleGlobalFiltersChange
            }))
            : undefined, R("h4", { style: { paddingTop: 10 } }, "Language"), R("div", { className: "text-muted" }, "Controls the preferred language of widgets and uses specified language when available"), R(react_select_1.default, {
            value: lodash_1.default.findWhere(localeOptions, { value: this.state.design.locale || "en" }) || null,
            options: localeOptions,
            onChange: (locale) => this.handleDesignChange((0, update_object_1.default)(this.state.design, { locale: { $set: locale.value } }))
        }), R("h4", { style: { paddingTop: 10 } }, "Advanced"), R(ui.Checkbox, {
            value: this.state.design.implicitFiltersEnabled != null ? this.state.design.implicitFiltersEnabled : true,
            onChange: (value) => this.handleDesignChange((0, update_object_1.default)(this.state.design, { implicitFiltersEnabled: { $set: value } }))
        }, "Enable Implicit Filtering (leave unchecked for new dashboards)")));
    }
}
exports.default = SettingsModalComponent;
SettingsModalComponent.contextTypes = { globalFiltersElementFactory: prop_types_1.default.func };
