"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var $, BlocksDesignerComponent, DemoComponent, DirectWidgetDataSource, MWaterLoaderComponent, R, React, ReactDOM, WidgetFactory, design, widgetDesign;
React = require('react');
ReactDOM = require('react-dom');
R = React.createElement;
$ = require('jquery');
MWaterLoaderComponent = require('./MWaterLoaderComponent');
BlocksDesignerComponent = require('./layouts/blocks/BlocksDesignerComponent');
DirectWidgetDataSource = require('./widgets/DirectWidgetDataSource');
WidgetFactory = require('./widgets/WidgetFactory');

DemoComponent = /*#__PURE__*/function (_React$Component) {
  (0, _inherits2["default"])(DemoComponent, _React$Component);

  var _super = _createSuper(DemoComponent);

  function DemoComponent(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, DemoComponent);
    _this = _super.call(this, props);
    _this.state = {
      design: design,
      extraTables: []
    };
    return _this;
  }

  (0, _createClass2["default"])(DemoComponent, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      return R(MWaterLoaderComponent, {
        apiUrl: this.props.apiUrl,
        client: this.props.client,
        user: this.props.user,
        onExtraTablesChange: function onExtraTablesChange(extraTables) {
          return _this2.setState({
            extraTables: extraTables
          });
        },
        extraTables: this.state.extraTables
      }, function (error, config) {
        var renderWidget;

        if (error) {
          alert("Error: " + error.message);
          return null;
        }

        renderWidget = function renderWidget(options) {
          var widget, widgetDataSource; // Passed
          //  type: type of the widget
          //  design: design of the widget
          //  onDesignChange: TODO
          //  width: width to render. null for auto
          //  height: height to render. null for auto

          widget = WidgetFactory.createWidget(options.type);
          widgetDataSource = new DirectWidgetDataSource({
            apiUrl: _this2.props.apiUrl,
            widget: widget,
            schema: config.schema,
            dataSource: config.dataSource,
            client: _this2.props.client
          });
          return React.cloneElement(widget.createViewElement({
            schema: config.schema,
            dataSource: config.dataSource,
            widgetDataSource: widgetDataSource,
            design: options.design,
            onDesignChange: options.onDesignChange,
            scope: null,
            filters: [],
            onScopeChange: function onScopeChange() {
              return alert("TODO");
            }
          }), {
            width: options.width,
            height: widget.isAutoHeight() ? null : options.height,
            standardWidth: options.width
          });
        };

        return R(BlocksDesignerComponent, {
          renderWidget: renderWidget,
          design: _this2.state.design,
          onDesignChange: function onDesignChange(design) {
            return _this2.setState({
              design: design
            });
          }
        });
      });
    }
  }]);
  return DemoComponent;
}(React.Component);

$(function () {
  var sample;
  sample = R('div', {
    className: "container-fluid",
    style: {
      height: "100%",
      paddingLeft: 0,
      paddingRight: 0
    }
  }, R('style', null, "html, body, #main { height: 100% }"), React.createElement(DemoComponent, {
    apiUrl: "https://api.mwater.co/v3/"
  }));
  return ReactDOM.render(sample, document.getElementById("main"));
});
widgetDesign = {
  "version": 1,
  "layers": [{
    "axes": {
      "x": {
        "expr": {
          "type": "field",
          "table": "entities.water_point",
          "column": "type"
        },
        "xform": null
      },
      "y": {
        "expr": {
          "type": "id",
          "table": "entities.water_point"
        },
        "aggr": "count",
        "xform": null
      }
    },
    "filter": null,
    "table": "entities.water_point"
  }],
  "type": "bar"
};
design = {
  id: "root",
  type: "root",
  blocks: []
}; // { id: "1234", type: "widget", aspectRatio: 1.4, widgetType: "LayeredChart", design: widgetDesign }
// { id: "1234", type: "widget", widgetType: "Text", design: { items: ["hello world!!!"] } }