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
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let MapWidget;
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const lodash_1 = __importDefault(require("lodash"));
const Widget_1 = __importDefault(require("./Widget"));
const DropdownWidgetComponent_1 = __importDefault(require("./DropdownWidgetComponent"));
const ModalWindowComponent_1 = __importDefault(require("react-library/lib/ModalWindowComponent"));
const MapUtils = __importStar(require("../maps/MapUtils"));
// Design is the map design specified in maps/Map Design.md
exports.default = MapWidget = class MapWidget extends Widget_1.default {
    // Creates a React element that is a view of the widget
    // options:
    //  schema: schema to use
    //  dataSource: data source to use
    //  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
    //  design: widget design
    //  scope: scope of the widget (when the widget self-selects a particular scope)
    //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    //  onScopeChange: called with scope of widget
    //  onDesignChange: called with new design. null/undefined for readonly
    //  width: width in pixels on screen
    //  height: height in pixels on screen
    //  onRowClick: Called with (tableId, rowId) when item is clicked
    createViewElement(options) {
        return react_1.default.createElement(MapWidgetComponent, {
            schema: options.schema,
            dataSource: options.dataSource,
            widgetDataSource: options.widgetDataSource,
            design: options.design,
            onDesignChange: options.onDesignChange,
            scope: options.scope,
            filters: options.filters,
            onScopeChange: options.onScopeChange,
            width: options.width,
            height: options.height,
            onRowClick: options.onRowClick
        });
    }
    // Get a list of table ids that can be filtered on
    getFilterableTables(design, schema) {
        // Get filterable tables
        return MapUtils.getFilterableTables(design, schema);
    }
};
class MapWidgetComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleStartEditing = () => {
            return this.setState({ editDesign: this.props.design });
        };
        this.handleEndEditing = () => {
            this.props.onDesignChange(this.state.editDesign);
            return this.setState({ editDesign: null });
        };
        this.handleEditDesignChange = (design) => {
            return this.setState({ editDesign: design });
        };
        this.state = {
            // Design that is being edited. Change is propagated on closing window
            editDesign: null,
            transientDesign: props.design // Temporary design for read-only maps
        };
    }
    componentDidUpdate(prevProps) {
        if (!lodash_1.default.isEqual(prevProps.design, this.props.design)) {
            return this.setState({ transientDesign: this.props.design });
        }
    }
    renderEditor() {
        if (!this.state.editDesign) {
            return null;
        }
        // Require here to prevent server require problems
        const MapDesignerComponent = require("../maps/MapDesignerComponent").default;
        // Create editor
        const editor = react_1.default.createElement(MapDesignerComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            design: this.state.editDesign,
            onDesignChange: this.handleEditDesignChange,
            filters: this.props.filters
        });
        // Create map (maxing out at half of width of screen)
        const width = Math.min(document.body.clientWidth / 2, this.props.width);
        const height = (this.props.height * width) / this.props.width;
        const chart = this.renderContent(this.state.editDesign, this.handleEditDesignChange, width, height);
        const content = R("div", { style: { height: "100%", width: "100%" } }, R("div", {
            style: {
                position: "absolute",
                left: 0,
                top: 0,
                border: "solid 2px #EEE",
                borderRadius: 8,
                padding: 10,
                width: width + 20,
                height: height + 20
            }
        }, chart), R("div", { style: { width: "100%", height: "100%", paddingLeft: width + 40 } }, R("div", {
            style: { width: "100%", height: "100%", overflowY: "auto", paddingLeft: 20, borderLeft: "solid 3px #AAA" }
        }, editor)));
        return react_1.default.createElement(ModalWindowComponent_1.default, {
            isOpen: true,
            onRequestClose: this.handleEndEditing
        }, content);
    }
    renderContent(design, onDesignChange, width, height) {
        // Require here to prevent server require problems
        const { MapViewComponent } = require("../maps/MapViewComponent").default;
        return R("div", { style: { width, height, padding: 10 } }, react_1.default.createElement(MapViewComponent, {
            schema: this.props.schema,
            design,
            dataSource: this.props.dataSource,
            mapDataSource: this.props.widgetDataSource.getMapDataSource(design),
            onDesignChange,
            scope: this.props.scope,
            onScopeChange: this.props.onScopeChange,
            extraFilters: this.props.filters,
            width: width - 20,
            height: height - 20,
            scrollWheelZoom: false,
            onRowClick: this.props.onRowClick
        }));
    }
    render() {
        const dropdownItems = [];
        if (this.props.onDesignChange != null) {
            dropdownItems.push({ label: "Edit", icon: "pencil", onClick: this.handleStartEditing });
        }
        const handleDesignChange = (d) => this.setState({ transientDesign: d });
        // Wrap in a simple widget
        return R("div", null, this.props.onDesignChange != null ? this.renderEditor() : undefined, 
        // Use transient design (as it may be affected by toggling layers)
        react_1.default.createElement(DropdownWidgetComponent_1.default, {
            width: this.props.width,
            height: this.props.height,
            dropdownItems
        }, this.renderContent(this.state.transientDesign, handleDesignChange, this.props.width, this.props.height)));
    }
}
