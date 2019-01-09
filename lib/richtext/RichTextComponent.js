var ContentEditableComponent, FloatAffixed, FontColorPaletteItem, FontSizePaletteItem, ItemsHtmlConverter, PropTypes, R, React, RichTextComponent, _, removeFormatIcon,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

_ = require('lodash');

ContentEditableComponent = require('mwater-expressions-ui').ContentEditableComponent;

ItemsHtmlConverter = require('./ItemsHtmlConverter');

FloatAffixed = require('react-float-affixed');

FontColorPaletteItem = require('./FontColorPaletteItem');

FontSizePaletteItem = require('./FontSizePaletteItem');

module.exports = RichTextComponent = (function(superClass) {
  extend(RichTextComponent, superClass);

  RichTextComponent.propTypes = {
    items: PropTypes.array,
    onItemsChange: PropTypes.func,
    onItemClick: PropTypes.func,
    className: PropTypes.string,
    style: PropTypes.object,
    itemsHtmlConverter: PropTypes.object,
    includeHeadings: PropTypes.bool,
    extraPaletteButtons: PropTypes.node
  };

  RichTextComponent.defaultProps = {
    includeHeadings: true,
    items: [],
    itemsHtmlConverter: new ItemsHtmlConverter()
  };

  function RichTextComponent(props) {
    this.renderPaletteContent = bind(this.renderPaletteContent, this);
    this.handleEditorClick = bind(this.handleEditorClick, this);
    this.handleCreateLink = bind(this.handleCreateLink, this);
    this.handleCommand = bind(this.handleCommand, this);
    this.handleBlur = bind(this.handleBlur, this);
    this.handleFocus = bind(this.handleFocus, this);
    this.handleChange = bind(this.handleChange, this);
    this.handleSetFontColor = bind(this.handleSetFontColor, this);
    this.handleSetFontSize = bind(this.handleSetFontSize, this);
    this.handleInsertExpr = bind(this.handleInsertExpr, this);
    this.handleClick = bind(this.handleClick, this);
    RichTextComponent.__super__.constructor.call(this, props);
    this.state = {
      focused: false
    };
  }

  RichTextComponent.prototype.handleClick = function(ev) {
    if (!this.entireComponent.contains(ev.target) && (!this.paletteComponent || !this.paletteComponent.contains(ev.target))) {
      return this.setState({
        focused: false
      });
    }
  };

  RichTextComponent.prototype.pasteHTML = function(html) {
    return this.contentEditable.pasteHTML(html);
  };

  RichTextComponent.prototype.focus = function() {
    return this.contentEditable.focus();
  };

  RichTextComponent.prototype.handleInsertExpr = function(item) {
    var html;
    html = '<div data-embed="' + _.escape(JSON.stringify(item)) + '"></div>';
    return this.contentEditable.pasteHTML(html);
  };

  RichTextComponent.prototype.handleSetFontSize = function(size) {
    var html;
    html = this.contentEditable.getSelectedHTML();
    if (!html) {
      return alert("Please select text first to set size");
    }
    html = html.replace(/font-size:\s*\d+%;?/g, "");
    return this.contentEditable.pasteHTML(("<span style=\"font-size:" + size + "\">") + html + "</span>");
  };

  RichTextComponent.prototype.handleSetFontColor = function(color) {
    var html;
    html = this.contentEditable.getSelectedHTML();
    if (!html) {
      return alert("Please select text first to set color");
    }
    return this.handleCommand("foreColor", color);
  };

  RichTextComponent.prototype.handleChange = function(elem) {
    var items;
    items = this.props.itemsHtmlConverter.convertElemToItems(elem);
    if (!_.isEqual(items, this.props.items)) {
      return this.props.onItemsChange(items);
    } else {
      return this.forceUpdate();
    }
  };

  RichTextComponent.prototype.handleFocus = function() {
    return this.setState({
      focused: true
    });
  };

  RichTextComponent.prototype.handleBlur = function() {
    return this.setState({
      focused: false
    });
  };

  RichTextComponent.prototype.handleCommand = function(command, param, ev) {
    if (ev != null) {
      ev.preventDefault();
    }
    if (command === 'foreColor') {
      document.execCommand("styleWithCSS", null, true);
      document.execCommand(command, false, param);
      return document.execCommand("styleWithCSS", null, false);
    } else {
      return document.execCommand(command, false, param);
    }
  };

  RichTextComponent.prototype.handleCreateLink = function(ev) {
    var url;
    ev.preventDefault();
    url = window.prompt("Enter URL to link to");
    if (url) {
      return document.execCommand("createLink", false, url);
    }
  };

  RichTextComponent.prototype.handleEditorClick = function(ev) {
    var base, item, ref, ref1, ref2, ref3, ref4, ref5;
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
  };

  RichTextComponent.prototype.createHtml = function() {
    return this.props.itemsHtmlConverter.convertItemsToHtml(this.props.items);
  };

  RichTextComponent.prototype.renderPalette = function() {
    return R(FloatAffixed, {
      style: {
        zIndex: 9999
      },
      edges: "over,under,left,right",
      align: "center",
      render: this.renderPaletteContent
    });
  };

  RichTextComponent.prototype.renderPaletteContent = function(schemeName, arg) {
    var edges;
    edges = arg.edges;
    return R('div', {
      key: "palette",
      className: "mwater-visualization-text-palette",
      ref: ((function(_this) {
        return function(c) {
          return _this.paletteComponent = c;
        };
      })(this))
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
    })), this.props.includeHeadings ? [
      R('div', {
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
      }, "\u00b6")
    ] : void 0, R('div', {
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
  };

  RichTextComponent.prototype.renderHtml = function() {
    var ref;
    if (this.props.onItemsChange != null) {
      return R('div', {
        key: "contents",
        style: this.props.style,
        className: this.props.className
      }, R(ContentEditableComponent, {
        ref: (function(_this) {
          return function(c) {
            return _this.contentEditable = c;
          };
        })(this),
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
  };

  RichTextComponent.prototype.render = function() {
    return R('div', {
      style: {
        position: "relative"
      },
      ref: ((function(_this) {
        return function(c) {
          return _this.entireComponent = c;
        };
      })(this))
    }, this.renderHtml(), this.state.focused ? this.renderPalette() : void 0);
  };

  return RichTextComponent;

})(React.Component);

removeFormatIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAr0lEQVQ4y91U2w3CMAy8VB0kbFA2YYVuABOZbsAmGaFscnzgSlGSBgfCB1g6OXbkkx+yHUn0lgFfkN8hHSt/lma71kxdhIv6Dom/HGicflB97NVTD2ACsPQc1En1zUpqKb+pdEumzaVbSNPSRRFL7iNZQ1BstvApsmODZJXUa8A58W9Ea4nwFWkNa0Sc/Q+F1dyDRD30AO6qJV/wtgxNPR3fOEJXALO+5092/0+P9APt7i9xOIlepwAAAABJRU5ErkJggg==";
