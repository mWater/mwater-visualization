"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var ExprInsertModalComponent,
    ExprItemsHtmlConverter,
    ExprUpdateModalComponent,
    PropTypes,
    R,
    React,
    RichTextComponent,
    TextComponent,
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
RichTextComponent = require('../../richtext/RichTextComponent');
ExprInsertModalComponent = require('./ExprInsertModalComponent');
ExprUpdateModalComponent = require('./ExprUpdateModalComponent');
ExprItemsHtmlConverter = require('../../richtext/ExprItemsHtmlConverter'); // Text component which is provided with the data it needs, rather than loading it.
// Used by TextWidgetComponent and also by other components that embed text fields

module.exports = TextComponent = function () {
  var TextComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(TextComponent, _React$Component);

    function TextComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, TextComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(TextComponent).apply(this, arguments));
      _this.handleItemsChange = _this.handleItemsChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleInsertExpr = _this.handleInsertExpr.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleItemClick = _this.handleItemClick.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleAddExpr = _this.handleAddExpr.bind((0, _assertThisInitialized2["default"])(_this));
      _this.refRichTextComponent = _this.refRichTextComponent.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(TextComponent, [{
      key: "createItemsHtmlConverter",
      value: function createItemsHtmlConverter() {
        // Display summaries if in design more and singleRowTable is set
        // Only replace named strings if not editing
        return new ExprItemsHtmlConverter(this.props.schema, this.props.onDesignChange != null, this.props.exprValues, this.props.onDesignChange != null && this.props.singleRowTable != null, this.props.onDesignChange == null ? this.props.namedStrings : void 0, this.context.locale);
      }
    }, {
      key: "handleItemsChange",
      value: function handleItemsChange(items) {
        var design;
        boundMethodCheck(this, TextComponent);
        design = _.extend({}, this.props.design, {
          items: items
        });
        return this.props.onDesignChange(design);
      }
    }, {
      key: "handleInsertExpr",
      value: function handleInsertExpr(item) {
        var html;
        boundMethodCheck(this, TextComponent);
        html = '<div data-embed="' + _.escape(JSON.stringify(item)) + '"></div>';
        return this.editor.pasteHTML(html);
      }
    }, {
      key: "replaceItem",
      value: function replaceItem(item) {
        var items, _replaceItemInItems;

        _replaceItemInItems = function replaceItemInItems(items, item) {
          return _.map(items, function (i) {
            if (i.id === item.id) {
              return item;
            } else if (i.items) {
              return _.extend({}, i, {
                items: _replaceItemInItems(i.items, item)
              });
            } else {
              return i;
            }
          });
        };

        items = _replaceItemInItems(this.props.design.items || [], item);
        return this.props.onDesignChange(_.extend({}, this.props.design, {
          items: items
        }));
      }
    }, {
      key: "handleItemClick",
      value: function handleItemClick(item) {
        var _this2 = this;

        boundMethodCheck(this, TextComponent);
        return this.exprUpdateModal.open(item, function (item) {
          // Replace in items
          return _this2.replaceItem(item);
        });
      }
    }, {
      key: "handleAddExpr",
      value: function handleAddExpr(ev) {
        boundMethodCheck(this, TextComponent);
        ev.preventDefault();
        return this.exprInsertModal.open();
      }
    }, {
      key: "renderExtraPaletteButtons",
      value: function renderExtraPaletteButtons() {
        return R('div', {
          key: "expr",
          className: "mwater-visualization-text-palette-item",
          onMouseDown: this.handleAddExpr
        }, R('i', {
          className: "fa fa-plus"
        }), " Field");
      }
    }, {
      key: "renderModals",
      value: function renderModals() {
        var _this3 = this;

        return [R(ExprInsertModalComponent, {
          key: "exprInsertModal",
          ref: function ref(c) {
            return _this3.exprInsertModal = c;
          },
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          onInsert: this.handleInsertExpr,
          singleRowTable: this.props.singleRowTable
        }), R(ExprUpdateModalComponent, {
          key: "exprUpdateModal",
          ref: function ref(c) {
            return _this3.exprUpdateModal = c;
          },
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          singleRowTable: this.props.singleRowTable
        })];
      }
    }, {
      key: "refRichTextComponent",
      value: function refRichTextComponent(c) {
        boundMethodCheck(this, TextComponent);
        return this.editor = c;
      }
    }, {
      key: "render",
      value: function render() {
        var style;
        style = {
          position: "relative"
        }; // Handle scaled case

        if (this.props.standardWidth && this.props.standardWidth !== this.props.width) {
          style.width = this.props.standardWidth;
          style.height = this.props.height * (this.props.standardWidth / this.props.width);
          style.transform = "scale(".concat(this.props.width / this.props.standardWidth, ", ").concat(this.props.width / this.props.standardWidth, ")");
          style.transformOrigin = "0 0";
        } else {
          style.width = this.props.width;
          style.height = this.props.height;
        }

        return R('div', null, this.renderModals(), R(RichTextComponent, {
          ref: this.refRichTextComponent,
          className: "mwater-visualization-text-widget-style-".concat(this.props.design.style || "default"),
          style: style,
          items: this.props.design.items,
          onItemsChange: this.props.onDesignChange ? this.handleItemsChange : void 0,
          onItemClick: this.handleItemClick,
          itemsHtmlConverter: this.createItemsHtmlConverter(),
          includeHeadings: this.props.design.style === "default" || !this.props.design.style,
          extraPaletteButtons: this.renderExtraPaletteButtons()
        }));
      }
    }]);
    return TextComponent;
  }(React.Component);

  ;
  TextComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    // Called with new design. null/undefined for readonly
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    // Data source to use for chart
    exprValues: PropTypes.object.isRequired,
    // Expression values
    width: PropTypes.number,
    height: PropTypes.number,
    standardWidth: PropTypes.number,
    singleRowTable: PropTypes.string,
    // Table that is filtered to have one row
    namedStrings: PropTypes.object // Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget

  };
  TextComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return TextComponent;
}.call(void 0);