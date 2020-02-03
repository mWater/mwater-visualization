"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var $, AxisBuilder, CalendarChartViewComponent, ExprUtils, PropTypes, R, React, _, d3, d3Format, d3Tip, moment;

$ = require('jquery');
PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
moment = require('moment');
AxisBuilder = require('../../../axes/AxisBuilder');
ExprUtils = require('mwater-expressions').ExprUtils;
d3 = require('d3');
d3Format = require('d3-format'); // Require d3-tip to use it

d3Tip = require('d3-tip')["default"]; // creates a d3 calendar visualization

module.exports = CalendarChartViewComponent = function () {
  var CalendarChartViewComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(CalendarChartViewComponent, _React$Component);

    function CalendarChartViewComponent(props) {
      var _this2;

      (0, _classCallCheck2["default"])(this, CalendarChartViewComponent);
      _this2 = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(CalendarChartViewComponent).call(this, props));
      _this2.axisBuilder = new AxisBuilder({
        schema: props.schema
      });
      return _this2;
    }

    (0, _createClass2["default"])(CalendarChartViewComponent, [{
      key: "shouldComponentUpdate",
      value: function shouldComponentUpdate(prevProps) {
        return !_.isEqual(_.omit(prevProps, "onScopeChange"), _.omit(this.props, "onScopeChange"));
      }
    }, {
      key: "getCellSize",
      value: function getCellSize() {
        var cellSizeForHeight, cellSizeForWidth, remainingSpace, years; // ((total width) - (total required month stroke) - (left and right padding) - (space for year text) ) / weeks in year

        cellSizeForWidth = (this.props.width - this.props.monthsStrokeWidth * 2 - 26) / 53;
        years = this.getYears(); // ((total height) - (total cell stroke) - (total required month stroke) - ( total required padding)) / (total year * 7)

        remainingSpace = this.props.height - years.length * 7 - this.props.monthsStrokeWidth * 2 * years.length;

        if (this.props.design.titleText) {
          remainingSpace = remainingSpace - $(this.title).outerHeight();
        }

        cellSizeForHeight = remainingSpace / (years.length * 7);
        return Math.min(cellSizeForHeight, cellSizeForWidth);
      }
    }, {
      key: "getYears",
      value: function getYears() {
        var years;
        years = _.map(this.props.data, function (entry) {
          return new Date(entry.date).getFullYear();
        });
        years = _.uniq(years, true); // Filter extraneous dates

        years = _.filter(years, function (y) {
          return y > 1970 && y < 2050;
        }); // Take only max of 10 years to display

        years = _.take(years, 10);
        return years;
      } // @todo: detect outliers/ implement data points threshold

    }, {
      key: "componentDidMount",
      value: function componentDidMount() {
        return this.redraw();
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps) {
        return this.redraw();
      }
    }, {
      key: "handleCellClick",
      value: function handleCellClick(cell, data) {
        var base, base1, ref, scopeData;

        if (((ref = this.props.scope) != null ? ref.data : void 0) === data) {
          if (typeof (base = this.props).onScopeChange === "function") {
            base.onScopeChange(null);
          }

          return;
        }

        scopeData = {
          name: this.axisBuilder.summarizeAxis(this.props.design.dateAxis, this.context.locale) + " is " + this.axisBuilder.formatValue(this.props.design.dateAxis, data, this.context.locale),
          filter: {
            jsonql: this.axisBuilder.createValueFilter(this.props.design.dateAxis, data),
            table: this.props.design.table
          },
          data: data
        };
        return typeof (base1 = this.props).onScopeChange === "function" ? base1.onScopeChange(scopeData) : void 0;
      } // Redraw component

    }, {
      key: "redraw",
      value: function redraw() {
        var _this3 = this;

        var _this, cellSize, cellStroke, color, container, data, format, height, monthPath, percent, rect, rgb, self, svg, tip, yearGroupTranslateX, years;

        this.reloading = true;
        container = this.chart_container;
        container.innerHTML = '';
        cellSize = this.getCellSize();
        height = Math.ceil(cellSize * 7) + 7;
        format = d3.timeFormat("%Y-%m-%d");
        percent = d3.format(".1%");
        cellStroke = this.props.cellStrokeColor || this.props.cellColor;
        self = this;
        rgb = d3.rgb(this.props.cellColor);
        years = this.getYears(); // Don't draw if no years

        if (years.length === 0) {
          return;
        }

        data = d3.nest().key(function (d) {
          return d.date;
        }).rollup(function (d) {
          return d[0].value;
        }).map(this.props.data, d3.map);
        tip = d3Tip().attr('class', 'd3-tip').html(function (d) {
          var _date, title;

          _date = moment(d);
          title = '<p>' + _date.format('LL') + '</p>';
          title += '<p>' + (data.has(d) ? data.get(d) : 0 + '<p>');
          return title;
        });
        color = d3.scaleQuantize().domain([1, d3.max(data.values())]).range(d3.range(10).map(function (d) {
          return rgb.darker(d * 0.1).toString();
        }));
        yearGroupTranslateX = (this.props.width - cellSize * 53 - 16) / 2 + 16;
        svg = d3.select(container).selectAll("svg").data(years).enter().append("svg").attr("width", this.props.width).attr("height", height).attr("class", "calendar-chart-year").append("g").attr("transform", "translate(" + yearGroupTranslateX + ",0)");
        svg.call(tip);
        svg.append("text").text(function (d, i) {
          return d;
        }).attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)").attr("font-size", function (d) {
          return Math.min(14, cellSize * 7 / this.getComputedTextLength() * 14) + "px";
        }).style("text-anchor", "middle");
        _this = this;
        rect = svg.selectAll(".calendar-chart-day").data(function (d) {
          return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1));
        }).enter().append("rect").attr("class", "calendar-chart-day").attr("fill", "#fff").attr("stroke", cellStroke).attr("stroke-width", this.props.monthsStrokeWidth).attr("width", cellSize).attr("height", cellSize).attr("x", function (d) {
          return d3.timeWeek.count(d3.timeYear(d), d) * cellSize;
        }).attr("y", function (d) {
          return d.getDay() * cellSize;
        }).on("mouseenter", function (d, i) {
          if (!_this.reloading) {
            return tip.show(d, i, this);
          }
        }).on("mouseleave", tip.hide).datum(format);
        rect.on("click", function (e) {
          var selectedRect;
          tip.hide(); // tip.destroy()

          selectedRect = d3.select(this);
          return self.handleCellClick(selectedRect, e);
        });
        rect.filter(function (d) {
          return data.has(d);
        }).attr("fill", function (d) {
          var _color, ref;

          _color = color(data.get(d));

          if (((ref = _this3.props.scope) != null ? ref.data : void 0) === d) {
            return _this3.props.highlightCellFillColor;
          }

          return _color;
        });

        monthPath = function monthPath(t0) {
          var d0, d1, t1, w0, w1;
          t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0);
          d0 = t0.getDay();
          w0 = d3.timeWeek.count(d3.timeYear(t0), t0);
          d1 = t1.getDay();
          w1 = d3.timeWeek.count(d3.timeYear(t1), t1);
          return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize + "H" + w0 * cellSize + "V" + 7 * cellSize + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize + "H" + (w1 + 1) * cellSize + "V" + 0 + "H" + (w0 + 1) * cellSize + "Z";
        };

        svg.selectAll(".calendar-chart-month").data(function (d) {
          return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1));
        }).enter().append("path").attr("fill", "none").attr("class", "calendar-chart-month").attr("stroke", this.props.monthsStrokeColor).attr("stroke-width", this.props.monthsStrokeWidth).attr("d", monthPath);
        this.reloading = false;
      }
    }, {
      key: "render",
      value: function render() {
        var _this4 = this;

        var style, title, titleStyle;
        titleStyle = {
          textAlign: "center",
          fontSize: "14px",
          fontWeight: "bold",
          margin: 0
        };
        style = {
          width: this.props.width,
          height: this.props.height,
          shapeRendering: "crispEdges",
          lineHeight: 1
        };
        title = this.props.design.titleText;
        return R('div', {
          style: style
        }, title ? R('p', {
          style: titleStyle,
          ref: function ref(c) {
            return _this4.title = c;
          }
        }, title) : void 0, R('div', {
          ref: function ref(c) {
            return _this4.chart_container = c;
          }
        }));
      }
    }]);
    return CalendarChartViewComponent;
  }(React.Component);

  ;
  CalendarChartViewComponent.propTypes = {
    design: PropTypes.object.isRequired,
    // Design of chart
    data: PropTypes.array.isRequired,
    // Data that the chart has requested. In format [{ date: <YYYY-MM-DD>, value: <number value> }, { date: ... }...]
    schema: PropTypes.object.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    standardWidth: PropTypes.number,
    scope: PropTypes.any,
    // scope of the widget (when the widget self-selects a particular scope)
    onScopeChange: PropTypes.func,
    // called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
    monthsStrokeColor: PropTypes.string,
    monthsStrokeWidth: PropTypes.number,
    cellColor: PropTypes.string,
    //the day cell color
    cellStrokeColor: PropTypes.string,
    //the day cell stroke color
    highlightCellFillColor: PropTypes.string //the fill color for highlighted cell

  };
  CalendarChartViewComponent.defaultProps = {
    monthsStrokeColor: "#222",
    monthsStrokeWidth: 1,
    cellColor: "#FDAE61",
    highlightCellFillColor: "#000000"
  };
  CalendarChartViewComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return CalendarChartViewComponent;
}.call(void 0);