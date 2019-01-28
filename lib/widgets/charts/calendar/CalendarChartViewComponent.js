var $, AxisBuilder, CalendarChartViewComponent, ExprUtils, PropTypes, R, React, _, d3, d3Format, d3Tip, moment,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

moment = require('moment');

AxisBuilder = require('../../../axes/AxisBuilder');

ExprUtils = require('mwater-expressions').ExprUtils;

d3 = require('d3');

d3Format = require('d3-format');

d3Tip = require('d3-tip')["default"];

module.exports = CalendarChartViewComponent = (function(superClass) {
  extend(CalendarChartViewComponent, superClass);

  CalendarChartViewComponent.propTypes = {
    design: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired,
    schema: PropTypes.object.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    standardWidth: PropTypes.number,
    scope: PropTypes.any,
    onScopeChange: PropTypes.func,
    monthsStrokeColor: PropTypes.string,
    monthsStrokeWidth: PropTypes.number,
    cellColor: PropTypes.string,
    cellStrokeColor: PropTypes.string,
    highlightCellFillColor: PropTypes.string
  };

  function CalendarChartViewComponent(props) {
    CalendarChartViewComponent.__super__.constructor.call(this, props);
    this.axisBuilder = new AxisBuilder({
      schema: props.schema
    });
  }

  CalendarChartViewComponent.defaultProps = {
    monthsStrokeColor: "#222",
    monthsStrokeWidth: 1,
    cellColor: "#FDAE61",
    highlightCellFillColor: "#000000"
  };

  CalendarChartViewComponent.contextTypes = {
    locale: PropTypes.string
  };

  CalendarChartViewComponent.prototype.shouldComponentUpdate = function(prevProps) {
    return !_.isEqual(prevProps, this.props);
  };

  CalendarChartViewComponent.prototype.getCellSize = function() {
    var cellSizeForHeight, cellSizeForWidth, remainingSpace, years;
    cellSizeForWidth = (this.props.width - this.props.monthsStrokeWidth * 2 - 26) / 53;
    years = this.getYears();
    remainingSpace = this.props.height - years.length * 7 - this.props.monthsStrokeWidth * 2 * years.length;
    if (this.props.design.titleText) {
      remainingSpace = remainingSpace - $(this.title).outerHeight();
    }
    cellSizeForHeight = remainingSpace / (years.length * 7);
    return Math.min(cellSizeForHeight, cellSizeForWidth);
  };

  CalendarChartViewComponent.prototype.getYears = function() {
    var years;
    years = _.map(this.props.data, (function(_this) {
      return function(entry) {
        return (new Date(entry.date)).getFullYear();
      };
    })(this));
    years = _.uniq(years, true);
    years = _.filter(years, function(y) {
      return y > 1970 && y < 2050;
    });
    years = _.take(years, 10);
    return years;
  };

  CalendarChartViewComponent.prototype.componentDidMount = function() {
    return this.redraw();
  };

  CalendarChartViewComponent.prototype.componentDidUpdate = function(prevProps) {
    return this.redraw();
  };

  CalendarChartViewComponent.prototype.handleCellClick = function(cell, data) {
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
  };

  CalendarChartViewComponent.prototype.redraw = function() {
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
    years = this.getYears();
    if (years.length === 0) {
      return;
    }
    data = d3.nest().key(function(d) {
      return d.date;
    }).rollup(function(d) {
      return d[0].value;
    }).map(this.props.data, d3.map);
    tip = d3Tip().attr('class', 'd3-tip').html(function(d) {
      var _date, title;
      _date = moment(d);
      title = '<p>' + _date.format('LL') + '</p>';
      title += '<p>' + (data.has(d) ? data.get(d) : 0 + '<p>');
      return title;
    });
    color = d3.scaleQuantize().domain([1, d3.max(data.values())]).range(d3.range(10).map(function(d) {
      return rgb.darker(d * 0.1).toString();
    }));
    yearGroupTranslateX = (this.props.width - cellSize * 53 - 16) / 2 + 16;
    svg = d3.select(container).selectAll("svg").data(years).enter().append("svg").attr("width", this.props.width).attr("height", height).attr("class", "calendar-chart-year").append("g").attr("transform", "translate(" + yearGroupTranslateX + ",0)");
    svg.call(tip);
    svg.append("text").text(function(d, i) {
      return d;
    }).attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)").attr("font-size", function(d) {
      return Math.min(14, (cellSize * 7) / this.getComputedTextLength() * 14) + "px";
    }).style("text-anchor", "middle");
    _this = this;
    rect = svg.selectAll(".calendar-chart-day").data(function(d) {
      return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1));
    }).enter().append("rect").attr("class", "calendar-chart-day").attr("fill", "#fff").attr("stroke", cellStroke).attr("stroke-width", this.props.monthsStrokeWidth).attr("width", cellSize).attr("height", cellSize).attr("x", function(d) {
      return d3.timeWeek.count(d3.timeYear(d), d) * cellSize;
    }).attr("y", function(d) {
      return d.getDay() * cellSize;
    }).on("mouseenter", function(d, i) {
      if (!_this.reloading) {
        return tip.show(d, i, this);
      }
    }).on("mouseleave", tip.hide).datum(format);
    rect.on("click", function(e) {
      var selectedRect;
      tip.hide();
      selectedRect = d3.select(this);
      return self.handleCellClick(selectedRect, e);
    });
    rect.filter(function(d) {
      return data.has(d);
    }).attr("fill", (function(_this) {
      return function(d) {
        var _color, ref;
        _color = color(data.get(d));
        if (((ref = _this.props.scope) != null ? ref.data : void 0) === d) {
          return _this.props.highlightCellFillColor;
        }
        return _color;
      };
    })(this));
    monthPath = function(t0) {
      var d0, d1, t1, w0, w1;
      t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0);
      d0 = t0.getDay();
      w0 = d3.timeWeek.count(d3.timeYear(t0), t0);
      d1 = t1.getDay();
      w1 = d3.timeWeek.count(d3.timeYear(t1), t1);
      return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize + "H" + w0 * cellSize + "V" + 7 * cellSize + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize + "H" + (w1 + 1) * cellSize + "V" + 0 + "H" + (w0 + 1) * cellSize + "Z";
    };
    svg.selectAll(".calendar-chart-month").data(function(d) {
      return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1));
    }).enter().append("path").attr("fill", "none").attr("class", "calendar-chart-month").attr("stroke", this.props.monthsStrokeColor).attr("stroke-width", this.props.monthsStrokeWidth).attr("d", monthPath);
    this.reloading = false;
  };

  CalendarChartViewComponent.prototype.render = function() {
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
      ref: (function(_this) {
        return function(c) {
          return _this.title = c;
        };
      })(this)
    }, title) : void 0, R('div', {
      ref: (function(_this) {
        return function(c) {
          return _this.chart_container = c;
        };
      })(this)
    }));
  };

  return CalendarChartViewComponent;

})(React.Component);
