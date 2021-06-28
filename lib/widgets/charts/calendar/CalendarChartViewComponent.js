"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let CalendarChartViewComponent;
const jquery_1 = __importDefault(require("jquery"));
const prop_types_1 = __importDefault(require("prop-types"));
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const moment_1 = __importDefault(require("moment"));
const AxisBuilder_1 = __importDefault(require("../../../axes/AxisBuilder"));
const d3_1 = __importDefault(require("d3"));
// Require d3-tip to use it
const d3_tip_1 = __importDefault(require("d3-tip"));
// creates a d3 calendar visualization
exports.default = CalendarChartViewComponent = (function () {
    CalendarChartViewComponent = class CalendarChartViewComponent extends react_1.default.Component {
        static initClass() {
            this.propTypes = {
                design: prop_types_1.default.object.isRequired,
                data: prop_types_1.default.array.isRequired,
                schema: prop_types_1.default.object.isRequired,
                width: prop_types_1.default.number,
                height: prop_types_1.default.number,
                scope: prop_types_1.default.any,
                onScopeChange: prop_types_1.default.func,
                monthsStrokeColor: prop_types_1.default.string,
                monthsStrokeWidth: prop_types_1.default.number,
                cellColor: prop_types_1.default.string,
                cellStrokeColor: prop_types_1.default.string,
                highlightCellFillColor: prop_types_1.default.string
            };
            this.defaultProps = {
                monthsStrokeColor: "#222",
                monthsStrokeWidth: 1,
                cellColor: "#FDAE61",
                highlightCellFillColor: "#000000"
            };
            this.contextTypes = { locale: prop_types_1.default.string };
            //the fill color for highlighted cell
        }
        constructor(props) {
            super(props);
            this.axisBuilder = new AxisBuilder_1.default({ schema: props.schema }); // e.g. "en"
        }
        shouldComponentUpdate(prevProps) {
            return !lodash_1.default.isEqual(lodash_1.default.omit(prevProps, "onScopeChange"), lodash_1.default.omit(this.props, "onScopeChange"));
        }
        getCellSize() {
            // ((total width) - (total required month stroke) - (left and right padding) - (space for year text) ) / weeks in year
            const cellSizeForWidth = (this.props.width - this.props.monthsStrokeWidth * 2 - 26) / 53;
            const years = this.getYears();
            // ((total height) - (total cell stroke) - (total required month stroke) - ( total required padding)) / (total year * 7)
            let remainingSpace = this.props.height - years.length * 7 - this.props.monthsStrokeWidth * 2 * years.length;
            if (this.props.design.titleText) {
                remainingSpace = remainingSpace - jquery_1.default(this.title).outerHeight();
            }
            const cellSizeForHeight = remainingSpace / (years.length * 7);
            return Math.min(cellSizeForHeight, cellSizeForWidth);
        }
        getYears() {
            let years = lodash_1.default.map(this.props.data, (entry) => {
                return new Date(entry.date).getFullYear();
            });
            years = lodash_1.default.uniq(years, true);
            // Filter extraneous dates
            years = lodash_1.default.filter(years, (y) => y > 1970 && y < 2050);
            // Take only max of 10 years to display
            years = lodash_1.default.take(years, 10);
            return years;
        }
        // @todo: detect outliers/ implement data points threshold
        componentDidMount() {
            return this.redraw();
        }
        componentDidUpdate(prevProps) {
            return this.redraw();
        }
        handleCellClick(cell, data) {
            var _a, _b, _c, _d, _e;
            if (((_a = this.props.scope) === null || _a === void 0 ? void 0 : _a.data) === data) {
                (_c = (_b = this.props).onScopeChange) === null || _c === void 0 ? void 0 : _c.call(_b, null);
                return;
            }
            const scopeData = {
                name: this.axisBuilder.summarizeAxis(this.props.design.dateAxis, this.context.locale) +
                    " is " +
                    this.axisBuilder.formatValue(this.props.design.dateAxis, data, this.context.locale),
                filter: {
                    jsonql: this.axisBuilder.createValueFilter(this.props.design.dateAxis, data),
                    table: this.props.design.table
                },
                filterExpr: this.axisBuilder.createValueFilterExpr(this.props.design.dateAxis, data),
                data
            };
            return (_e = (_d = this.props).onScopeChange) === null || _e === void 0 ? void 0 : _e.call(_d, scopeData);
        }
        // Redraw component
        redraw() {
            this.reloading = true;
            const container = this.chart_container;
            container.innerHTML = "";
            const cellSize = this.getCellSize();
            const height = Math.ceil(cellSize * 7) + 7;
            const format = d3_1.default.timeFormat("%Y-%m-%d");
            const percent = d3_1.default.format(".1%");
            const cellStroke = this.props.cellStrokeColor || this.props.cellColor;
            const self = this;
            const rgb = d3_1.default.rgb(this.props.cellColor);
            const years = this.getYears();
            // Don't draw if no years
            if (years.length === 0) {
                return;
            }
            const data = d3_1.default
                .nest()
                .key((d) => d.date)
                .rollup((d) => d[0].value)
                .map(this.props.data, d3_1.default.map);
            const tip = d3_tip_1.default()
                .attr("class", "d3-tip")
                .html(function (d) {
                const _date = moment_1.default(d);
                let title = "<p>" + _date.format("LL") + "</p>";
                title += "<p>" + (data.has(d) ? data.get(d) : 0 + "<p>");
                return title;
            });
            const color = d3_1.default
                .scaleQuantize()
                .domain([1, d3_1.default.max(data.values())])
                .range(d3_1.default.range(10).map((d) => rgb.darker(d * 0.1).toString()));
            const yearGroupTranslateX = (this.props.width - cellSize * 53 - 16) / 2 + 16;
            const svg = d3_1.default
                .select(container)
                .selectAll("svg")
                .data(years)
                .enter()
                .append("svg")
                .attr("width", this.props.width)
                .attr("height", height)
                .attr("class", "calendar-chart-year")
                .append("g")
                .attr("transform", "translate(" + yearGroupTranslateX + ",0)");
            svg.call(tip);
            svg
                .append("text")
                .text((d, i) => d)
                .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
                .attr("font-size", function (d) {
                return Math.min(14, ((cellSize * 7) / this.getComputedTextLength()) * 14) + "px";
            })
                .style("text-anchor", "middle");
            const _this = this;
            const rect = svg
                .selectAll(".calendar-chart-day")
                .data((d) => d3_1.default.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)))
                .enter()
                .append("rect")
                .attr("class", "calendar-chart-day")
                .attr("fill", "#fff")
                .attr("stroke", cellStroke)
                .attr("stroke-width", this.props.monthsStrokeWidth)
                .attr("width", cellSize)
                .attr("height", cellSize)
                .attr("x", (d) => d3_1.default.timeWeek.count(d3_1.default.timeYear(d), d) * cellSize)
                .attr("y", (d) => d.getDay() * cellSize)
                .on("mouseenter", function (d, i) {
                if (!_this.reloading) {
                    return tip.show(d, i, this);
                }
            })
                .on("mouseleave", tip.hide)
                .datum(format);
            rect.on("click", function (e) {
                tip.hide();
                // tip.destroy()
                const selectedRect = d3_1.default.select(this);
                return self.handleCellClick(selectedRect, e);
            });
            rect
                .filter((d) => data.has(d))
                .attr("fill", (d) => {
                var _a;
                const _color = color(data.get(d));
                if (((_a = this.props.scope) === null || _a === void 0 ? void 0 : _a.data) === d) {
                    return this.props.highlightCellFillColor;
                }
                return _color;
            });
            function monthPath(t0) {
                const t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0);
                const d0 = t0.getDay();
                const w0 = d3_1.default.timeWeek.count(d3_1.default.timeYear(t0), t0);
                const d1 = t1.getDay();
                const w1 = d3_1.default.timeWeek.count(d3_1.default.timeYear(t1), t1);
                return ("M" +
                    (w0 + 1) * cellSize +
                    "," +
                    d0 * cellSize +
                    "H" +
                    w0 * cellSize +
                    "V" +
                    7 * cellSize +
                    "H" +
                    w1 * cellSize +
                    "V" +
                    (d1 + 1) * cellSize +
                    "H" +
                    (w1 + 1) * cellSize +
                    "V" +
                    0 +
                    "H" +
                    (w0 + 1) * cellSize +
                    "Z");
            }
            svg
                .selectAll(".calendar-chart-month")
                .data((d) => d3_1.default.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)))
                .enter()
                .append("path")
                .attr("fill", "none")
                .attr("class", "calendar-chart-month")
                .attr("stroke", this.props.monthsStrokeColor)
                .attr("stroke-width", this.props.monthsStrokeWidth)
                .attr("d", monthPath);
            this.reloading = false;
        }
        render() {
            const titleStyle = {
                textAlign: "center",
                fontSize: "14px",
                fontWeight: "bold",
                margin: 0
            };
            const style = {
                width: this.props.width,
                height: this.props.height,
                shapeRendering: "crispEdges",
                lineHeight: 1
            };
            const title = this.props.design.titleText;
            return R("div", { style }, title
                ? R("p", {
                    style: titleStyle,
                    ref: (c) => {
                        return (this.title = c);
                    }
                }, title)
                : undefined, R("div", {
                ref: (c) => {
                    return (this.chart_container = c);
                }
            }));
        }
    };
    CalendarChartViewComponent.initClass();
    return CalendarChartViewComponent;
})();
