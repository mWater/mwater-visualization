"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var AxisComponent,
    BufferLayerDesignerComponent,
    ColorComponent,
    EditPopupComponent,
    ExprCompiler,
    ExprUtils,
    FilterExprComponent,
    NumberInputComponent,
    PopupFilterJoinsUtils,
    PropTypes,
    R,
    Rcslider,
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
NumberInputComponent = require('react-library/lib/NumberInputComponent');
AxisComponent = require('./../axes/AxisComponent');
ColorComponent = require('../ColorComponent');
TableSelectComponent = require('../TableSelectComponent');
Rcslider = require('rc-slider').default;
EditPopupComponent = require('./EditPopupComponent');
ZoomLevelsComponent = require('./ZoomLevelsComponent');
PopupFilterJoinsUtils = require('./PopupFilterJoinsUtils');

module.exports = BufferLayerDesignerComponent = function () {
  var BufferLayerDesignerComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(BufferLayerDesignerComponent, _React$Component);

    function BufferLayerDesignerComponent() {
      var _this;

      (0, _classCallCheck2.default)(this, BufferLayerDesignerComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(BufferLayerDesignerComponent).apply(this, arguments));
      _this.handleTableChange = _this.handleTableChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleRadiusChange = _this.handleRadiusChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleGeometryAxisChange = _this.handleGeometryAxisChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleFilterChange = _this.handleFilterChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleColorChange = _this.handleColorChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleColorAxisChange = _this.handleColorAxisChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleFillOpacityChange = _this.handleFillOpacityChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      return _this;
    } // Apply updates to design


    (0, _createClass2.default)(BufferLayerDesignerComponent, [{
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
        boundMethodCheck(this, BufferLayerDesignerComponent);
        return this.update({
          table: table
        });
      }
    }, {
      key: "handleRadiusChange",
      value: function handleRadiusChange(radius) {
        boundMethodCheck(this, BufferLayerDesignerComponent);
        return this.update({
          radius: radius
        });
      }
    }, {
      key: "handleGeometryAxisChange",
      value: function handleGeometryAxisChange(axis) {
        boundMethodCheck(this, BufferLayerDesignerComponent);
        return this.updateAxes({
          geometry: axis
        });
      }
    }, {
      key: "handleFilterChange",
      value: function handleFilterChange(expr) {
        boundMethodCheck(this, BufferLayerDesignerComponent);
        return this.update({
          filter: expr
        });
      }
    }, {
      key: "handleColorChange",
      value: function handleColorChange(color) {
        boundMethodCheck(this, BufferLayerDesignerComponent);
        return this.update({
          color: color
        });
      }
    }, {
      key: "handleColorAxisChange",
      value: function handleColorAxisChange(axis) {
        boundMethodCheck(this, BufferLayerDesignerComponent);
        return this.updateAxes({
          color: axis
        });
      }
    }, {
      key: "handleFillOpacityChange",
      value: function handleFillOpacityChange(fillOpacity) {
        boundMethodCheck(this, BufferLayerDesignerComponent);
        return this.update({
          fillOpacity: fillOpacity / 100
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
        }), " Circle Centers");
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
      key: "renderRadius",
      value: function renderRadius() {
        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, "Radius (meters)"), ": ", React.createElement(NumberInputComponent, {
          value: this.props.design.radius,
          onChange: this.handleRadiusChange
        }));
      }
    }, {
      key: "renderColor",
      value: function renderColor() {
        var exprCompiler, filters, jsonql;

        if (!this.props.design.axes.geometry) {
          return;
        }

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

        return R('div', null, !this.props.design.axes.color ? R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, R('span', {
          className: "glyphicon glyphicon glyphicon-tint"
        }), "Circle Color"), R('div', null, R(ColorComponent, {
          color: this.props.design.color,
          onChange: this.handleColorChange
        }))) : void 0, R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, R('span', {
          className: "glyphicon glyphicon glyphicon-tint"
        }), "Color By Data"), R(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.design.table,
          types: ["text", "enum", "boolean", 'date'],
          aggrNeed: "none",
          value: this.props.design.axes.color,
          defaultColor: this.props.design.color,
          showColorMap: true,
          onChange: this.handleColorAxisChange,
          allowExcludedValues: true,
          filters: filters
        })));
      }
    }, {
      key: "renderFillOpacity",
      value: function renderFillOpacity() {
        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, "Circle Opacity (%)"), ": ", React.createElement(Rcslider, {
          min: 0,
          max: 100,
          step: 1,
          tipTransitionName: "rc-slider-tooltip-zoom-down",
          value: this.props.design.fillOpacity * 100,
          onChange: this.handleFillOpacityChange
        }));
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
      key: "renderPopup",
      value: function renderPopup() {
        if (!this.props.design.table) {
          return null;
        }

        return R(EditPopupComponent, {
          design: this.props.design,
          onDesignChange: this.props.onDesignChange,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.design.table,
          idTable: this.props.design.table,
          defaultPopupFilterJoins: PopupFilterJoinsUtils.createDefaultPopupFilterJoins(this.props.design.table)
        });
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', null, this.renderTable(), this.renderGeometryAxis(), this.renderRadius(), this.renderColor(), this.renderFillOpacity(), this.renderFilter(), this.renderPopup(), this.props.design.table ? R(ZoomLevelsComponent, {
          design: this.props.design,
          onDesignChange: this.props.onDesignChange
        }) : void 0);
      }
    }]);
    return BufferLayerDesignerComponent;
  }(React.Component);

  ;
  BufferLayerDesignerComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    // Design of the design
    onDesignChange: PropTypes.func.isRequired,
    // Called with new design
    filters: PropTypes.array // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  };
  return BufferLayerDesignerComponent;
}.call(void 0);