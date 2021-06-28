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
exports.loadDashboard = void 0;
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
const jquery_1 = __importDefault(require("jquery"));
const lodash_1 = __importDefault(require("lodash"));
const index_1 = __importStar(require("./index")), visualizationExports = index_1;
const js_yaml_1 = __importDefault(require("js-yaml"));
const TabbedComponent_1 = __importDefault(require("react-library/lib/TabbedComponent"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
// Pass in:
// schemaUrl (yaml schema url)
// queryUrl (will replace {query} with query)
// loadDesignUrl (gets the current design)
// saveDesignUrl (sets the current design)
// design (initial design)
// elemId (id of to render into)
function loadDashboard(options) {
    // First get the schema
    return jquery_1.default.get(options.schemaUrl, function (schemaYaml) {
        // Load the schema
        const schema = new index_1.default.Schema();
        const schemaJson = js_yaml_1.default.safeLoad(schemaYaml);
        schema.loadFromJSON(schemaJson);
        // Create the data source
        const dataSource = new visualizationExports.CachingDataSource({
            perform(query, cb) {
                const url = options.queryUrl.replace(/\{query\}/, encodeURIComponent(JSON.stringify(query)));
                return jquery_1.default.getJSON(url, (rows) => cb(null, rows)).fail(function (xhr) {
                    console.error(xhr.responseText);
                    return cb(new Error(xhr.responseText));
                });
            }
        });
        // Create the widget factory
        const widgetFactory = new visualizationExports.WidgetFactory({ schema, dataSource });
        // Get the design
        return jquery_1.default.get(options.loadDesignUrl, function (designString) {
            let design;
            if (designString) {
                design = JSON.parse(designString);
            }
            else {
                // Use default
                ;
                ({ design } = options);
            }
            // Convert to tabs if not already
            if (!design.tabs) {
                design = {
                    tabs: [{ name: "Main", design }]
                };
            }
            // Called to update the design and re-render
            function updateDesign(newDesign) {
                design = newDesign;
                // Save to database
                jquery_1.default.post(options.saveDesignUrl, { userdata: JSON.stringify(design) });
                return render();
            }
            // Render the dashboard
            function render() {
                const elem = R(TabbedDashboard, {
                    design,
                    widgetFactory,
                    onDesignChange: updateDesign
                });
                return ReactDOM.render(elem, document.getElementById(options.elemId));
            }
            // Initial render
            return render();
        });
    });
}
exports.loadDashboard = loadDashboard;
class TabbedDashboard extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleDesignChange = (index, design) => {
            const tabs = this.props.design.tabs.slice();
            tabs[index] = lodash_1.default.extend({}, tabs[index], { design });
            return this.props.onDesignChange(lodash_1.default.extend({}, this.props.design, { tabs }));
        };
        this.handleAddTab = () => {
            const tabs = this.props.design.tabs.slice();
            // Add new dashboard
            tabs.push({ name: "Untitled", design: { items: {} } });
            return this.props.onDesignChange(lodash_1.default.extend({}, this.props.design, { tabs }));
        };
        this.handleRemoveTab = (index) => {
            if (!confirm("Permanently remove this tab? This cannot be undone!")) {
                return;
            }
            const tabs = this.props.design.tabs.slice();
            tabs.splice(index, 1);
            return this.props.onDesignChange(lodash_1.default.extend({}, this.props.design, { tabs }));
        };
        this.handleRenameTab = (index) => {
            let { name } = this.props.design.tabs[index];
            name = prompt("Name of tab", name);
            if (name) {
                const tabs = this.props.design.tabs.slice();
                tabs[index] = lodash_1.default.extend({}, tabs[index], { name });
                return this.props.onDesignChange(lodash_1.default.extend({}, this.props.design, { tabs }));
            }
        };
        this.createTab = (tab, index) => {
            return {
                id: `${index}`,
                label: tab.name,
                elem: R(visualizationExports.DashboardComponent, {
                    design: tab.design,
                    widgetFactory: this.props.widgetFactory,
                    onDesignChange: this.handleDesignChange.bind(null, index),
                    extraTitleButtonsElem: [
                        R("a", { key: "renametab", className: "btn btn-link btn-sm", onClick: this.handleRenameTab.bind(null, index) }, R("span", { className: "glyphicon glyphicon-pencil" }), " Rename Tab"),
                        " ",
                        R("a", { key: "removetab", className: "btn btn-link btn-sm", onClick: this.handleRemoveTab.bind(null, index) }, R("span", { className: "glyphicon glyphicon-remove" }), " Remove Tab")
                    ]
                })
            };
        };
    }
    createTabs() {
        return lodash_1.default.map(this.props.design.tabs, this.createTab);
    }
    render() {
        return R(TabbedComponent_1.default, {
            tabs: this.createTabs(),
            initialTabId: "0",
            onAddTab: this.handleAddTab
        });
    }
}
