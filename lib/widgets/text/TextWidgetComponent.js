var AsyncLoadComponent, ClickOutHandler, ContentEditableComponent, ExprInsertModalComponent, ExprUpdateModalComponent, H, ItemsHtmlConverter, R, React, TextWidgetComponent, _, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

_ = require('lodash');

uuid = require('node-uuid');

ContentEditableComponent = require('mwater-expressions-ui').ContentEditableComponent;

ExprInsertModalComponent = require('./ExprInsertModalComponent');

ExprUpdateModalComponent = require('./ExprUpdateModalComponent');

ItemsHtmlConverter = require('./ItemsHtmlConverter');

AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent');

ClickOutHandler = require('react-onclickout');

module.exports = TextWidgetComponent = (function(superClass) {
  extend(TextWidgetComponent, superClass);

  TextWidgetComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func,
    filters: React.PropTypes.array,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    widgetDataSource: React.PropTypes.object.isRequired,
    width: React.PropTypes.number,
    height: React.PropTypes.number
  };

  function TextWidgetComponent(props) {
    this.handleClick = bind(this.handleClick, this);
    this.handleInsertExpr = bind(this.handleInsertExpr, this);
    this.handleCommand = bind(this.handleCommand, this);
    this.handleClickOut = bind(this.handleClickOut, this);
    this.handleFocus = bind(this.handleFocus, this);
    this.handleChange = bind(this.handleChange, this);
    TextWidgetComponent.__super__.constructor.call(this, props);
    this.state = {
      exprValues: {},
      error: null,
      focused: false
    };
  }

  TextWidgetComponent.prototype.isLoadNeeded = function(newProps, oldProps) {
    return !_.isEqual(_.pick(newProps, "filters", "design"), _.pick(oldProps, "filters", "design"));
  };

  TextWidgetComponent.prototype.load = function(props, prevProps, callback) {
    return props.widgetDataSource.getData(props.filters, (function(_this) {
      return function(error, data) {
        return callback({
          error: error,
          exprValues: data || {}
        });
      };
    })(this));
  };

  TextWidgetComponent.prototype.createHtml = function() {
    var exprValues;
    exprValues = !this.state.loading ? this.state.exprValues : {};
    return new ItemsHtmlConverter(this.props.schema, this.props.onDesignChange != null, exprValues).itemsToHtml(this.props.design.items);
  };

  TextWidgetComponent.prototype.handleChange = function(elem) {
    var design;
    design = _.extend({}, this.props.design, {
      items: new ItemsHtmlConverter(this.props.schema, this.props.onDesignChange != null, (!this.state.loading ? this.state.exprValues : {})).elemToItems(elem)
    });
    if (!_.isEqual(design, this.props.design)) {
      return this.props.onDesignChange(design);
    } else {
      return this.forceUpdate();
    }
  };

  TextWidgetComponent.prototype.handleFocus = function() {
    return this.setState({
      focused: true
    });
  };

  TextWidgetComponent.prototype.handleClickOut = function() {
    return this.setState({
      focused: false
    });
  };

  TextWidgetComponent.prototype.handleCommand = function(command, param, ev) {
    if (param.preventDefault) {
      ev = param;
      param = null;
    }
    ev.preventDefault();
    return document.execCommand(command, false, param);
  };

  TextWidgetComponent.prototype.handleInsertExpr = function(expr, label) {
    var html, item;
    item = {
      type: "expr",
      id: uuid.v4(),
      expr: expr
    };
    html = '<div data-embed="' + _.escape(JSON.stringify(item)) + '"></div>';
    if (label) {
      html = _.escape(label + ": ") + html;
    }
    return this.refs.contentEditable.pasteHTML(html);
  };

  TextWidgetComponent.prototype.replaceItem = function(item) {
    var items, replaceItemInItems;
    replaceItemInItems = function(items, item) {
      return _.map(items, function(i) {
        if (i.id === item.id) {
          return item;
        } else if (i.items) {
          return _.extend({}, i, {
            items: replaceItemInItems(i.items, item)
          });
        } else {
          return i;
        }
      });
    };
    items = replaceItemInItems(this.props.design.items || [], item);
    return this.props.onDesignChange(_.extend({}, this.props.design, {
      items: items
    }));
  };

  TextWidgetComponent.prototype.handleClick = function(ev) {
    var item, ref, ref1;
    if (!this.state.focused) {
      this.setState({
        focused: true
      });
    }
    if ((ref = ev.target.dataset) != null ? ref.embed : void 0) {
      item = JSON.parse((ref1 = ev.target.dataset) != null ? ref1.embed : void 0);
      return this.refs.exprUpdateModal.open(item.expr, (function(_this) {
        return function(expr) {
          item.expr = expr;
          return _this.replaceItem(item);
        };
      })(this));
    }
  };

  TextWidgetComponent.prototype.renderMenu = function() {
    return H.div({
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
    })), H.div({
      key: "h1",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "formatBlock", "<H1>")
    }, "h1"), H.div({
      key: "h2",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "formatBlock", "<H2>")
    }, "h2"), H.div({
      key: "h3",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "formatBlock", "<H3>")
    }, "h3"), H.div({
      key: "p",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "formatBlock", "<div>")
    }, "\u00b6"), H.div({
      key: "expr",
      className: "mwater-visualization-text-palette-item",
      onClick: (function(_this) {
        return function(ev) {
          return _this.refs.exprInsertModal.open();
        };
      })(this)
    }, H.i({
      className: "fa fa-caret-up"
    }), " Field"));
  };

  TextWidgetComponent.prototype.renderModals = function() {
    return [
      R(ExprInsertModalComponent, {
        key: "exprInsertModal",
        ref: "exprInsertModal",
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        onInsert: this.handleInsertExpr
      }), R(ExprUpdateModalComponent, {
        key: "exprUpdateModal",
        ref: "exprUpdateModal",
        schema: this.props.schema,
        dataSource: this.props.dataSource
      })
    ];
  };

  TextWidgetComponent.prototype.renderHtml = function() {
    var ref;
    if (this.props.onDesignChange != null) {
      return H.div({
        key: "contents",
        className: "mwater-visualization-text-widget-style-" + (this.props.design.style || "default")
      }, R(ContentEditableComponent, {
        ref: "contentEditable",
        style: {
          outline: "none"
        },
        html: this.createHtml(),
        onChange: this.handleChange,
        onClick: this.handleClick,
        onFocus: this.handleFocus
      }), ((ref = this.props.design.items) != null ? ref[0] : void 0) == null ? H.div({
        key: "placeholder",
        style: {
          color: "#DDD",
          position: "absolute",
          top: 0,
          left: 0
        }
      }, "Click to Edit") : void 0);
    } else {
      return H.div({
        key: "contents",
        className: "mwater-visualization-text-widget-style-" + (this.props.design.style || "default"),
        dangerouslySetInnerHTML: {
          __html: this.createHtml()
        }
      });
    }
  };

  TextWidgetComponent.prototype.render = function() {
    return R(ClickOutHandler, {
      onClickOut: this.handleClickOut
    }, H.div({
      style: {
        position: "relative",
        width: this.props.width,
        height: this.props.height
      }
    }, this.renderModals(), this.renderHtml(), this.state.focused ? this.renderMenu() : void 0));
  };

  return TextWidgetComponent;

})(AsyncLoadComponent);
