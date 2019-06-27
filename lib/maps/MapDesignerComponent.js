"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var AdvancedOptionsComponent,
    AttributionComponent,
    BaseLayerDesignerComponent,
    CheckboxComponent,
    ClickOutHandler,
    ExprCompiler,
    MapDesignerComponent,
    MapFiltersDesignerComponent,
    MapLayersDesignerComponent,
    MapUtils,
    NumberInputComponent,
    PopoverHelpComponent,
    PropTypes,
    R,
    React,
    TabbedComponent,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
TabbedComponent = require('react-library/lib/TabbedComponent');
NumberInputComponent = require('react-library/lib/NumberInputComponent');
CheckboxComponent = require('../CheckboxComponent');
ClickOutHandler = require('react-onclickout');
MapLayersDesignerComponent = require('./MapLayersDesignerComponent');
MapFiltersDesignerComponent = require('./MapFiltersDesignerComponent');
BaseLayerDesignerComponent = require('./BaseLayerDesignerComponent');
PopoverHelpComponent = require('react-library/lib/PopoverHelpComponent');
MapUtils = require('./MapUtils');
ExprCompiler = require('mwater-expressions').ExprCompiler;

module.exports = MapDesignerComponent = function () {
  var MapDesignerComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(MapDesignerComponent, _React$Component);

    function MapDesignerComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, MapDesignerComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(MapDesignerComponent).apply(this, arguments));
      _this.handleAttributionChange = _this.handleAttributionChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleAutoBoundsChange = _this.handleAutoBoundsChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleConvertToClusterMap = _this.handleConvertToClusterMap.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(MapDesignerComponent, [{
      key: "getChildContext",
      value: function getChildContext() {
        return {
          // Pass active tables down to table select components so they can present a shorter list
          activeTables: MapUtils.getFilterableTables(this.props.design, this.props.schema)
        };
      }
    }, {
      key: "handleAttributionChange",
      value: function handleAttributionChange(text) {
        var design;
        boundMethodCheck(this, MapDesignerComponent);
        design = _.extend({}, this.props.design, {
          attribution: text
        });
        return this.props.onDesignChange(design);
      }
    }, {
      key: "handleAutoBoundsChange",
      value: function handleAutoBoundsChange(value) {
        var design;
        boundMethodCheck(this, MapDesignerComponent);
        design = _.extend({}, this.props.design, {
          autoBounds: value
        });
        return this.props.onDesignChange(design);
      }
    }, {
      key: "handleConvertToClusterMap",
      value: function handleConvertToClusterMap() {
        boundMethodCheck(this, MapDesignerComponent);
        return this.props.onDesignChange(MapUtils.convertToClusterMap(this.props.design));
      }
    }, {
      key: "renderOptionsTab",
      value: function renderOptionsTab() {
        return R('div', null, R(BaseLayerDesignerComponent, {
          design: this.props.design,
          onDesignChange: this.props.onDesignChange
        }), R(CheckboxComponent, {
          checked: this.props.design.autoBounds,
          onChange: this.handleAutoBoundsChange
        }, R('span', {
          className: "text-muted"
        }, "Automatic zoom ", R(PopoverHelpComponent, {
          placement: "left"
        }, 'Automatically zoom to the complete data whenever the map is loaded or the filters change'))), MapUtils.canConvertToClusterMap(this.props.design) ? R('div', {
          key: "tocluster"
        }, R('a', {
          onClick: this.handleConvertToClusterMap,
          className: "btn btn-link btn-sm"
        }, "Convert to cluster map")) : void 0, R(AttributionComponent, {
          text: this.props.design.attribution,
          onTextChange: this.handleAttributionChange
        }), R('br'), R(AdvancedOptionsComponent, {
          design: this.props.design,
          onDesignChange: this.props.onDesignChange
        }));
      }
    }, {
      key: "render",
      value: function render() {
        var filters;
        filters = (this.props.filters || []).concat(MapUtils.getCompiledFilters(this.props.design, this.props.schema, MapUtils.getFilterableTables(this.props.design, this.props.schema)));
        return R('div', {
          style: {
            padding: 5
          }
        }, R(TabbedComponent, {
          initialTabId: "layers",
          tabs: [{
            id: "layers",
            label: [R('i', {
              className: "fa fa-bars"
            }), " Layers"],
            elem: R(MapLayersDesignerComponent, {
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              design: this.props.design,
              onDesignChange: this.props.onDesignChange,
              allowEditingLayers: true,
              filters: _.compact(filters)
            })
          }, {
            id: "filters",
            label: [R('i', {
              className: "fa fa-filter"
            }), " Filters"],
            elem: R(MapFiltersDesignerComponent, {
              schema: this.props.schema,
              dataSource: this.props.dataSource,
              design: this.props.design,
              onDesignChange: this.props.onDesignChange
            })
          }, {
            id: "options",
            label: [R('i', {
              className: "fa fa-cog"
            }), " Options"],
            elem: this.renderOptionsTab()
          }]
        }));
      }
    }]);
    return MapDesignerComponent;
  }(React.Component);

  ;
  MapDesignerComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    // Data source to use
    design: PropTypes.object.isRequired,
    // See Map Design.md
    onDesignChange: PropTypes.func.isRequired,
    // Called with new design
    filters: PropTypes.array // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  };
  MapDesignerComponent.childContextTypes = {
    activeTables: PropTypes.arrayOf(PropTypes.string.isRequired) // List of tables (ids) being used. Use this to present an initially short list to select from

  };
  return MapDesignerComponent;
}.call(void 0);

AttributionComponent = function () {
  // Attribution inline editing
  var AttributionComponent =
  /*#__PURE__*/
  function (_React$Component2) {
    (0, _inherits2["default"])(AttributionComponent, _React$Component2);

    function AttributionComponent(props) {
      var _this2;

      (0, _classCallCheck2["default"])(this, AttributionComponent);
      _this2 = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(AttributionComponent).call(this, props));
      _this2.handleTextChange = _this2.handleTextChange.bind((0, _assertThisInitialized2["default"])(_this2));
      _this2.handleClickOut = _this2.handleClickOut.bind((0, _assertThisInitialized2["default"])(_this2));
      _this2.handleTextClick = _this2.handleTextClick.bind((0, _assertThisInitialized2["default"])(_this2));
      _this2.state = {
        editing: false
      };
      return _this2;
    }

    (0, _createClass2["default"])(AttributionComponent, [{
      key: "handleTextChange",
      value: function handleTextChange(e) {
        boundMethodCheck(this, AttributionComponent);
        return this.props.onTextChange(e.target.value);
      }
    }, {
      key: "handleClickOut",
      value: function handleClickOut() {
        boundMethodCheck(this, AttributionComponent);
        return this.setState({
          editing: false
        });
      }
    }, {
      key: "renderEditor",
      value: function renderEditor() {
        return R(ClickOutHandler, {
          onClickOut: this.handleClickOut
        }, R('input', {
          onChange: this.handleTextChange,
          value: this.props.text,
          className: 'form-control'
        }));
      }
    }, {
      key: "handleTextClick",
      value: function handleTextClick() {
        boundMethodCheck(this, AttributionComponent);
        return this.setState({
          editing: true
        });
      }
    }, {
      key: "render",
      value: function render() {
        var elem;
        elem = R('div', {
          style: {
            marginLeft: 5
          }
        }, this.state.editing ? this.renderEditor() : this.props.text ? R('span', {
          onClick: this.handleTextClick,
          style: {
            cursor: "pointer"
          }
        }, this.props.text) : R('a', {
          onClick: this.handleTextClick,
          className: "btn btn-link btn-sm"
        }, "+ Add attribution"));

        if (this.props.text || this.state.editing) {
          elem = R('div', {
            className: "form-group"
          }, R('label', {
            className: "text-muted"
          }, "Attribution"), elem);
        }

        return elem;
      }
    }]);
    return AttributionComponent;
  }(React.Component);

  ;
  AttributionComponent.propTypes = {
    text: PropTypes.string,
    onTextChange: PropTypes.func.isRequired
  };
  AttributionComponent.defaultProps = {
    text: null
  };
  return AttributionComponent;
}.call(void 0);

AdvancedOptionsComponent = function () {
  // Advanced options control
  var AdvancedOptionsComponent =
  /*#__PURE__*/
  function (_React$Component3) {
    (0, _inherits2["default"])(AdvancedOptionsComponent, _React$Component3);

    function AdvancedOptionsComponent(props) {
      var _this3;

      (0, _classCallCheck2["default"])(this, AdvancedOptionsComponent);
      _this3 = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(AdvancedOptionsComponent).call(this, props));
      _this3.state = {
        expanded: false
      };
      return _this3;
    }

    (0, _createClass2["default"])(AdvancedOptionsComponent, [{
      key: "render",
      value: function render() {
        var _this4 = this;

        if (!this.state.expanded) {
          return R('div', null, R('a', {
            className: "btn btn-link btn-xs",
            onClick: function onClick() {
              return _this4.setState({
                expanded: true
              });
            }
          }, "Advanced options..."));
        }

        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, "Advanced"), R('div', null, R('span', {
          className: "text-muted"
        }, "Maximum Zoom Level: "), " ", R(NumberInputComponent, {
          small: true,
          style: {
            display: "inline-block"
          },
          placeholder: "None",
          value: this.props.design.maxZoom,
          onChange: function onChange(v) {
            return _this4.props.onDesignChange(_.extend({}, _this4.props.design, {
              maxZoom: v
            }));
          }
        })));
      }
    }]);
    return AdvancedOptionsComponent;
  }(React.Component);

  ;
  AdvancedOptionsComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired
  };
  return AdvancedOptionsComponent;
}.call(void 0);