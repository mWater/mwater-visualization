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
const LayeredChartCompiler_1 = __importDefault(require("./LayeredChartCompiler"));
const TextComponent_1 = __importDefault(require("../../text/TextComponent"));
const d3 = __importStar(require("d3"));
const billboard_js_1 = __importDefault(require("billboard.js"));
// Displays a layered chart
class LayeredChartViewComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleHeaderChange = (header) => {
            this.props.onDesignChange(lodash_1.default.extend({}, this.props.design, { header }));
        };
        this.handleFooterChange = (footer) => {
            this.props.onDesignChange(lodash_1.default.extend({}, this.props.design, { footer }));
        };
        this.state = {
            headerHeight: null,
            footerHeight: null // Height of footer
        };
    }
    componentDidMount() {
        this.updateHeights();
    }
    componentDidUpdate(prevProps) {
        // Check props to prevent odd infinite loop https://reactjs.org/docs/error-decoder.html/?invariant=185
        if (this.props.design != prevProps.design ||
            this.props.height != prevProps.height ||
            this.props.width != prevProps.width) {
            console.log(`componentDidUpdate: ${this.props.height} vs ${prevProps.height} and ${this.props.width} vs ${prevProps.width}`);
            this.updateHeights();
        }
    }
    updateHeights() {
        // Calculate header and footer heights
        if (this.header && this.state.headerHeight !== this.header.offsetHeight) {
            console.log(`headerHeight: ${this.state.headerHeight} vs ${this.header.offsetHeight} => ${this.header.offsetHeight}`);
            this.setState({ headerHeight: this.header.offsetHeight });
        }
        if (this.footer && this.state.footerHeight !== this.footer.offsetHeight) {
            console.log(`footerHeight: ${this.state.footerHeight} vs ${this.footer.offsetHeight} => ${this.footer.offsetHeight}`);
            this.setState({ footerHeight: this.footer.offsetHeight });
        }
    }
    renderHeader() {
        return R("div", {
            ref: (c) => {
                return (this.header = c);
            }
        }, R(TextComponent_1.default, {
            design: this.props.design.header,
            onDesignChange: this.props.onDesignChange ? this.handleHeaderChange : undefined,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            exprValues: this.props.data.header || {},
            width: this.props.width
        }));
    }
    renderFooter() {
        return R("div", {
            ref: (c) => {
                return (this.footer = c);
            }
        }, R(TextComponent_1.default, {
            design: this.props.design.footer,
            onDesignChange: this.props.onDesignChange ? this.handleFooterChange : undefined,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            exprValues: this.props.data.footer || {},
            width: this.props.width
        }));
    }
    render() {
        return R("div", { style: { width: this.props.width, height: this.props.height } }, this.renderHeader(), this.state.headerHeight != null && this.state.footerHeight != null
            ? R(C3ChartComponent, {
                schema: this.props.schema,
                design: this.props.design,
                data: this.props.data,
                onDesignChange: this.props.onDesignChange,
                width: this.props.width,
                height: this.props.height - this.state.headerHeight - this.state.footerHeight,
                scope: this.props.scope,
                onScopeChange: this.props.onScopeChange,
                locale: this.context.locale
            })
            : undefined, this.renderFooter());
    }
}
exports.default = LayeredChartViewComponent;
LayeredChartViewComponent.contextTypes = { locale: prop_types_1.default.string };
// Displays the inner C3 component itself
class C3ChartComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.createChart = (props) => {
            if (this.chart) {
                this.chart.destroy();
            }
            const compiler = new LayeredChartCompiler_1.default({ schema: props.schema });
            const chartOptions = compiler.createChartOptions({
                design: this.props.design,
                data: this.props.data,
                width: this.props.width,
                height: this.props.height,
                locale: this.props.locale
            });
            chartOptions.bindto = this.chartDiv;
            chartOptions.data.onclick = this.handleDataClick;
            // Update scope after rendering. Needs a delay to make it happen
            chartOptions.onrendered = () => lodash_1.default.defer(this.updateScope);
            // const c3 = require("c3")
            // console.log(chartOptions)
            try {
                this.chart = billboard_js_1.default.generate(chartOptions);
            }
            catch (error) {
                throw (error);
            }
            console.log(this.chartDiv);
            // Remove listener for window focus (https://github.com/c3js/c3/issues/2742)
            window.removeEventListener("focus", this.chart.internal.windowFocusHandler);
            this.chart.internal.windowFocusHandler = () => { };
            window.addEventListener("focus", this.chart.internal.windowFocusHandler);
        };
        // if not _.isEqual(@props.data, nextProps.data)
        //   # # If length of data is different, re-create chart
        //   # if @props.data.main.length != nextProps.data.main.length
        //   @createChart(nextProps)
        //   return
        // # Reload data
        // @chart.load({
        //   json: @prepareData(nextProps.data).main
        //   keys: { x: "x", value: ["y"] }
        //   names: { y: 'Value' } # Name the data
        // })
        // Update scoped value
        this.updateScope = () => {
            const dataMap = this.getDataMap();
            const compiler = new LayeredChartCompiler_1.default({ schema: this.props.schema });
            const el = this.chartDiv;
            if (!this.props.design.transpose && this.props.design.popoutSmallValues) {
                const stacked = this.props.design.stacked;
                let barWidth = 20;
                const smalls = [];
                const map = new Map();
                let _id = 0;
                d3.select(el)
                    .selectAll(".bb-chart-bar .bb-bar")
                    .each(function (p, i) {
                    if (!map.has(p.id)) {
                        map.set(p.id, _id++);
                    }
                    const box = d3.select(this).nodes()[0].getBBox();
                    barWidth = box.width;
                    if (box.height < 12) {
                        d3.select(el)
                            .selectAll(".bb-chart-text .bb-text")
                            .filter(function (p, j) { return i === j; })
                            .each(function (_p) {
                            smalls.push({
                                origin_x: box.x,
                                origin_y: box.y,
                                series: map.get(p.id),
                                textY: box.y - (12 * map.get(p.id)) - 10,
                                textX: box.x + 25,
                            });
                            d3.select(this).node().classList.add("needs_adjustment");
                        })
                            .attr('data-boxX', box.x)
                            .attr('y', function () {
                            return box.y - (12 * map.get(p.id)) - 10;
                            // return Number(d3.select(this).attr('y')) - 7
                        });
                    }
                });
                if (smalls.length > 0) {
                    const sliceWidth = 4;
                    const seriesToBeDrawn = lodash_1.default.uniq(smalls.map((s) => s.series)).length;
                    d3.select(el)
                        .selectAll(".needs_adjustment")
                        .attr('x', function () {
                        const self = d3.select(this);
                        return Number(self.attr('data-boxX')) + ((seriesToBeDrawn) * sliceWidth) + 10;
                    })
                        .attr('text-anchor', 'left');
                    const hackGroup = d3.select(el)
                        .selectAll(".bb-chart")
                        .selectAll(".popout_labels")
                        .data(["1"])
                        .enter()
                        .append('g')
                        .attr('class', 'popout_labels');
                    hackGroup
                        .selectAll('line')
                        .data(smalls)
                        .enter()
                        .append('line')
                        .attr('x1', function (d) { return stacked ? d.origin_x + (sliceWidth * (seriesToBeDrawn - d.series)) : d.origin_x + 5; })
                        .attr('y1', function (d) { return d.origin_y; })
                        .attr('x2', function (d) { return stacked ? d.origin_x + (sliceWidth * (seriesToBeDrawn - d.series)) : d.origin_x + 5; })
                        .attr('y2', function (d) { return d.textY + 3; })
                        .attr('shape-rendering', 'crispEdges')
                        .style("stroke", "black")
                        .style("stroke-width", 0.5)
                        .exit()
                        .data(smalls)
                        .enter()
                        .append('line')
                        .attr('x1', function (d) { return stacked ? d.origin_x + (sliceWidth * (seriesToBeDrawn - d.series)) : d.origin_x + 5; })
                        .attr('y1', function (d) { return d.textY + 3; })
                        .attr('x2', function (d) { return d.origin_x + ((seriesToBeDrawn) * sliceWidth) + 8; })
                        .attr('y2', function (d) { return d.textY; })
                        .attr('shape-rendering', 'crispEdges')
                        .style("stroke", "black")
                        .style("stroke-width", 0.5)
                        .exit();
                }
            }
            // Handle line and bar charts
            d3.select(el)
                .selectAll(".bb-chart-bar .bb-bar, .bb-chart-line .bb-circle")
                // Highlight only scoped
                .style("opacity", (d, i) => {
                let scope;
                const dataPoint = this.lookupDataPoint(dataMap, d);
                if (dataPoint) {
                    scope = compiler.createScope(this.props.design, dataPoint.layerIndex, dataPoint.row, this.props.locale);
                }
                // Determine if scoped
                if (scope && this.props.scope) {
                    if (lodash_1.default.isEqual(this.props.scope.data, scope.data)) {
                        return 1;
                    }
                    else {
                        return 0.3;
                    }
                }
                else {
                    // Not scoped
                    if ((dataPoint === null || dataPoint === void 0 ? void 0 : dataPoint.row.y) !== null) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
                }
            });
            // Handle pie charts
            return d3
                .select(el)
                .selectAll(".bb-chart-arcs .bb-chart-arc")
                .style("opacity", (d, i) => {
                let scope;
                const dataPoint = this.lookupDataPoint(dataMap, d);
                if (dataPoint) {
                    scope = compiler.createScope(this.props.design, dataPoint.layerIndex, dataPoint.row, this.props.locale || "en");
                }
                // Determine if scoped
                if (this.props.scope && scope) {
                    if (lodash_1.default.isEqual(this.props.scope.data, scope.data)) {
                        return 1;
                    }
                    else {
                        return 0.3;
                    }
                }
                else {
                    // Not scoped
                    return 1;
                }
            });
        };
        this.handleDataClick = (d) => {
            var _a, _b, _c, _d;
            // Get data map
            const dataMap = this.getDataMap();
            // Look up data point
            const dataPoint = this.lookupDataPoint(dataMap, d);
            if (!dataPoint) {
                return;
            }
            // Create scope
            const compiler = new LayeredChartCompiler_1.default({ schema: this.props.schema });
            const scope = compiler.createScope(this.props.design, dataPoint.layerIndex, dataPoint.row, this.props.locale || "en");
            // If same scope data, remove scope
            if (this.props.scope && lodash_1.default.isEqual(scope.data, this.props.scope.data)) {
                (_b = (_a = this.props).onScopeChange) === null || _b === void 0 ? void 0 : _b.call(_a, null);
                return;
            }
            return (_d = (_c = this.props).onScopeChange) === null || _d === void 0 ? void 0 : _d.call(_c, scope);
        };
        // Create throttled createChart
        this.throttledCreateChart = lodash_1.default.throttle(this.createChart, 1000);
    }
    componentDidMount() {
        this.createChart(this.props);
        return this.updateScope();
    }
    componentDidUpdate(prevProps, prevState) {
        // Check if schema, data or design (except for header + footer) changed
        let changed = false;
        changed = changed || prevProps.schema !== this.props.schema;
        changed = changed || !lodash_1.default.isEqual(prevProps.data, this.props.data);
        changed = changed || prevProps.locale !== this.props.locale;
        changed =
            changed ||
                (prevProps.design !== this.props.design &&
                    !lodash_1.default.isEqual(lodash_1.default.omit(prevProps.design, "header", "footer"), lodash_1.default.omit(this.props.design, "header", "footer")));
        if (changed) {
            const newCompiler = new LayeredChartCompiler_1.default({ schema: this.props.schema });
            const newChartOptions = newCompiler.createChartOptions({
                design: this.props.design,
                data: this.props.data,
                width: this.props.width,
                height: this.props.height,
                locale: this.props.locale
            });
            // TODO check if only data changed
            // Use throttled update to bypass https://github.com/mWater/mwater-visualization/issues/92
            return this.throttledCreateChart(this.props);
            // Check if size alone changed
        }
        else if (this.props.width !== prevProps.width || this.props.height !== prevProps.height) {
            this.chart.resize({ width: this.props.width, height: this.props.height });
            this.updateScope();
            return;
            // Check scope
        }
        else if (!lodash_1.default.isEqual(this.props.scope, prevProps.scope)) {
            return this.updateScope();
        }
    }
    // Gets a data point { layerIndex, row } from a d3 object (d)
    lookupDataPoint(dataMap, d) {
        let dataPoint;
        if (d.data) {
            d = d.data;
        }
        // Lookup layer and row. If pie/donut, index is always zero
        const isPolarChart = ["pie", "donut"].includes(this.props.design.type);
        if (isPolarChart) {
            dataPoint = dataMap[`${d.id}`];
        }
        else {
            dataPoint = dataMap[`${d.id}:${d.index}`];
        }
        return dataPoint;
    }
    getDataMap() {
        // Get data map
        const compiler = new LayeredChartCompiler_1.default({ schema: this.props.schema });
        return compiler.createDataMap(this.props.design, this.props.data);
    }
    componentWillUnmount() {
        if (this.chart) {
            return this.chart.destroy();
        }
    }
    render() {
        // # Don't grow fonts as it causes overlap TODO remove
        // scale = Math.min(scale, 1)
        // css = ".c3 svg { font-size: #{scale * 10}px; }\n"
        // css += ".c3-legend-item { font-size: #{scale * 12}px; }\n"
        // css += ".c3-chart-arc text { font-size: #{scale * 13}px; }\n"
        // css += ".c3-title { font-size: #{scale * 14}px; }\n"
        return R("div", {
            ref: (c) => {
                return (this.chartDiv = c);
            }
        });
    }
}
