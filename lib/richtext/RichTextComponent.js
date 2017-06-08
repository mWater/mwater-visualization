var ClickOutHandler, ContentEditableComponent, FloatAffixed, H, ItemsHtmlConverter, PropTypes, R, React, RichTextComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

R = React.createElement;

_ = require('lodash');

ContentEditableComponent = require('mwater-expressions-ui').ContentEditableComponent;

ClickOutHandler = require('react-onclickout');

ItemsHtmlConverter = require('./ItemsHtmlConverter');

FloatAffixed = require('react-float-affixed');

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
    this.handleClick = bind(this.handleClick, this);
    this.handleCreateLink = bind(this.handleCreateLink, this);
    this.handleCommand = bind(this.handleCommand, this);
    this.handleBlur = bind(this.handleBlur, this);
    this.handleFocus = bind(this.handleFocus, this);
    this.handleChange = bind(this.handleChange, this);
    this.handleInsertExpr = bind(this.handleInsertExpr, this);
    RichTextComponent.__super__.constructor.call(this, props);
    this.state = {
      focused: false
    };
  }

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
    if (param.preventDefault) {
      ev = param;
      param = null;
    }
    ev.preventDefault();
    return document.execCommand(command, false, param);
  };

  RichTextComponent.prototype.handleCreateLink = function(ev) {
    var url;
    ev.preventDefault();
    url = window.prompt("Enter URL to link to");
    if (url) {
      return document.execCommand("createLink", false, url);
    }
  };

  RichTextComponent.prototype.handleClick = function(ev) {
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
      className: "mwater-visualization-text-palette"
    }, H.div({
      key: "bold",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "bold")
    }, H.b(null, "B")), H.div({
      key: "italic",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "italic")
    }, H.i(null, "I")), H.div({
      key: "underline",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "underline")
    }, H.span({
      style: {
        textDecoration: "underline"
      }
    }, "U")), H.div({
      key: "link",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCreateLink
    }, H.i({
      className: "fa fa-link"
    })), H.div({
      key: "justifyLeft",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "justifyLeft")
    }, H.i({
      className: "fa fa-align-left"
    })), H.div({
      key: "justifyCenter",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "justifyCenter")
    }, H.i({
      className: "fa fa-align-center"
    })), H.div({
      key: "justifyRight",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "justifyRight")
    }, H.i({
      className: "fa fa-align-right"
    })), H.div({
      key: "justifyFull",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "justifyFull")
    }, H.i({
      className: "fa fa-align-justify"
    })), H.div({
      key: "insertUnorderedList",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "insertUnorderedList")
    }, H.i({
      className: "fa fa-list-ul"
    })), H.div({
      key: "insertOrderedList",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "insertOrderedList")
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
    ] : void 0, this.props.extraPaletteButtons));
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
        onClick: this.handleClick,
        onFocus: this.handleFocus,
        onBlur: this.handleBlur
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
      }
    }, this.renderHtml(), this.state.focused ? this.renderPalette() : void 0);
  };

  return RichTextComponent;

})(React.Component);
