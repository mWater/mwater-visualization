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
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const Widget_1 = __importDefault(require("./../Widget"));
const DropdownWidgetComponent_1 = __importDefault(require("./../DropdownWidgetComponent"));
const CsvBuilder_1 = __importDefault(require("./../../CsvBuilder"));
const ActionCancelModalComponent_1 = __importDefault(require("react-library/lib/ActionCancelModalComponent"));
const ChartViewComponent_1 = __importDefault(require("./ChartViewComponent"));
const ModalWindowComponent_1 = __importDefault(require("react-library/lib/ModalWindowComponent"));
const ui = __importStar(require("react-library/lib/bootstrap"));
/** A widget which is a chart */
class ChartWidget extends Widget_1.default {
    constructor(chart) {
        super();
        this.chart = chart;
    }
    // Creates a view of the widget.
    // options:
    //  schema: schema to use
    //  dataSource: data source to use
    //  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
    //  design: widget design
    //  scope: scope of the widget (when the widget self-selects a particular scope)
    //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    //  onScopeChange: called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
    //  onDesignChange: called with new design. null/undefined for readonly
    //  width: width in pixels on screen
    //  height: height in pixels on screen
    //  onRowClick: Called with (tableId, rowId) when item is clicked
    createViewElement(options) {
        return R(ChartWidgetComponent, {
            chart: this.chart,
            design: options.design,
            schema: options.schema,
            widgetDataSource: options.widgetDataSource,
            dataSource: options.dataSource,
            scope: options.scope,
            filters: options.filters,
            onScopeChange: options.onScopeChange,
            onDesignChange: options.onDesignChange,
            width: options.width,
            height: options.height,
            onRowClick: options.onRowClick
        });
    }
    // Get the data that the widget needs. This will be called on the server, typically.
    //   design: design of the chart
    //   schema: schema to use
    //   dataSource: data source to get data from
    //   filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
    //   callback: (error, data)
    getData(design, schema, dataSource, filters, callback) {
        // Clean design first
        design = this.chart.cleanDesign(design, schema);
        return this.chart.getData(design, schema, dataSource, filters, callback);
    }
    // Get a list of table ids that can be filtered on
    getFilterableTables(design, schema) {
        // Clean design first
        design = this.chart.cleanDesign(design, schema);
        return this.chart.getFilterableTables(design, schema);
    }
    // Determine if widget is auto-height, which means that a vertical height is not required.
    isAutoHeight() {
        return this.chart.isAutoHeight();
    }
}
exports.default = ChartWidget;
// Complete chart widget
class ChartWidgetComponent extends react_1.default.PureComponent {
    constructor(props) {
        super(props);
        // Saves a csv file to disk
        this.handleSaveCsvFile = () => {
            // Get the data
            return this.props.widgetDataSource.getData(this.props.design, this.props.filters, (err, data) => {
                if (err) {
                    return alert("Failed to get data: " + err.message);
                }
                // Create data table
                const table = this.props.chart.createDataTable(this.props.design, this.props.schema, this.props.dataSource, data, this.context.locale);
                if (!table) {
                    return;
                }
                // Convert to csv
                let csv = new CsvBuilder_1.default().build(table);
                // Add BOM
                csv = "\uFEFF" + csv;
                // Make a blob and save
                const blob = new Blob([csv], { type: "text/csv" });
                // Require at use as causes server problems
                const FileSaver = require("file-saver");
                return FileSaver.saveAs(blob, "Exported Data.csv");
            });
        };
        this.handleStartEditing = () => {
            // Can't edit if already editing
            if (this.state.editDesign) {
                return;
            }
            this.setState({ editDesign: this.props.design });
        };
        this.handleEndEditing = () => {
            this.props.onDesignChange(this.state.editDesign);
            this.setState({ editDesign: null });
        };
        this.handleCancelEditing = () => {
            this.setState({ editDesign: null });
        };
        this.handleEditDesignChange = (design) => {
            this.setState({ editDesign: design });
        };
        this.state = {
            // Design that is being edited. Change is propagated on closing window
            editDesign: null
        };
    }
    renderChart(design, onDesignChange, width, height) {
        return R(ChartViewComponent_1.default, {
            chart: this.props.chart,
            design,
            onDesignChange,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            widgetDataSource: this.props.widgetDataSource,
            scope: this.props.scope,
            filters: this.props.filters,
            width,
            height,
            onScopeChange: this.props.onScopeChange,
            onRowClick: this.props.onRowClick
        });
    }
    renderEditor() {
        if (!this.state.editDesign) {
            return null;
        }
        // Create editor
        const editor = this.props.chart.createDesignerElement({
            schema: this.props.schema,
            filters: this.props.filters,
            dataSource: this.props.dataSource,
            design: this.state.editDesign,
            onDesignChange: this.handleEditDesignChange
        });
        if (this.props.chart.hasDesignerPreview()) {
            // Create chart (maxing out at half of width of screen)
            const chartWidth = Math.min(document.body.clientWidth / 2, this.props.width);
            const chartHeight = this.props.height != null ? this.props.height * (chartWidth / this.props.width) : undefined;
            const chart = this.renderChart(this.state.editDesign, (design) => this.setState({ editDesign: design }), chartWidth, chartHeight);
            const content = R("div", { style: { height: "100%", width: "100%" } }, R("div", {
                style: {
                    position: "absolute",
                    left: 0,
                    top: 0,
                    border: "solid 2px #EEE",
                    borderRadius: 8,
                    padding: 10,
                    width: chartWidth + 20,
                    height: chartHeight != null ? chartHeight + 20 : undefined,
                    overflow: "hidden"
                }
            }, chart), R("div", { style: { width: "100%", height: "100%", paddingLeft: chartWidth + 40 } }, R("div", {
                style: {
                    width: "100%",
                    height: "100%",
                    overflowY: "auto",
                    paddingLeft: 20,
                    paddingRight: 20,
                    borderLeft: "solid 3px #AAA"
                }
            }, editor)));
            return R(ModalWindowComponent_1.default, {
                isOpen: true,
                onRequestClose: this.handleEndEditing
            }, content);
        }
        else {
            return R(ActionCancelModalComponent_1.default, {
                size: "large",
                onCancel: this.handleCancelEditing,
                onAction: this.handleEndEditing
            }, editor);
        }
    }
    // Render a link to start editing
    renderEditLink() {
        return R("div", { className: "mwater-visualization-widget-placeholder", onClick: this.handleStartEditing }, R(ui.Icon, { id: this.props.chart.getPlaceholderIcon() }));
    }
    render() {
        const design = this.props.chart.cleanDesign(this.props.design, this.props.schema);
        // Determine if valid design
        const validDesign = !this.props.chart.validateDesign(design, this.props.schema);
        // Determine if empty
        const emptyDesign = this.props.chart.isEmpty(design);
        // Create dropdown items
        const dropdownItems = this.props.chart.createDropdownItems(design, this.props.schema, this.props.widgetDataSource, this.props.filters);
        if (validDesign) {
            dropdownItems.push({ label: "Export Data", icon: "save-file", onClick: this.handleSaveCsvFile });
        }
        if (this.props.onDesignChange != null) {
            dropdownItems.unshift({
                label: this.props.chart.getEditLabel(),
                icon: "pencil",
                onClick: this.handleStartEditing
            });
        }
        // Wrap in a simple widget
        return R("div", {
            onDoubleClick: this.props.onDesignChange != null ? this.handleStartEditing : undefined,
            style: { position: "relative", width: this.props.width }
        }, this.props.onDesignChange != null ? this.renderEditor() : undefined, react_1.default.createElement(DropdownWidgetComponent_1.default, {
            width: this.props.width,
            height: this.props.height,
            dropdownItems
        }, this.renderChart(design, this.props.onDesignChange, this.props.width, this.props.height)), (emptyDesign || !validDesign) && this.props.onDesignChange != null ? this.renderEditLink() : undefined);
    }
}
ChartWidgetComponent.contextTypes = { locale: prop_types_1.default.string };
