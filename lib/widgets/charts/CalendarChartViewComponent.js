var AxisBuilder, CalendarChartViewComponent, H, React, _, moment,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

moment = require('moment');

AxisBuilder = require('../../axes/AxisBuilder');

require('d3-tip')(d3);

module.exports = CalendarChartViewComponent = (function(superClass) {
  extend(CalendarChartViewComponent, superClass);

  function CalendarChartViewComponent() {
    return CalendarChartViewComponent.__super__.constructor.apply(this, arguments);
  }

  CalendarChartViewComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    data: React.PropTypes.array.isRequired,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    standardWidth: React.PropTypes.number,
    scope: React.PropTypes.any,
    onScopeChange: React.PropTypes.func,
    monthsStrokeColor: React.PropTypes.string,
    monthsStrokeWidth: React.PropTypes.number,
    cellColor: React.PropTypes.string,
    cellStrokeColor: React.PropTypes.string
  };

  CalendarChartViewComponent.defaultProps = {
    monthsStrokeColor: "#222",
    monthsStrokeWidth: 1,
    cellColor: "#FDAE61"
  };

  CalendarChartViewComponent.contextTypes = {
    locale: React.PropTypes.string
  };

  CalendarChartViewComponent.prototype.shouldComponentUpdate = function(prevProps) {
    return !_.isEqual(prevProps, this.props);
  };

  CalendarChartViewComponent.prototype.getCellSize = function() {
    var cellSizeForHeight, cellSizeForWidth, years;
    cellSizeForWidth = Math.floor((this.props.width - this.props.monthsStrokeWidth * 2 - 26) / 53);
    years = this.getYears();
    cellSizeForHeight = Math.floor((this.props.height - this.props.monthsStrokeWidth * 2 * years.length - (years.length + 1) * 5) / (years.length * 7));
    return Math.min(cellSizeForHeight, cellSizeForWidth);
  };

  CalendarChartViewComponent.prototype.getYears = function() {
    var years;
    years = _.map(this.props.data, (function(_this) {
      return function(entry) {
        return (new Date(entry.date)).getFullYear();
      };
    })(this));
    return _.uniq(years, true);
  };

  CalendarChartViewComponent.prototype.componentDidMount = function() {
    return this.redraw();
  };

  CalendarChartViewComponent.prototype.componentDidUpdate = function(prevProps) {
    return this.redraw();
  };

  CalendarChartViewComponent.prototype.redraw = function() {
    var cellSize, cellStroke, color, container, data, format, height, monthPath, percent, rect, rgb, svg, tip, yearGroupTranslateX, years;
    container = this.refs.chart_container;
    container.innerHTML = '';
    cellSize = this.getCellSize();
    height = cellSize * 7 + 10;
    format = d3.time.format("%Y-%m-%d");
    percent = d3.format(".1%");
    cellStroke = this.props.cellStrokeColor || this.props.cellColor;
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
    tip = d3.tip().attr('class', 'd3-tip').html(function(d) {
      var _date, title;
      _date = moment(d);
      title = '<p>' + _date.format('LL') + '</p>';
      title += '<p>' + (data.has(d) ? data.get(d) : 0 + '<p>');
      return title;
    });
    color = d3.scale.quantize().domain([1, d3.max(data.values())]).range(d3.range(10).map(function(d) {
      return rgb.darker(d * 0.1).toString();
    }));
    yearGroupTranslateX = (this.props.width - cellSize * 53 - 16) / 2 + 16;
    svg = d3.select(container).selectAll("svg").data(years).enter().append("svg").attr("width", this.props.width).attr("height", height).attr("class", "calendar-chart-year").append("g").attr("transform", "translate(" + yearGroupTranslateX + ",5)");
    svg.call(tip);
    svg.append("text").attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)").style("text-anchor", "middle").text(function(d, i) {
      return d;
    });
    rect = svg.selectAll(".calendar-chart-day").data(function(d) {
      return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));
    }).enter().append("rect").attr("class", "calendar-chart-day").attr("fill", "#fff").attr("stroke", cellStroke).attr("stroke-width", this.props.monthsStrokeWidth).attr("width", cellSize).attr("height", cellSize).attr("x", function(d) {
      return d3.time.weekOfYear(d) * cellSize;
    }).attr("y", function(d) {
      return d.getDay() * cellSize;
    }).on("mouseenter", tip.show).on("mouseleave", tip.hide).datum(format);
    rect.filter(function(d) {
      return data.has(d);
    }).attr("fill", function(d) {
      return color(data.get(d));
    });
    monthPath = function(t0) {
      var d0, d1, t1, w0, w1;
      t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0);
      d0 = t0.getDay();
      w0 = d3.time.weekOfYear(t0);
      d1 = t1.getDay();
      w1 = d3.time.weekOfYear(t1);
      return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize + "H" + w0 * cellSize + "V" + 7 * cellSize + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize + "H" + (w1 + 1) * cellSize + "V" + 0 + "H" + (w0 + 1) * cellSize + "Z";
    };
    svg.selectAll(".calendar-chart-month").data(function(d) {
      return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1));
    }).enter().append("path").attr("fill", "none").attr("class", "calendar-chart-month").attr("stroke", this.props.monthsStrokeColor).attr("stroke-width", this.props.monthsStrokeWidth).attr("d", monthPath);
  };

  CalendarChartViewComponent.prototype.render = function() {
    var style, title, titleStyle;
    titleStyle = {
      textAlign: "center",
      fontSize: "14px",
      fontWeight: "bold"
    };
    style = {
      justifyContent: "center",
      width: this.props.width,
      height: this.props.height,
      shapeRendering: "crispEdges"
    };
    title = this.props.design.titleText;
    return H.div({
      style: style
    }, title ? H.p({
      style: titleStyle
    }, title) : void 0, H.div({
      ref: "chart_container"
    }));
  };

  return CalendarChartViewComponent;

})(React.Component);
