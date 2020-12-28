"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var DropdownWidgetComponent,
    LayerFactory,
    MapUtils,
    MapWidget,
    MapWidgetComponent,
    ModalWindowComponent,
    PropTypes,
    R,
    React,
    Widget,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
_ = require('lodash');
Widget = require('./Widget');
DropdownWidgetComponent = require('./DropdownWidgetComponent');
ModalWindowComponent = require('react-library/lib/ModalWindowComponent');
LayerFactory = require('../maps/LayerFactory');
MapUtils = require('../maps/MapUtils'); // Design is the map design specified in maps/Map Design.md

module.exports = MapWidget = /*#__PURE__*/function (_Widget) {
  (0, _inherits2["default"])(MapWidget, _Widget);

  var _super = _createSuper(MapWidget);

  function MapWidget() {
    (0, _classCallCheck2["default"])(this, MapWidget);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(MapWidget, [{
    key: "createViewElement",
    // Creates a React element that is a view of the widget 
    // options:
    //  schema: schema to use
    //  dataSource: data source to use
    //  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
    //  design: widget design
    //  scope: scope of the widget (when the widget self-selects a particular scope)
    //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    //  onScopeChange: called with scope of widget
    //  onDesignChange: called with new design. null/undefined for readonly
    //  width: width in pixels on screen
    //  height: height in pixels on screen
    //  onRowClick: Called with (tableId, rowId) when item is clicked
    value: function createViewElement(options) {
      return React.createElement(MapWidgetComponent, {
        schema: options.schema,
        dataSource: options.dataSource,
        widgetDataSource: options.widgetDataSource,
        design: options.design,
        onDesignChange: options.onDesignChange,
        scope: options.scope,
        filters: options.filters,
        onScopeChange: options.onScopeChange,
        width: options.width,
        height: options.height,
        onRowClick: options.onRowClick
      });
    } // Get a list of table ids that can be filtered on

  }, {
    key: "getFilterableTables",
    value: function getFilterableTables(design, schema) {
      // Get filterable tables
      return MapUtils.getFilterableTables(design, schema);
    }
  }]);
  return MapWidget;
}(Widget);

MapWidgetComponent = function () {
  var MapWidgetComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(MapWidgetComponent, _React$Component);

    var _super2 = _createSuper(MapWidgetComponent);

    function MapWidgetComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, MapWidgetComponent);
      _this = _super2.call(this, props);
      _this.handleStartEditing = _this.handleStartEditing.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleEndEditing = _this.handleEndEditing.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleEditDesignChange = _this.handleEditDesignChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        // Design that is being edited. Change is propagated on closing window
        editDesign: null,
        transientDesign: props.design // Temporary design for read-only maps

      };
      return _this;
    }

    (0, _createClass2["default"])(MapWidgetComponent, [{
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.design, this.props.design)) {
          return this.setState({
            transientDesign: this.props.design
          });
        }
      }
    }, {
      key: "handleStartEditing",
      value: function handleStartEditing() {
        boundMethodCheck(this, MapWidgetComponent);
        return this.setState({
          editDesign: this.props.design
        });
      }
    }, {
      key: "handleEndEditing",
      value: function handleEndEditing() {
        boundMethodCheck(this, MapWidgetComponent);
        this.props.onDesignChange(this.state.editDesign);
        return this.setState({
          editDesign: null
        });
      }
    }, {
      key: "handleEditDesignChange",
      value: function handleEditDesignChange(design) {
        boundMethodCheck(this, MapWidgetComponent);
        return this.setState({
          editDesign: design
        });
      }
    }, {
      key: "renderEditor",
      value: function renderEditor() {
        var MapDesignerComponent, chart, content, editor, height, width;

        if (!this.state.editDesign) {
          return null;
        } // Require here to prevent server require problems


        MapDesignerComponent = require('../maps/MapDesignerComponent'); // Create editor

        editor = React.createElement(MapDesignerComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          design: this.state.editDesign,
          onDesignChange: this.handleEditDesignChange,
          filters: this.props.filters
        }); // Create map (maxing out at half of width of screen)

        width = Math.min(document.body.clientWidth / 2, this.props.width);
        height = this.props.height * width / this.props.width;
        chart = this.renderContent(this.state.editDesign, this.handleEditDesignChange, width, height);
        content = R('div', {
          style: {
            height: "100%",
            width: "100%"
          }
        }, R('div', {
          style: {
            position: "absolute",
            left: 0,
            top: 0,
            border: "solid 2px #EEE",
            borderRadius: 8,
            padding: 10,
            width: width + 20,
            height: height + 20
          }
        }, chart), R('div', {
          style: {
            width: "100%",
            height: "100%",
            paddingLeft: width + 40
          }
        }, R('div', {
          style: {
            width: "100%",
            height: "100%",
            overflowY: "auto",
            paddingLeft: 20,
            borderLeft: "solid 3px #AAA"
          }
        }, editor)));
        return React.createElement(ModalWindowComponent, {
          isOpen: true,
          onRequestClose: this.handleEndEditing
        }, content);
      }
    }, {
      key: "renderContent",
      value: function renderContent(design, onDesignChange, width, height) {
        var MapViewComponent; // Require here to prevent server require problems

        MapViewComponent = require('../maps/MapViewComponent');
        return R('div', {
          style: {
            width: width,
            height: height,
            padding: 10
          }
        }, React.createElement(MapViewComponent, {
          schema: this.props.schema,
          design: design,
          dataSource: this.props.dataSource,
          mapDataSource: this.props.widgetDataSource.getMapDataSource(design),
          onDesignChange: onDesignChange,
          scope: this.props.scope,
          onScopeChange: this.props.onScopeChange,
          extraFilters: this.props.filters,
          width: width - 20,
          height: height - 20,
          scrollWheelZoom: false,
          // Prevent accidental zooming
          onRowClick: this.props.onRowClick
        }));
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var dropdownItems, handleDesignChange;
        dropdownItems = [];

        if (this.props.onDesignChange != null) {
          dropdownItems.push({
            label: "Edit",
            icon: "pencil",
            onClick: this.handleStartEditing
          });
        }

        handleDesignChange = function handleDesignChange(d) {
          return _this2.setState({
            transientDesign: d
          });
        }; // Wrap in a simple widget
        // Use transient design (as it may be affected by toggling layers)


        return R('div', null, this.props.onDesignChange != null ? this.renderEditor() : void 0, React.createElement(DropdownWidgetComponent, {
          width: this.props.width,
          height: this.props.height,
          dropdownItems: dropdownItems
        }, this.renderContent(this.state.transientDesign, handleDesignChange, this.props.width, this.props.height)));
      }
    }]);
    return MapWidgetComponent;
  }(React.Component);

  ;
  MapWidgetComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    // Data source to use
    widgetDataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    // See Map Design.md
    onDesignChange: PropTypes.func,
    // Called with new design.  null/undefined for readonly
    width: PropTypes.number,
    height: PropTypes.number,
    scope: PropTypes.any,
    // scope of the widget (when the widget self-selects a particular scope)
    filters: PropTypes.array,
    // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    onScopeChange: PropTypes.func,
    // called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
    onRowClick: PropTypes.func // Called with (tableId, rowId) when item is clicked

  };
  return MapWidgetComponent;
}.call(void 0);