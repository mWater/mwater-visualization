"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prop_types_1 = __importDefault(require("prop-types"));
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const MWaterTableSelectComponent_1 = __importDefault(require("./MWaterTableSelectComponent"));
const MWaterAddRelatedFormComponent_1 = __importDefault(require("./MWaterAddRelatedFormComponent"));
const MWaterAddRelatedIndicatorComponent_1 = __importDefault(require("./MWaterAddRelatedIndicatorComponent"));
const MWaterGlobalFiltersComponent_1 = __importDefault(require("./MWaterGlobalFiltersComponent"));
/** Creates a tableSelectElementFactory context to allow selecting of a table in an mWater-friendly way
 * and several other context items
 */
class MWaterContextComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleAddTable = (table) => {
            const extraTables = lodash_1.default.union(this.props.extraTables, [table]);
            return this.props.onExtraTablesChange(extraTables);
        };
    }
    static initClass() {
        this.childContextTypes = {
            tableSelectElementFactory: prop_types_1.default.func,
            addLayerElementFactory: prop_types_1.default.func,
            globalFiltersElementFactory: prop_types_1.default.func,
            // Displays a component to edit global filters. nullIfIrrelevant causes null element if not applicable to filterableTables
            // Decorates sections (the children element, specifically) in the expression picker
            decorateScalarExprTreeSectionChildren: prop_types_1.default.func,
            // Function to override initial open state of a section. Passed { tableId: id of table, section: section object from schema, filter: optional string filter }
            // Should return true to set initially open
            isScalarExprTreeSectionInitiallyOpen: prop_types_1.default.func,
            // Function to override filtering of a section. Passed { tableId: id of table, section: section object from schema, filter: optional string filter }
            // Should return null for default, true to include, false to exclude
            isScalarExprTreeSectionMatch: prop_types_1.default.func
        };
    }
    getChildContext() {
        const context = {};
        context.tableSelectElementFactory = (props) => {
            return react_1.default.createElement(MWaterTableSelectComponent_1.default, {
                apiUrl: this.props.apiUrl,
                client: this.props.client,
                schema: props.schema,
                user: this.props.user,
                table: props.value,
                onChange: props.onChange,
                extraTables: this.props.extraTables,
                onExtraTablesChange: this.props.onExtraTablesChange,
                filter: props.filter,
                onFilterChange: props.onFilterChange
            });
        };
        if (this.props.addLayerElementFactory) {
            context.addLayerElementFactory = this.props.addLayerElementFactory;
        }
        context.globalFiltersElementFactory = (props) => {
            if (props.nullIfIrrelevant && !lodash_1.default.any(props.filterableTables, (t) => t.match(/^entities./))) {
                return null;
            }
            return react_1.default.createElement(MWaterGlobalFiltersComponent_1.default, props);
        };
        context.decorateScalarExprTreeSectionChildren = (options) => {
            // If related forms section of entities table
            if (options.tableId.match(/^entities\./) && options.section.id === "!related_forms") {
                return R("div", { key: "_add_related_form_parent" }, options.children, R(MWaterAddRelatedFormComponent_1.default, {
                    key: "_add_related_form",
                    table: options.tableId,
                    apiUrl: this.props.apiUrl,
                    client: this.props.client,
                    user: this.props.user,
                    schema: this.props.schema,
                    onSelect: this.handleAddTable
                }));
            }
            // If indicators section of entities table
            if (options.tableId.match(/^entities\./) && options.section.id === "!indicators") {
                return R("div", { key: "_add_related_indicator_parent" }, options.children, R(MWaterAddRelatedIndicatorComponent_1.default, {
                    key: "_add_related_indicator",
                    table: options.tableId,
                    apiUrl: this.props.apiUrl,
                    client: this.props.client,
                    user: this.props.user,
                    schema: this.props.schema,
                    onSelect: this.handleAddTable,
                    filter: options.filter
                }));
            }
            else {
                return options.children;
            }
        };
        // Always match indicator section
        context.isScalarExprTreeSectionMatch = (options) => {
            if (options.tableId.match(/^entities\./) && options.section.id === "!indicators") {
                return true;
            }
            return null;
        };
        // Always open indicator section
        context.isScalarExprTreeSectionInitiallyOpen = (options) => {
            if (options.tableId.match(/^entities\./) && options.section.id === "!indicators") {
                return true;
            }
            return null;
        };
        return context;
    }
    render() {
        return this.props.children;
    }
}
exports.default = MWaterContextComponent;
MWaterContextComponent.initClass();
