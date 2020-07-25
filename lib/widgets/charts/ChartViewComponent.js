"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var ChartViewComponent, PropTypes, R, React, _, asyncLatest;

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
asyncLatest = require('async-latest'); // Inner view part of the chart widget. Uses a query data loading component
// to handle loading and continues to display old data if design becomes
// invalid

module.exports = ChartViewComponent = function () {
  var ChartViewComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(ChartViewComponent, _React$Component);

    var _super = _createSuper(ChartViewComponent);

    function ChartViewComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, ChartViewComponent);
      _this = _super.call(this, props);
      _this.state = {
        validDesign: null,
        // last valid design
        data: null,
        // data for chart
        dataLoading: false,
        // True when loading data
        dataError: null,
        // Set when data loading returned error
        cacheExpiry: props.dataSource.getCacheExpiry() // Save cache expiry to see if changes

      }; // Ensure that only one load at a time

      _this.loadData = asyncLatest(_this.loadData, {
        serial: true
      });
      _this.state = {};
      return _this;
    }

    (0, _createClass2["default"])(ChartViewComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        return this.updateData(this.props);
      }
    }, {
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(nextProps) {
        if (!_.isEqual(nextProps.design, this.props.design) || !_.isEqual(nextProps.filters, this.props.filters) || nextProps.dataSource.getCacheExpiry() !== this.state.cacheExpiry) {
          // Save new cache expiry
          this.setState({
            cacheExpiry: nextProps.dataSource.getCacheExpiry()
          });
          return this.updateData(nextProps);
        }
      }
    }, {
      key: "updateData",
      value: function updateData(props) {
        var _this2 = this;

        var design, errors; // Clean design first (needed to validate properly)

        design = props.chart.cleanDesign(props.design, props.schema); // If design is not valid, do nothing as can't query invalid design

        errors = props.chart.validateDesign(design, props.schema);

        if (errors) {
          return;
        } // Loading data


        this.setState({
          dataLoading: true
        });
        return this.loadData(props, function (error, data) {
          return _this2.setState({
            dataLoading: false,
            dataError: error,
            data: data,
            validDesign: design
          });
        });
      }
    }, {
      key: "loadData",
      value: function loadData(props, callback) {
        // Get data from widget data source
        return props.widgetDataSource.getData(props.design, props.filters, callback);
      }
    }, {
      key: "renderSpinner",
      value: function renderSpinner() {
        return R('div', {
          style: {
            position: "absolute",
            bottom: "50%",
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 20
          }
        }, R('i', {
          className: "fa fa-spinner fa-spin"
        }));
      }
    }, {
      key: "render",
      value: function render() {
        var style;
        style = {
          width: this.props.width,
          height: this.props.height
        }; // Faded if loading

        if (this.state.dataLoading) {
          style.opacity = 0.5;
        } // If nothing to show, show grey


        if (!this.state.validDesign) {
          // Invalid. Show faded with background
          style.backgroundColor = "#E0E0E0";
          style.opacity = 0.35; // Set height to 1.6 ratio if not set so the control is visible

          if (!this.props.height && this.props.width) {
            style.height = this.props.width / 1.6;
          }
        }

        if (this.state.dataError) {
          return R('div', {
            className: "alert alert-danger"
          }, "Error loading data: ".concat(this.state.dataError.message || this.state.dataError));
        }

        return R('div', {
          style: style
        }, this.state.validDesign ? this.props.chart.createViewElement({
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          design: this.state.validDesign,
          onDesignChange: this.props.onDesignChange,
          data: this.state.data,
          scope: this.props.scope,
          onScopeChange: this.props.onScopeChange,
          width: this.props.width,
          height: this.props.height,
          standardWidth: this.props.standardWidth,
          onRowClick: this.props.onRowClick,
          filters: this.props.filters
        }) : void 0, this.state.dataLoading ? this.renderSpinner() : void 0);
      }
    }]);
    return ChartViewComponent;
  }(React.Component);

  ;
  ChartViewComponent.propTypes = {
    chart: PropTypes.object.isRequired,
    // Chart object to use
    design: PropTypes.object.isRequired,
    // Design of chart
    onDesignChange: PropTypes.func,
    // When design change
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    // Data source to use for chart
    widgetDataSource: PropTypes.object.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    standardWidth: PropTypes.number,
    scope: PropTypes.any,
    // scope of the widget (when the widget self-selects a particular scope)
    filters: PropTypes.array,
    // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias }. Use injectAlias to correct
    onScopeChange: PropTypes.func,
    // called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
    onRowClick: PropTypes.func // Called with (tableId, rowId) when item is clicked

  };
  return ChartViewComponent;
}.call(void 0);