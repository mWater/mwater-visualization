"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var AxisComponent,
    ClusterLayerDesignerComponent,
    ColorComponent,
    ExprCompiler,
    ExprUtils,
    FilterExprComponent,
    PropTypes,
    R,
    React,
    TableSelectComponent,
    ZoomLevelsComponent,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;
ExprUtils = require('mwater-expressions').ExprUtils;
ExprCompiler = require('mwater-expressions').ExprCompiler;
AxisComponent = require('./../axes/AxisComponent');
ColorComponent = require('../ColorComponent');
TableSelectComponent = require('../TableSelectComponent');
ZoomLevelsComponent = require('./ZoomLevelsComponent');

module.exports = ClusterLayerDesignerComponent = function () {
  var ClusterLayerDesignerComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(ClusterLayerDesignerComponent, _React$Component);

    function ClusterLayerDesignerComponent() {
      var _this;

      (0, _classCallCheck2.default)(this, ClusterLayerDesignerComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ClusterLayerDesignerComponent).apply(this, arguments));
      _this.handleTableChange = _this.handleTableChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleGeometryAxisChange = _this.handleGeometryAxisChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleFilterChange = _this.handleFilterChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleTextColorChange = _this.handleTextColorChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleFillColorChange = _this.handleFillColorChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      return _this;
    } // Apply updates to design


    (0, _createClass2.default)(ClusterLayerDesignerComponent, [{
      key: "update",
      value: function update(updates) {
        return this.props.onDesignChange(_.extend({}, this.props.design, updates));
      } // Update axes with specified changes

    }, {
      key: "updateAxes",
      value: function updateAxes(changes) {
        var axes;
        axes = _.extend({}, this.props.design.axes, changes);
        return this.update({
          axes: axes
        });
      }
    }, {
      key: "handleTableChange",
      value: function handleTableChange(table) {
        boundMethodCheck(this, ClusterLayerDesignerComponent);
        return this.update({
          table: table
        });
      }
    }, {
      key: "handleGeometryAxisChange",
      value: function handleGeometryAxisChange(axis) {
        boundMethodCheck(this, ClusterLayerDesignerComponent);
        return this.updateAxes({
          geometry: axis
        });
      }
    }, {
      key: "handleFilterChange",
      value: function handleFilterChange(expr) {
        boundMethodCheck(this, ClusterLayerDesignerComponent);
        return this.update({
          filter: expr
        });
      }
    }, {
      key: "handleTextColorChange",
      value: function handleTextColorChange(color) {
        boundMethodCheck(this, ClusterLayerDesignerComponent);
        return this.update({
          textColor: color
        });
      }
    }, {
      key: "handleFillColorChange",
      value: function handleFillColorChange(color) {
        boundMethodCheck(this, ClusterLayerDesignerComponent);
        return this.update({
          fillColor: color
        });
      }
    }, {
      key: "renderTable",
      value: function renderTable() {
        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, R('i', {
          className: "fa fa-database"
        }), " ", "Data Source"), R('div', {
          style: {
            marginLeft: 10
          }
        }, R(TableSelectComponent, {
          schema: this.props.schema,
          value: this.props.design.table,
          onChange: this.handleTableChange,
          filter: this.props.design.filter,
          onFilterChange: this.handleFilterChange
        })));
      }
    }, {
      key: "renderGeometryAxis",
      value: function renderGeometryAxis() {
        var exprCompiler, filters, jsonql, title;

        if (!this.props.design.table) {
          return;
        }

        title = R('span', null, R('span', {
          className: "glyphicon glyphicon-map-marker"
        }), " Locations to Cluster");
        filters = _.clone(this.props.filters) || [];

        if (this.props.design.filter != null) {
          exprCompiler = new ExprCompiler(this.props.schema);
          jsonql = exprCompiler.compileExpr({
            expr: this.props.design.filter,
            tableAlias: "{alias}"
          });

          if (jsonql) {
            filters.push({
              table: this.props.design.filter.table,
              jsonql: jsonql
            });
          }
        }

        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, title), R('div', {
          style: {
            marginLeft: 10
          }
        }, React.createElement(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.design.table,
          types: ["geometry"],
          aggrNeed: "none",
          value: this.props.design.axes.geometry,
          onChange: this.handleGeometryAxisChange,
          filters: filters
        })));
      }
    }, {
      key: "renderTextColor",
      value: function renderTextColor() {
        if (!this.props.design.axes.geometry) {
          return;
        }

        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, R('span', {
          className: "glyphicon glyphicon glyphicon-tint"
        }), "Text Color"), R('div', null, R(ColorComponent, {
          color: this.props.design.textColor,
          onChange: this.handleTextColorChange
        })));
      }
    }, {
      key: "renderFillColor",
      value: function renderFillColor() {
        if (!this.props.design.axes.geometry) {
          return;
        }

        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, R('span', {
          className: "glyphicon glyphicon glyphicon-tint"
        }), "Marker Color"), R('div', null, R(ColorComponent, {
          color: this.props.design.fillColor,
          onChange: this.handleFillColorChange
        })));
      }
    }, {
      key: "renderFilter",
      value: function renderFilter() {
        // If no data, hide
        if (!this.props.design.axes.geometry) {
          return null;
        }

        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, R('span', {
          className: "glyphicon glyphicon-filter"
        }), " Filters"), R('div', {
          style: {
            marginLeft: 8
          }
        }, React.createElement(FilterExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          onChange: this.handleFilterChange,
          table: this.props.design.table,
          value: this.props.design.filter
        })));
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', null, this.renderTable(), this.renderGeometryAxis(), this.renderTextColor(), this.renderFillColor(), this.renderFilter(), this.props.design.table ? R(ZoomLevelsComponent, {
          design: this.props.design,
          onDesignChange: this.props.onDesignChange
        }) : void 0);
      }
    }]);
    return ClusterLayerDesignerComponent;
  }(React.Component);

  ;
  ClusterLayerDesignerComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    // Design of the design
    onDesignChange: PropTypes.func.isRequired,
    // Called with new design
    filters: PropTypes.array // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  };
  return ClusterLayerDesignerComponent;
}.call(void 0);