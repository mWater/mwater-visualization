var ContentEditableComponent, FloatAffixed, FontColorPaletteItem, FontSizePaletteItem, H, ItemsHtmlConverter, PropTypes, R, React, RichTextComponent, _, removeFormatIcon,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

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
    this.handleEditorClick = bind(this.handleEditorClick, this);
    this.handleCreateLink = bind(this.handleCreateLink, this);
    this.handleCommand = bind(this.handleCommand, this);
    this.handleFocus = bind(this.handleFocus, this);
    this.handleChange = bind(this.handleChange, this);
    this.handleSetFontSize = bind(this.handleSetFontSize, this);
    this.handleInsertExpr = bind(this.handleInsertExpr, this);
    this.handleClick = bind(this.handleClick, this);
    RichTextComponent.__super__.constructor.call(this, props);
    this.state = {
      focused: false
    };
  }

  RichTextComponent.prototype.componentWillMount = function() {
    return document.body.addEventListener('click', this.handleClick, true);
  };

  RichTextComponent.prototype.componentWillUnmount = function() {
    return document.body.removeEventListener('click', this.handleClick, true);
  };

  RichTextComponent.prototype.handleClick = function(ev) {
    if (!this.entireComponent.contains(ev.target) && (!this.paletteComponent || !this.paletteComponent.contains(ev.target))) {
      return this.setState({
        focused: false
      });
    }
  };

  RichTextComponent.prototype.pasteHTML = function(html) {
    return this.refs.contentEditable.pasteHTML(html);
  };

  RichTextComponent.prototype.focus = function() {
    return this.refs.contentEditable.focus();
  };

  RichTextComponent.prototype.handleInsertExpr = function(item) {
    var html;
    html = '<div data-embed="' + _.escape(JSON.stringify(item)) + '"></div>';
    return this.refs.contentEditable.pasteHTML(html);
  };

  RichTextComponent.prototype.handleSetFontSize = function(size) {
    var html;
    html = this.refs.contentEditable.getSelectedHTML();
    if (!html) {
      return alert("Please select text first to set size");
    }
    html = html.replace(/font-size:\s*\d+%;?/g, "");
    return this.refs.contentEditable.pasteHTML(("<span style=\"font-size:" + size + "\">") + html + "</span>");
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
      edges: "over,under,left,right",
      align: "center"
    }, H.div({
      key: "palette",
      className: "mwater-visualization-text-palette",
      ref: ((function(_this) {
        return function(c) {
          return _this.paletteComponent = c;
        };
      })(this))
    }, H.div({
      key: "bold",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "bold", null)
    }, H.b(null, "B")), H.div({
      key: "italic",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "italic", null)
    }, H.i(null, "I")), H.div({
      key: "underline",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "underline", null)
    }, H.span({
      style: {
        textDecoration: "underline"
      }
    }, "U")), R(FontColorPaletteItem, {
      key: "foreColor",
      onSetColor: this.handleCommand.bind(null, "foreColor")
    }), R(FontSizePaletteItem, {
      key: "fontSize",
      onSetSize: this.handleSetFontSize
    }), H.div({
      key: "link",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCreateLink
    }, H.i({
      className: "fa fa-link"
    })), H.div({
      key: "justifyLeft",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "justifyLeft", null)
    }, H.i({
      className: "fa fa-align-left"
    })), H.div({
      key: "justifyCenter",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "justifyCenter", null)
    }, H.i({
      className: "fa fa-align-center"
    })), H.div({
      key: "justifyRight",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "justifyRight", null)
    }, H.i({
      className: "fa fa-align-right"
    })), H.div({
      key: "justifyFull",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "justifyFull", null)
    }, H.i({
      className: "fa fa-align-justify"
    })), H.div({
      key: "insertUnorderedList",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "insertUnorderedList", null)
    }, H.i({
      className: "fa fa-list-ul"
    })), H.div({
      key: "insertOrderedList",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "insertOrderedList", null)
    }, H.i({
      className: "fa fa-list-ol"
    })), this.props.includeHeadings ? [
      H.div({
        key: "h1",
        className: "mwater-visualization-text-palette-item",
        onMouseDown: this.handleCommand.bind(null, "formatBlock", "<H1>")
      }, H.i({
        className: "fa fa-header"
      })), H.div({
        key: "h2",
        className: "mwater-visualization-text-palette-item",
        onMouseDown: this.handleCommand.bind(null, "formatBlock", "<H2>")
      }, H.i({
        className: "fa fa-header",
        style: {
          fontSize: "80%"
        }
      })), H.div({
        key: "p",
        className: "mwater-visualization-text-palette-item",
        onMouseDown: this.handleCommand.bind(null, "formatBlock", "<div>")
      }, "\u00b6")
    ] : void 0, H.div({
      key: "removeFormat",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "removeFormat", null),
      style: {
        paddingLeft: 5,
        paddingRight: 5
      }
    }, H.img({
      src: removeFormatIcon,
      style: {
        height: 20
      }
    })), this.props.extraPaletteButtons));
  };

  RichTextComponent.prototype.renderHtml = function() {
    var ref;
    if (this.props.onItemsChange != null) {
      return H.div({
        key: "contents",
        style: this.props.style,
        className: this.props.className
      }, R(ContentEditableComponent, {
        ref: "contentEditable",
        style: {
          outline: "none"
        },
        html: this.createHtml(),
        onChange: this.handleChange,
        onClick: this.handleEditorClick,
        onFocus: this.handleFocus
      }), ((ref = this.props.items) != null ? ref[0] : void 0) == null ? H.div({
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
      return H.div({
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
    return H.div({
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
