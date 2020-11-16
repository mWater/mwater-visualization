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
    MarkdownWidget,
    MarkdownWidgetComponent,
    MarkdownWidgetDesignerComponent,
    MarkdownWidgetViewComponent,
    ModalWindowComponent,
    PropTypes,
    R,
    React,
    Widget,
    _,
    markdown,
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
markdown = require("markdown").markdown;
ModalWindowComponent = require('react-library/lib/ModalWindowComponent');

module.exports = MarkdownWidget = /*#__PURE__*/function (_Widget) {
  (0, _inherits2["default"])(MarkdownWidget, _Widget);

  var _super = _createSuper(MarkdownWidget);

  function MarkdownWidget() {
    (0, _classCallCheck2["default"])(this, MarkdownWidget);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(MarkdownWidget, [{
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
    value: function createViewElement(options) {
      return React.createElement(MarkdownWidgetComponent, {
        design: options.design,
        onDesignChange: options.onDesignChange,
        width: options.width,
        height: options.height
      });
    } // Determine if widget is auto-height, which means that a vertical height is not required.

  }, {
    key: "isAutoHeight",
    value: function isAutoHeight() {
      return true;
    }
  }]);
  return MarkdownWidget;
}(Widget);

MarkdownWidgetComponent = function () {
  var MarkdownWidgetComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(MarkdownWidgetComponent, _React$Component);

    var _super2 = _createSuper(MarkdownWidgetComponent);

    function MarkdownWidgetComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, MarkdownWidgetComponent);
      _this = _super2.call(this, props);
      _this.handleStartEditing = _this.handleStartEditing.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleEndEditing = _this.handleEndEditing.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleEditDesignChange = _this.handleEditDesignChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        // Design that is being edited. Change is propagated on closing window
        editDesign: null
      };
      return _this;
    }

    (0, _createClass2["default"])(MarkdownWidgetComponent, [{
      key: "handleStartEditing",
      value: function handleStartEditing() {
        boundMethodCheck(this, MarkdownWidgetComponent);
        return this.setState({
          editDesign: this.props.design
        });
      }
    }, {
      key: "handleEndEditing",
      value: function handleEndEditing() {
        boundMethodCheck(this, MarkdownWidgetComponent);
        this.props.onDesignChange(this.state.editDesign);
        return this.setState({
          editDesign: null
        });
      }
    }, {
      key: "handleEditDesignChange",
      value: function handleEditDesignChange(design) {
        boundMethodCheck(this, MarkdownWidgetComponent);
        return this.setState({
          editDesign: design
        });
      }
    }, {
      key: "renderEditor",
      value: function renderEditor() {
        var chart, content, editor, width;

        if (!this.state.editDesign) {
          return null;
        } // Create editor


        editor = React.createElement(MarkdownWidgetDesignerComponent, {
          design: this.state.editDesign,
          onDesignChange: this.handleEditDesignChange
        }); // Create item (maxing out at half of width of screen)

        width = Math.min(document.body.clientWidth / 2, this.props.width);
        chart = this.renderContent(this.state.editDesign);
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
            height: this.props.height + 20
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
      value: function renderContent(design) {
        return React.createElement(MarkdownWidgetViewComponent, {
          design: design,
          width: this.props.width,
          height: this.props.height
        });
      }
    }, {
      key: "render",
      value: function render() {
        var dropdownItems;
        dropdownItems = [];

        if (this.props.onDesignChange != null) {
          dropdownItems.push({
            label: "Edit",
            icon: "pencil",
            onClick: this.handleStartEditing
          });
        } // Wrap in a simple widget


        return R('div', {
          onDoubleClick: this.handleStartEditing
        }, this.props.onDesignChange != null ? this.renderEditor() : void 0, React.createElement(DropdownWidgetComponent, {
          width: this.props.width,
          height: this.props.height,
          dropdownItems: dropdownItems
        }, this.renderContent(this.props.design)));
      }
    }]);
    return MarkdownWidgetComponent;
  }(React.Component);

  ;
  MarkdownWidgetComponent.propTypes = {
    design: PropTypes.object.isRequired,
    // See Map Design.md
    onDesignChange: PropTypes.func,
    // Called with new design. null/undefined for readonly
    width: PropTypes.number,
    height: PropTypes.number
  };
  return MarkdownWidgetComponent;
}.call(void 0);

MarkdownWidgetViewComponent = function () {
  var MarkdownWidgetViewComponent = /*#__PURE__*/function (_React$Component2) {
    (0, _inherits2["default"])(MarkdownWidgetViewComponent, _React$Component2);

    var _super3 = _createSuper(MarkdownWidgetViewComponent);

    function MarkdownWidgetViewComponent() {
      (0, _classCallCheck2["default"])(this, MarkdownWidgetViewComponent);
      return _super3.apply(this, arguments);
    }

    (0, _createClass2["default"])(MarkdownWidgetViewComponent, [{
      key: "render",
      value: function render() {
        return R('div', {
          style: {
            width: this.props.width,
            height: this.props.height
          },
          className: "mwater-visualization-markdown",
          dangerouslySetInnerHTML: {
            __html: markdown.toHTML(this.props.design.markdown || "")
          }
        });
      }
    }]);
    return MarkdownWidgetViewComponent;
  }(React.Component);

  ;
  MarkdownWidgetViewComponent.propTypes = {
    design: PropTypes.object.isRequired,
    // Design of chart
    width: PropTypes.number,
    height: PropTypes.number
  };
  return MarkdownWidgetViewComponent;
}.call(void 0);

MarkdownWidgetDesignerComponent = function () {
  var MarkdownWidgetDesignerComponent = /*#__PURE__*/function (_React$Component3) {
    (0, _inherits2["default"])(MarkdownWidgetDesignerComponent, _React$Component3);

    var _super4 = _createSuper(MarkdownWidgetDesignerComponent);

    function MarkdownWidgetDesignerComponent() {
      var _this2;

      (0, _classCallCheck2["default"])(this, MarkdownWidgetDesignerComponent);
      _this2 = _super4.apply(this, arguments);
      _this2.handleMarkdownChange = _this2.handleMarkdownChange.bind((0, _assertThisInitialized2["default"])(_this2));
      return _this2;
    }

    (0, _createClass2["default"])(MarkdownWidgetDesignerComponent, [{
      key: "handleMarkdownChange",
      value: function handleMarkdownChange(ev) {
        var design;
        boundMethodCheck(this, MarkdownWidgetDesignerComponent);
        design = _.extend({}, this.props.design, {
          markdown: ev.target.value
        });
        return this.props.onDesignChange(design);
      }
    }, {
      key: "render",
      value: function render() {
        return R('textarea', {
          className: "form-control",
          style: {
            width: "100%",
            height: "100%"
          },
          value: this.props.design.markdown,
          onChange: this.handleMarkdownChange
        });
      }
    }]);
    return MarkdownWidgetDesignerComponent;
  }(React.Component);

  ;
  MarkdownWidgetDesignerComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired
  };
  return MarkdownWidgetDesignerComponent;
}.call(void 0);