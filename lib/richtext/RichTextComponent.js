"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var ContentEditableComponent,
    FloatAffixed,
    FontColorPaletteItem,
    FontSizePaletteItem,
    ItemsHtmlConverter,
    PropTypes,
    R,
    React,
    RichTextComponent,
    _,
    removeFormatIcon,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
_ = require('lodash');
ContentEditableComponent = require('mwater-expressions-ui').ContentEditableComponent;
ItemsHtmlConverter = require('./ItemsHtmlConverter');
FloatAffixed = require('react-float-affixed');
FontColorPaletteItem = require('./FontColorPaletteItem');
FontSizePaletteItem = require('./FontSizePaletteItem');

module.exports = RichTextComponent = function () {
  var RichTextComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(RichTextComponent, _React$Component);

    function RichTextComponent(props) {
      var _this;

      (0, _classCallCheck2.default)(this, RichTextComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(RichTextComponent).call(this, props));
      _this.handleClick = _this.handleClick.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleInsertExpr = _this.handleInsertExpr.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleSetFontSize = _this.handleSetFontSize.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleSetFontColor = _this.handleSetFontColor.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleChange = _this.handleChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleFocus = _this.handleFocus.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleBlur = _this.handleBlur.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this))); // Perform a command such as bold, underline, etc.

      _this.handleCommand = _this.handleCommand.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleCreateLink = _this.handleCreateLink.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleEditorClick = _this.handleEditorClick.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.renderPaletteContent = _this.renderPaletteContent.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.refContentEditable = _this.refContentEditable.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.state = {
        focused: false
      };
      return _this;
    }

    (0, _createClass2.default)(RichTextComponent, [{
      key: "handleClick",
      value: function handleClick(ev) {
        boundMethodCheck(this, RichTextComponent); // If click is in component or in palette component, ignore, otherwise remove focus

        if (!this.entireComponent.contains(ev.target) && (!this.paletteComponent || !this.paletteComponent.contains(ev.target))) {
          return this.setState({
            focused: false
          });
        }
      } // Paste HTML in

    }, {
      key: "pasteHTML",
      value: function pasteHTML(html) {
        return this.contentEditable.pasteHTML(html);
      }
    }, {
      key: "focus",
      value: function focus() {
        return this.contentEditable.focus();
      }
    }, {
      key: "handleInsertExpr",
      value: function handleInsertExpr(item) {
        var html;
        boundMethodCheck(this, RichTextComponent);
        html = '<div data-embed="' + _.escape(JSON.stringify(item)) + '"></div>';
        return this.contentEditable.pasteHTML(html);
      }
    }, {
      key: "handleSetFontSize",
      value: function handleSetFontSize(size) {
        var html;
        boundMethodCheck(this, RichTextComponent); // Requires a selection

        html = this.contentEditable.getSelectedHTML();

        if (!html) {
          return alert("Please select text first to set size");
        } // Clear existing font-size styles. This is clearly a hack, but font sizes are absolute in execCommand which
        // doesn't mix with our various dashboard stylings, so we need to use percentages


        html = html.replace(/font-size:\s*\d+%;?/g, "");
        return this.contentEditable.pasteHTML("<span style=\"font-size:".concat(size, "\">") + html + "</span>");
      }
    }, {
      key: "handleSetFontColor",
      value: function handleSetFontColor(color) {
        var html;
        boundMethodCheck(this, RichTextComponent); // Requires a selection

        html = this.contentEditable.getSelectedHTML();

        if (!html) {
          return alert("Please select text first to set color");
        }

        return this.handleCommand("foreColor", color);
      }
    }, {
      key: "handleChange",
      value: function handleChange(elem) {
        var items;
        boundMethodCheck(this, RichTextComponent);
        items = this.props.itemsHtmlConverter.convertElemToItems(elem); // Check if changed

        if (!_.isEqual(items, this.props.items)) {
          return this.props.onItemsChange(items);
        } else {
          // Re-render as HTML may have been mangled and needs a round-trip
          return this.forceUpdate();
        }
      }
    }, {
      key: "handleFocus",
      value: function handleFocus() {
        boundMethodCheck(this, RichTextComponent);
        return this.setState({
          focused: true
        });
      }
    }, {
      key: "handleBlur",
      value: function handleBlur() {
        boundMethodCheck(this, RichTextComponent);
        return this.setState({
          focused: false
        });
      }
    }, {
      key: "handleCommand",
      value: function handleCommand(command, param, ev) {
        boundMethodCheck(this, RichTextComponent); // Don't lose focus

        if (ev != null) {
          ev.preventDefault();
        } // Use CSS for some commands 


        if (command === 'foreColor') {
          document.execCommand("styleWithCSS", null, true);
          document.execCommand(command, false, param);
          return document.execCommand("styleWithCSS", null, false);
        } else {
          return document.execCommand(command, false, param);
        }
      }
    }, {
      key: "handleCreateLink",
      value: function handleCreateLink(ev) {
        var url;
        boundMethodCheck(this, RichTextComponent); // Don't lose focus

        ev.preventDefault(); // Ask for url

        url = window.prompt("Enter URL to link to");

        if (url) {
          return document.execCommand("createLink", false, url);
        }
      }
    }, {
      key: "handleEditorClick",
      value: function handleEditorClick(ev) {
        var base, item, ref, ref1, ref2, ref3, ref4, ref5;
        boundMethodCheck(this, RichTextComponent); // Be sure focused

        if (!this.state.focused) {
          this.setState({
            focused: true
          });
        }

        if (((ref = ev.target.dataset) != null ? ref.embed : void 0) || ((ref1 = ev.target.parentElement) != null ? (ref2 = ref1.dataset) != null ? ref2.embed : void 0 : void 0)) {
          item = JSON.parse(((ref3 = ev.target.dataset) != null ? ref3.embed : void 0) || ((ref4 = ev.target.parentElement) != null ? (ref5 = ref4.dataset) != null ? ref5.embed : void 0 : void 0));

          if (item != null) {
            return typeof (base = this.props).onItemClick === "function" ? base.onItemClick(item) : void 0;
          }
        }
      }
    }, {
      key: "createHtml",
      value: function createHtml() {
        return this.props.itemsHtmlConverter.convertItemsToHtml(this.props.items);
      }
    }, {
      key: "renderPalette",
      value: function renderPalette() {
        return R(FloatAffixed, {
          style: {
            zIndex: 9999
          },
          edges: "over,under,left,right",
          align: "center",
          render: this.renderPaletteContent
        });
      }
    }, {
      key: "renderPaletteContent",
      value: function renderPaletteContent(schemeName, _ref) {
        var _this2 = this;

        var edges = _ref.edges;
        boundMethodCheck(this, RichTextComponent);
        return R('div', {
          key: "palette",
          className: "mwater-visualization-text-palette",
          ref: function ref(c) {
            return _this2.paletteComponent = c;
          }
        }, R('div', {
          key: "bold",
          className: "mwater-visualization-text-palette-item",
          onMouseDown: this.handleCommand.bind(null, "bold", null)
        }, R('b', null, "B")), R('div', {
          key: "italic",
          className: "mwater-visualization-text-palette-item",
          onMouseDown: this.handleCommand.bind(null, "italic", null)
        }, R('i', null, "I")), R('div', {
          key: "underline",
          className: "mwater-visualization-text-palette-item",
          onMouseDown: this.handleCommand.bind(null, "underline", null)
        }, R('span', {
          style: {
            textDecoration: "underline"
          }
        }, "U")), R(FontColorPaletteItem, {
          key: "foreColor",
          onSetColor: this.handleSetFontColor,
          position: schemeName === "over" ? "under" : "over"
        }), R(FontSizePaletteItem, {
          key: "fontSize",
          onSetSize: this.handleSetFontSize,
          position: schemeName === "over" ? "under" : "over"
        }), R('div', {
          key: "link",
          className: "mwater-visualization-text-palette-item",
          onMouseDown: this.handleCreateLink
        }, R('i', {
          className: "fa fa-link"
        })), R('div', {
          key: "justifyLeft",
          className: "mwater-visualization-text-palette-item",
          onMouseDown: this.handleCommand.bind(null, "justifyLeft", null)
        }, R('i', {
          className: "fa fa-align-left"
        })), R('div', {
          key: "justifyCenter",
          className: "mwater-visualization-text-palette-item",
          onMouseDown: this.handleCommand.bind(null, "justifyCenter", null)
        }, R('i', {
          className: "fa fa-align-center"
        })), R('div', {
          key: "justifyRight",
          className: "mwater-visualization-text-palette-item",
          onMouseDown: this.handleCommand.bind(null, "justifyRight", null)
        }, R('i', {
          className: "fa fa-align-right"
        })), R('div', {
          key: "justifyFull",
          className: "mwater-visualization-text-palette-item",
          onMouseDown: this.handleCommand.bind(null, "justifyFull", null)
        }, R('i', {
          className: "fa fa-align-justify"
        })), R('div', {
          key: "insertUnorderedList",
          className: "mwater-visualization-text-palette-item",
          onMouseDown: this.handleCommand.bind(null, "insertUnorderedList", null)
        }, R('i', {
          className: "fa fa-list-ul"
        })), R('div', {
          key: "insertOrderedList",
          className: "mwater-visualization-text-palette-item",
          onMouseDown: this.handleCommand.bind(null, "insertOrderedList", null)
        }, R('i', {
          className: "fa fa-list-ol"
        })), this.props.includeHeadings ? [R('div', {
          key: "h1",
          className: "mwater-visualization-text-palette-item",
          onMouseDown: this.handleCommand.bind(null, "formatBlock", "<H1>")
        }, R('i', {
          className: "fa fa-header"
        })), R('div', {
          key: "h2",
          className: "mwater-visualization-text-palette-item",
          onMouseDown: this.handleCommand.bind(null, "formatBlock", "<H2>")
        }, R('i', {
          className: "fa fa-header",
          style: {
            fontSize: "80%"
          }
        })), R('div', {
          key: "p",
          className: "mwater-visualization-text-palette-item",
          onMouseDown: this.handleCommand.bind(null, "formatBlock", "<div>")
        }, "\xB6")] : void 0, R('div', {
          key: "removeFormat",
          className: "mwater-visualization-text-palette-item",
          onMouseDown: this.handleCommand.bind(null, "removeFormat", null),
          style: {
            paddingLeft: 5,
            paddingRight: 5
          }
        }, R('img', {
          src: removeFormatIcon,
          style: {
            height: 20
          }
        })), this.props.extraPaletteButtons);
      }
    }, {
      key: "refContentEditable",
      value: function refContentEditable(c) {
        boundMethodCheck(this, RichTextComponent);
        return this.contentEditable = c;
      }
    }, {
      key: "renderHtml",
      value: function renderHtml() {
        var ref;

        if (this.props.onItemsChange != null) {
          return R('div', {
            key: "contents",
            style: this.props.style,
            className: this.props.className
          }, R(ContentEditableComponent, {
            ref: this.refContentEditable,
            style: {
              outline: "none"
            },
            html: this.createHtml(),
            onChange: this.handleChange,
            onClick: this.handleEditorClick,
            onFocus: this.handleFocus,
            onBlur: this.handleBlur
          }), ((ref = this.props.items) != null ? ref[0] : void 0) == null ? R('div', {
            key: "placeholder",
            style: {
              color: "#DDD",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              pointerEvents: "none"
            }
          }, "Click to Edit") : void 0);
        } else {
          return R('div', {
            key: "contents",
            style: this.props.style,
            className: this.props.className,
            dangerouslySetInnerHTML: {
              __html: this.createHtml()
            }
          });
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        return R('div', {
          style: {
            position: "relative"
          },
          ref: function ref(c) {
            return _this3.entireComponent = c;
          }
        }, this.renderHtml(), this.state.focused ? this.renderPalette() : void 0);
      }
    }]);
    return RichTextComponent;
  }(React.Component);

  ;
  RichTextComponent.propTypes = {
    // Items (content) to display. See ItemsHtmlConverter
    items: PropTypes.array,
    onItemsChange: PropTypes.func,
    // Called with new items
    onItemClick: PropTypes.func,
    className: PropTypes.string,
    // Optional className of editor wrapper
    style: PropTypes.object,
    // Optional style of editor wrapper
    // Converter to use for editing
    itemsHtmlConverter: PropTypes.object,
    // True (default) to include heading h1, h2 in palette
    includeHeadings: PropTypes.bool,
    // Extra buttons to put in palette
    extraPaletteButtons: PropTypes.node
  };
  RichTextComponent.defaultProps = {
    includeHeadings: true,
    items: [],
    itemsHtmlConverter: new ItemsHtmlConverter()
  };
  return RichTextComponent;
}.call(void 0);

removeFormatIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAr0lEQVQ4y91U2w3CMAy8VB0kbFA2YYVuABOZbsAmGaFscnzgSlGSBgfCB1g6OXbkkx+yHUn0lgFfkN8hHSt/lma71kxdhIv6Dom/HGicflB97NVTD2ACsPQc1En1zUpqKb+pdEumzaVbSNPSRRFL7iNZQ1BstvApsmODZJXUa8A58W9Ea4nwFWkNa0Sc/Q+F1dyDRD30AO6qJV/wtgxNPR3fOEJXALO+5092/0+P9APt7i9xOIlepwAAAABJRU5ErkJggg==";