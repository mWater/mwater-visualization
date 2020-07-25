"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var C3ChartComponent,
    ExprUtils,
    LayeredChartCompiler,
    LayeredChartViewComponent,
    PropTypes,
    R,
    React,
    ReactDOM,
    TextComponent,
    _,
    d3,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
ReactDOM = require('react-dom');
R = React.createElement;
ExprUtils = require('mwater-expressions').ExprUtils;
LayeredChartCompiler = require('./LayeredChartCompiler');
TextComponent = require('../../text/TextComponent');
d3 = require('d3'); // Displays a layered chart

module.exports = LayeredChartViewComponent = function () {
  var LayeredChartViewComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(LayeredChartViewComponent, _React$Component);

    var _super = _createSuper(LayeredChartViewComponent);

    function LayeredChartViewComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, LayeredChartViewComponent);
      _this = _super.call(this, props);
      _this.handleHeaderChange = _this.handleHeaderChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleFooterChange = _this.handleFooterChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        headerHeight: null,
        // Height of header 
        footerHeight: null // Height of footer

      };
      return _this;
    }

    (0, _createClass2["default"])(LayeredChartViewComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        return this.updateHeights();
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate() {
        return this.updateHeights();
      }
    }, {
      key: "updateHeights",
      value: function updateHeights() {
        // Calculate header and footer heights
        if (this.header && this.state.headerHeight !== this.header.offsetHeight) {
          this.setState({
            headerHeight: this.header.offsetHeight
          });
        }

        if (this.footer && this.state.footerHeight !== this.footer.offsetHeight) {
          return this.setState({
            footerHeight: this.footer.offsetHeight
          });
        }
      }
    }, {
      key: "handleHeaderChange",
      value: function handleHeaderChange(header) {
        boundMethodCheck(this, LayeredChartViewComponent);
        return this.props.onDesignChange(_.extend({}, this.props.design, {
          header: header
        }));
      }
    }, {
      key: "handleFooterChange",
      value: function handleFooterChange(footer) {
        boundMethodCheck(this, LayeredChartViewComponent);
        return this.props.onDesignChange(_.extend({}, this.props.design, {
          footer: footer
        }));
      }
    }, {
      key: "renderHeader",
      value: function renderHeader() {
        var _this2 = this;

        return R('div', {
          ref: function ref(c) {
            return _this2.header = c;
          }
        }, R(TextComponent, {
          design: this.props.design.header,
          onDesignChange: this.props.onDesignChange ? this.handleHeaderChange : void 0,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          exprValues: this.props.data.header || {},
          width: this.props.width,
          standardWidth: this.props.standardWidth
        }));
      }
    }, {
      key: "renderFooter",
      value: function renderFooter() {
        var _this3 = this;

        return R('div', {
          ref: function ref(c) {
            return _this3.footer = c;
          }
        }, R(TextComponent, {
          design: this.props.design.footer,
          onDesignChange: this.props.onDesignChange ? this.handleFooterChange : void 0,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          exprValues: this.props.data.footer || {},
          width: this.props.width,
          standardWidth: this.props.standardWidth
        }));
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', {
          style: {
            width: this.props.width,
            height: this.props.height
          }
        }, this.renderHeader(), this.state.headerHeight != null && this.state.footerHeight != null ? R(C3ChartComponent, {
          schema: this.props.schema,
          design: this.props.design,
          data: this.props.data,
          onDesignChange: this.props.onDesignChange,
          width: this.props.width,
          height: this.props.height - this.state.headerHeight - this.state.footerHeight,
          standardWidth: this.props.standardWidth,
          scope: this.props.scope,
          onScopeChange: this.props.onScopeChange,
          locale: this.context.locale
        }) : void 0, this.renderFooter());
      }
    }]);
    return LayeredChartViewComponent;
  }(React.Component);

  ;
  LayeredChartViewComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    standardWidth: PropTypes.number.isRequired,
    scope: PropTypes.any,
    // scope of the widget (when the widget self-selects a particular scope)
    onScopeChange: PropTypes.func // called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

  };
  LayeredChartViewComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return LayeredChartViewComponent;
}.call(void 0);

C3ChartComponent = function () {
  // Displays the inner C3 component itself
  var C3ChartComponent = /*#__PURE__*/function (_React$Component2) {
    (0, _inherits2["default"])(C3ChartComponent, _React$Component2);

    var _super2 = _createSuper(C3ChartComponent);

    function C3ChartComponent(props) {
      var _this4;

      (0, _classCallCheck2["default"])(this, C3ChartComponent);
      _this4 = _super2.call(this, props);
      _this4.createChart = _this4.createChart.bind((0, _assertThisInitialized2["default"])(_this4)); // if not _.isEqual(@props.data, nextProps.data)
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

      _this4.updateScope = _this4.updateScope.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleDataClick = _this4.handleDataClick.bind((0, _assertThisInitialized2["default"])(_this4)); // Create throttled createChart

      _this4.throttledCreateChart = _.throttle(_this4.createChart, 1000);
      return _this4;
    }

    (0, _createClass2["default"])(C3ChartComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        this.createChart(this.props);
        return this.updateScope();
      }
    }, {
      key: "createChart",
      value: function createChart(props) {
        var _this5 = this;

        var c3, chartOptions, compiler;
        boundMethodCheck(this, C3ChartComponent);

        if (this.chart) {
          this.chart.destroy();
        }

        compiler = new LayeredChartCompiler({
          schema: props.schema
        });
        chartOptions = compiler.createChartOptions({
          design: this.props.design,
          data: this.props.data,
          width: this.props.width,
          height: this.props.height,
          locale: this.props.locale
        });
        chartOptions.bindto = this.chartDiv;
        chartOptions.data.onclick = this.handleDataClick; // Update scope after rendering. Needs a delay to make it happen

        chartOptions.onrendered = function () {
          return _.defer(_this5.updateScope);
        };

        c3 = require('c3');
        return this.chart = c3.generate(chartOptions);
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps, prevState) {
        var changed, newChartOptions, newCompiler; // Check if schema, data or design (except for header + footer) changed

        changed = false;
        changed = changed || prevProps.schema !== this.props.schema;
        changed = changed || !_.isEqual(prevProps.data, this.props.data);
        changed = changed || prevProps.locale !== this.props.locale;
        changed = changed || prevProps.design !== this.props.design && !_.isEqual(_.omit(prevProps.design, "header", "footer"), _.omit(this.props.design, "header", "footer"));

        if (changed) {
          newCompiler = new LayeredChartCompiler({
            schema: this.props.schema
          });
          newChartOptions = newCompiler.createChartOptions({
            design: this.props.design,
            data: this.props.data,
            width: this.props.width,
            height: this.props.height,
            locale: this.props.locale
          }); // TODO check if only data changed
          // Use throttled update to bypass https://github.com/mWater/mwater-visualization/issues/92

          return this.throttledCreateChart(this.props); // Check if size alone changed
        } else if (this.props.width !== prevProps.width || this.props.height !== prevProps.height) {
          this.chart.resize({
            width: this.props.width,
            height: this.props.height
          });
          this.updateScope(); // Check scope
        } else if (!_.isEqual(this.props.scope, prevProps.scope)) {
          return this.updateScope();
        }
      }
    }, {
      key: "updateScope",
      value: function updateScope() {
        var _this6 = this;

        var compiler, dataMap, el;
        boundMethodCheck(this, C3ChartComponent);
        dataMap = this.getDataMap();
        compiler = new LayeredChartCompiler({
          schema: this.props.schema
        });
        el = this.chartDiv; // Handle line and bar charts
        // Highlight only scoped

        d3.select(el).selectAll(".c3-chart-bar .c3-bar, .c3-chart-line .c3-circle").style("opacity", function (d, i) {
          var dataPoint, scope;
          dataPoint = _this6.lookupDataPoint(dataMap, d);

          if (dataPoint) {
            scope = compiler.createScope(_this6.props.design, dataPoint.layerIndex, dataPoint.row, _this6.props.locale);
          } // Determine if scoped


          if (scope && _this6.props.scope) {
            if (_.isEqual(_this6.props.scope.data, scope.data)) {
              return 1;
            } else {
              return 0.3;
            }
          } else {
            // Not scoped
            return 1;
          }
        }); // Handle pie charts

        return d3.select(el).selectAll(".c3-chart-arcs .c3-chart-arc").style("opacity", function (d, i) {
          var dataPoint, scope;
          dataPoint = _this6.lookupDataPoint(dataMap, d);

          if (dataPoint) {
            scope = compiler.createScope(_this6.props.design, dataPoint.layerIndex, dataPoint.row, _this6.props.locale);
          } // Determine if scoped


          if (_this6.props.scope) {
            if (_.isEqual(_this6.props.scope.data, scope.data)) {
              return 1;
            } else {
              return 0.3;
            }
          } else {
            // Not scoped
            return 1;
          }
        });
      } // Gets a data point { layerIndex, row } from a d3 object (d)

    }, {
      key: "lookupDataPoint",
      value: function lookupDataPoint(dataMap, d) {
        var dataPoint, isPolarChart, ref;

        if (d.data) {
          d = d.data;
        } // Lookup layer and row. If pie/donut, index is always zero


        isPolarChart = (ref = this.props.design.type) === 'pie' || ref === 'donut';

        if (isPolarChart) {
          dataPoint = dataMap["".concat(d.id)];
        } else {
          dataPoint = dataMap["".concat(d.id, ":").concat(d.index)];
        }

        return dataPoint;
      }
    }, {
      key: "getDataMap",
      value: function getDataMap() {
        var compiler; // Get data map

        compiler = new LayeredChartCompiler({
          schema: this.props.schema
        });
        return compiler.createDataMap(this.props.design, this.props.data);
      }
    }, {
      key: "handleDataClick",
      value: function handleDataClick(d) {
        var base, base1, compiler, dataMap, dataPoint, scope;
        boundMethodCheck(this, C3ChartComponent); // Get data map

        dataMap = this.getDataMap(); // Look up data point

        dataPoint = this.lookupDataPoint(dataMap, d);

        if (!dataPoint) {
          return;
        } // Create scope


        compiler = new LayeredChartCompiler({
          schema: this.props.schema
        });
        scope = compiler.createScope(this.props.design, dataPoint.layerIndex, dataPoint.row, this.props.locale); // If same scope data, remove scope

        if (this.props.scope && _.isEqual(scope.data, this.props.scope.data)) {
          if (typeof (base = this.props).onScopeChange === "function") {
            base.onScopeChange(null);
          }

          return;
        }

        return typeof (base1 = this.props).onScopeChange === "function" ? base1.onScopeChange(scope) : void 0;
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        return this.chart.destroy();
      }
    }, {
      key: "render",
      value: function render() {
        var _this7 = this;

        var css, scale;
        scale = this.props.width / this.props.standardWidth; // Don't grow fonts as it causes overlap

        scale = Math.min(scale, 1);
        css = ".c3 svg { font-size: ".concat(scale * 10, "px; }\n");
        css += ".c3-legend-item { font-size: ".concat(scale * 12, "px; }\n");
        css += ".c3-chart-arc text { font-size: ".concat(scale * 13, "px; }\n");
        css += ".c3-title { font-size: ".concat(scale * 14, "px; }\n");
        return R('div', null, R('style', null, css), R('div', {
          ref: function ref(c) {
            return _this7.chartDiv = c;
          }
        }));
      }
    }]);
    return C3ChartComponent;
  }(React.Component);

  ;
  C3ChartComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    standardWidth: PropTypes.number.isRequired,
    scope: PropTypes.any,
    // scope of the widget (when the widget self-selects a particular scope)
    onScopeChange: PropTypes.func,
    // called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
    locale: PropTypes.string // e.g. "en"

  };
  return C3ChartComponent;
}.call(void 0);