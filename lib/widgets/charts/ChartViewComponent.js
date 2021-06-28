"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const async_latest_1 = __importDefault(require("async-latest"));
// Inner view part of the chart widget. Uses a query data loading component
// to handle loading and continues to display old data if design becomes
// invalid
class ChartViewComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            validDesign: null,
            data: null,
            dataLoading: false,
            dataError: null,
            cacheExpiry: props.dataSource.getCacheExpiry() // Save cache expiry to see if changes
        };
        // Ensure that only one load at a time
        this.loadData = async_latest_1.default(this.loadData, { serial: true });
        this.state = {};
    }
    componentDidMount() {
        return this.updateData(this.props);
    }
    componentWillReceiveProps(nextProps) {
        if (!lodash_1.default.isEqual(nextProps.design, this.props.design) ||
            !lodash_1.default.isEqual(nextProps.filters, this.props.filters) ||
            nextProps.dataSource.getCacheExpiry() !== this.state.cacheExpiry) {
            // Save new cache expiry
            this.setState({ cacheExpiry: nextProps.dataSource.getCacheExpiry() });
            return this.updateData(nextProps);
        }
    }
    updateData(props) {
        // Clean design first (needed to validate properly)
        const design = props.chart.cleanDesign(props.design, props.schema);
        // If design is not valid, do nothing as can't query invalid design
        const errors = props.chart.validateDesign(design, props.schema);
        if (errors) {
            return;
        }
        // Loading data
        this.setState({ dataLoading: true });
        return this.loadData(props, (error, data) => {
            return this.setState({ dataLoading: false, dataError: error, data, validDesign: design });
        });
    }
    loadData(props, callback) {
        // Get data from widget data source
        return props.widgetDataSource.getData(props.design, props.filters, callback);
    }
    renderSpinner() {
        return R("div", { style: { position: "absolute", bottom: "50%", left: 0, right: 0, textAlign: "center", fontSize: 20 } }, R("i", { className: "fa fa-spinner fa-spin" }));
    }
    render() {
        const style = { width: this.props.width, height: this.props.height };
        // Faded if loading
        if (this.state.dataLoading) {
            style.opacity = 0.5;
        }
        // If nothing to show, show grey
        if (!this.state.validDesign) {
            // Invalid. Show faded with background
            style.backgroundColor = "#E0E0E0";
            style.opacity = 0.35;
            // Set height to 1.6 ratio if not set so the control is visible
            if (!this.props.height && this.props.width) {
                style.height = this.props.width / 1.6;
            }
        }
        if (this.state.dataError) {
            return R("div", { className: "alert alert-danger" }, `Error loading data: ${this.state.dataError.message || this.state.dataError}`);
        }
        return R("div", { style }, this.state.validDesign
            ? this.props.chart.createViewElement({
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                design: this.state.validDesign,
                onDesignChange: this.props.onDesignChange,
                data: this.state.data,
                scope: this.props.scope,
                onScopeChange: this.props.onScopeChange,
                width: this.props.width,
                height: this.props.height,
                onRowClick: this.props.onRowClick,
                filters: this.props.filters
            })
            : undefined, this.state.dataLoading ? this.renderSpinner() : undefined);
    }
}
exports.default = ChartViewComponent;
