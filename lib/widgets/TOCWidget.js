"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var BorderComponent,
    DropdownWidgetComponent,
    ModalPopupComponent,
    PropTypes,
    R,
    React,
    TOCWidget,
    TOCWidgetComponent,
    TOCWidgetDesignerComponent,
    TOCWidgetViewComponent,
    Widget,
    _,
    ui,
    _update,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
_ = require('lodash');
ui = require('react-library/lib/bootstrap');
_update = require('react-library/lib/update');
Widget = require('./Widget');
DropdownWidgetComponent = require('./DropdownWidgetComponent');
ModalPopupComponent = require('react-library/lib/ModalPopupComponent'); // Table of contents widget that displays the h1, h2, etc entries from all text fields in one widget
// design is:
//   header: text of header. Defaults to "Contents"
//   borderWeight: border weight. Defaults to 0=None. 1=light, 2=medium, 3=heavy
//   numbering: true/false for prepending numbering to entries (e.g. 3.4.1)

module.exports = TOCWidget =
/*#__PURE__*/
function (_Widget) {
  (0, _inherits2["default"])(TOCWidget, _Widget);

  function TOCWidget() {
    (0, _classCallCheck2["default"])(this, TOCWidget);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(TOCWidget).apply(this, arguments));
  }

  (0, _createClass2["default"])(TOCWidget, [{
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
    //  tocEntries: entries in the table of contents
    //  onScrollToTOCEntry: called with (widgetId, tocEntryId) to scroll to TOC entry
    value: function createViewElement(options) {
      return R(TOCWidgetComponent, {
        design: options.design,
        onDesignChange: options.onDesignChange,
        width: options.width,
        height: options.height,
        tocEntries: options.tocEntries,
        onScrollToTOCEntry: options.onScrollToTOCEntry
      });
    } // Determine if widget is auto-height, which means that a vertical height is not required.

  }, {
    key: "isAutoHeight",
    value: function isAutoHeight() {
      return true;
    }
  }]);
  return TOCWidget;
}(Widget);

TOCWidgetComponent = function () {
  var TOCWidgetComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(TOCWidgetComponent, _React$Component);

    function TOCWidgetComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, TOCWidgetComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(TOCWidgetComponent).call(this, props));
      _this.handleStartEditing = _this.handleStartEditing.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleEndEditing = _this.handleEndEditing.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        editing: false // true if editing

      };
      return _this;
    }

    (0, _createClass2["default"])(TOCWidgetComponent, [{
      key: "handleStartEditing",
      value: function handleStartEditing() {
        boundMethodCheck(this, TOCWidgetComponent);
        return this.setState({
          editing: true
        });
      }
    }, {
      key: "handleEndEditing",
      value: function handleEndEditing() {
        boundMethodCheck(this, TOCWidgetComponent);
        return this.setState({
          editing: false
        });
      }
    }, {
      key: "renderEditor",
      value: function renderEditor() {
        var editor;

        if (!this.state.editing) {
          return null;
        } // Create editor


        editor = R(TOCWidgetDesignerComponent, {
          design: this.props.design,
          onDesignChange: this.props.onDesignChange
        });
        return R(ModalPopupComponent, {
          showCloseX: true,
          header: "Table of Contents Options",
          onClose: this.handleEndEditing
        }, editor);
      }
    }, {
      key: "renderContent",
      value: function renderContent() {
        return R(TOCWidgetViewComponent, {
          design: this.props.design,
          onDesignChange: this.props.onDesignChange,
          width: this.props.width,
          height: this.props.height,
          tocEntries: this.props.tocEntries,
          onScrollToTOCEntry: this.props.onScrollToTOCEntry
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
        }, this.props.onDesignChange != null ? this.renderEditor() : void 0, R(DropdownWidgetComponent, {
          width: this.props.width,
          height: this.props.height,
          dropdownItems: dropdownItems
        }, this.renderContent()));
      }
    }]);
    return TOCWidgetComponent;
  }(React.Component);

  ;
  TOCWidgetComponent.propTypes = {
    design: PropTypes.object.isRequired,
    // See Map Design.md
    onDesignChange: PropTypes.func,
    // Called with new design. null/undefined for readonly
    width: PropTypes.number,
    height: PropTypes.number,
    tocEntries: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.any,
      widgetId: PropTypes.string.isRequired,
      level: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired
    })),
    onScrollToTOCEntry: PropTypes.func
  };
  return TOCWidgetComponent;
}.call(void 0);

TOCWidgetViewComponent = function () {
  // Displays the contents of the widget
  var TOCWidgetViewComponent =
  /*#__PURE__*/
  function (_React$Component2) {
    (0, _inherits2["default"])(TOCWidgetViewComponent, _React$Component2);

    function TOCWidgetViewComponent() {
      var _this2;

      (0, _classCallCheck2["default"])(this, TOCWidgetViewComponent);
      _this2 = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(TOCWidgetViewComponent).apply(this, arguments));
      _this2.handleEntryClick = _this2.handleEntryClick.bind((0, _assertThisInitialized2["default"])(_this2));
      return _this2;
    }

    (0, _createClass2["default"])(TOCWidgetViewComponent, [{
      key: "handleEntryClick",
      value: function handleEntryClick(tocEntry) {
        var base;
        boundMethodCheck(this, TOCWidgetViewComponent);
        return typeof (base = this.props).onScrollToTOCEntry === "function" ? base.onScrollToTOCEntry(tocEntry.widgetId, tocEntry.id) : void 0;
      }
    }, {
      key: "renderTOCEntry",
      value: function renderTOCEntry(tocEntry, index) {
        var i2, indentation, j, k, level, ref, ref1, value; // Find indentation number (e.g "1.3.2") by counting # backwards that are same level with no level lower

        indentation = "";

        if (this.props.design.numbering) {
          for (level = j = 1, ref = tocEntry.level; 1 <= ref ? j <= ref : j >= ref; level = 1 <= ref ? ++j : --j) {
            value = 0;

            for (i2 = k = 0, ref1 = index; 0 <= ref1 ? k <= ref1 : k >= ref1; i2 = 0 <= ref1 ? ++k : --k) {
              if (this.props.tocEntries[i2].level === level) {
                value += 1;
              } else if (this.props.tocEntries[i2].level < level) {
                value = 0;
              }
            }

            indentation += "".concat(value, ".");
          }

          indentation += " ";
        }

        return R('div', {
          key: index,
          style: {
            paddingLeft: tocEntry.level * 8 - 8
          }
        }, R('a', {
          onClick: this.handleEntryClick.bind(null, tocEntry),
          style: {
            cursor: "pointer"
          }
        }, indentation, R('span', null, tocEntry.text)));
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        var border; // Get border

        border = function () {
          switch (this.props.design.borderWeight) {
            case 0:
              return "none";

            case 1:
              return "solid 1px #f4f4f4";

            case 2:
              return "solid 1px #ccc";

            case 3:
              return "solid 1px #888";
          }
        }.call(this); // Render in a standard width container and then scale up to ensure that widget always looks consistent


        return R('div', {
          style: {
            width: this.props.standardWidth,
            height: this.props.height,
            border: border,
            padding: 5,
            margin: 1 // Render header

          }
        }, R('div', {
          style: {
            fontWeight: "bold"
          }
        }, this.props.design.header), _.map(this.props.tocEntries, function (tocEntry, i) {
          return _this3.renderTOCEntry(tocEntry, i); // Add placeholder if none and editable
        }), this.props.onDesignChange && this.props.tocEntries.length === 0 ? R('div', {
          className: "text-muted"
        }, "Table of Contents will appear here as text blocks with headings are added to the dashboard") : void 0);
      }
    }]);
    return TOCWidgetViewComponent;
  }(React.Component);

  ;
  TOCWidgetViewComponent.propTypes = {
    design: PropTypes.object.isRequired,
    // Design of chart
    onDesignChange: PropTypes.func,
    // Called with new design. null/undefined for readonly
    width: PropTypes.number,
    height: PropTypes.number,
    tocEntries: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.any,
      widgetId: PropTypes.string.isRequired,
      level: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired
    })),
    onScrollToTOCEntry: PropTypes.func
  };
  return TOCWidgetViewComponent;
}.call(void 0);

TOCWidgetDesignerComponent = function () {
  // Designer for TOC widget options
  var TOCWidgetDesignerComponent =
  /*#__PURE__*/
  function (_React$Component3) {
    (0, _inherits2["default"])(TOCWidgetDesignerComponent, _React$Component3);

    function TOCWidgetDesignerComponent() {
      var _this4;

      (0, _classCallCheck2["default"])(this, TOCWidgetDesignerComponent);
      _this4 = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(TOCWidgetDesignerComponent).apply(this, arguments)); // Updates design with the specified changes

      _this4.update = _this4.update.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleMarkdownChange = _this4.handleMarkdownChange.bind((0, _assertThisInitialized2["default"])(_this4));
      return _this4;
    }

    (0, _createClass2["default"])(TOCWidgetDesignerComponent, [{
      key: "update",
      value: function update() {
        boundMethodCheck(this, TOCWidgetDesignerComponent);
        return _update(this.props.design, this.props.onDesignChange, arguments);
      }
    }, {
      key: "handleMarkdownChange",
      value: function handleMarkdownChange(ev) {
        var design;
        boundMethodCheck(this, TOCWidgetDesignerComponent);
        design = _.extend({}, this.props.design, {
          markdown: ev.target.value
        });
        return this.props.onDesignChange(design);
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', null, R(ui.FormGroup, {
          label: "Header"
        }, R(ui.TextInput, {
          value: this.props.design.header || "",
          onChange: this.update("header"),
          placeholder: "None"
        })), R(ui.FormGroup, {
          label: "Border"
        }, R(BorderComponent, {
          value: this.props.design.borderWeight || 0,
          onChange: this.update("borderWeight")
        })), R(ui.FormGroup, {
          label: "Numbering"
        }, R(ui.Radio, {
          inline: true,
          value: this.props.design.numbering || false,
          radioValue: true,
          onChange: this.update("numbering")
        }, "On"), R(ui.Radio, {
          inline: true,
          value: this.props.design.numbering || false,
          radioValue: false,
          onChange: this.update("numbering")
        }, "Off")));
      }
    }]);
    return TOCWidgetDesignerComponent;
  }(React.Component);

  ;
  TOCWidgetDesignerComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired
  };
  return TOCWidgetDesignerComponent;
}.call(void 0);

BorderComponent = function () {
  // Allows setting border heaviness
  var BorderComponent =
  /*#__PURE__*/
  function (_React$Component4) {
    (0, _inherits2["default"])(BorderComponent, _React$Component4);

    function BorderComponent() {
      (0, _classCallCheck2["default"])(this, BorderComponent);
      return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(BorderComponent).apply(this, arguments));
    }

    (0, _createClass2["default"])(BorderComponent, [{
      key: "render",
      value: function render() {
        var value;
        value = this.props.value != null ? this.props.value : this.props.defaultValue;
        return R('div', null, R(ui.Radio, {
          inline: true,
          value: value,
          radioValue: 0,
          onChange: this.props.onChange
        }, "None"), R(ui.Radio, {
          inline: true,
          value: value,
          radioValue: 1,
          onChange: this.props.onChange
        }, "Light"), R(ui.Radio, {
          inline: true,
          value: value,
          radioValue: 2,
          onChange: this.props.onChange
        }, "Medium"), R(ui.Radio, {
          inline: true,
          value: value,
          radioValue: 3,
          onChange: this.props.onChange
        }, "Heavy"));
      }
    }]);
    return BorderComponent;
  }(React.Component);

  ;
  BorderComponent.propTypes = {
    value: PropTypes.number,
    defaultValue: PropTypes.number,
    onChange: PropTypes.func.isRequired
  };
  return BorderComponent;
}.call(void 0);