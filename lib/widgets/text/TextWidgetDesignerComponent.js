var ContentEditableComponent, ExprInsertModalComponent, ExprUpdateModalComponent, H, ItemsHtmlConverter, R, React, TextWidgetDesignerComponent, _, uuid,
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

module.exports = TextWidgetDesignerComponent = (function(superClass) {
  extend(TextWidgetDesignerComponent, superClass);

  function TextWidgetDesignerComponent() {
    this.handleClick = bind(this.handleClick, this);
    this.handleInsertEmbed = bind(this.handleInsertEmbed, this);
    this.handleInsertExpr = bind(this.handleInsertExpr, this);
    this.handleCommand = bind(this.handleCommand, this);
    this.handleChange = bind(this.handleChange, this);
    return TextWidgetDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  TextWidgetDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func,
    onStopEditing: React.PropTypes.func,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired
  };

  TextWidgetDesignerComponent.prototype.focus = function() {
    return this.refs.contentEditable.focus();
  };

  TextWidgetDesignerComponent.prototype.createHtml = function() {
    return new ItemsHtmlConverter(this.props.schema, true).itemsToHtml(this.props.design.items);
  };

  TextWidgetDesignerComponent.prototype.handleChange = function(elem) {
    var design;
    design = _.extend({}, this.props.design, {
      items: new ItemsHtmlConverter(this.props.schema, true).elemToItems(elem)
    });
    if (!_.isEqual(design, this.props.design)) {
      return this.props.onDesignChange(design);
    } else {
      return this.forceUpdate();
    }
  };

  TextWidgetDesignerComponent.prototype.handleCommand = function(command, ev) {
    ev.preventDefault();
    return document.execCommand(command);
  };

  TextWidgetDesignerComponent.prototype.handleInsertExpr = function(expr) {
    return this.handleInsertEmbed({
      type: "expr",
      id: uuid.v4(),
      expr: expr
    });
  };

  TextWidgetDesignerComponent.prototype.handleInsertEmbed = function(item) {
    return this.refs.contentEditable.pasteHTML('<div data-embed="' + _.escape(JSON.stringify(item)) + '"></div>');
  };

  TextWidgetDesignerComponent.prototype.replaceItem = function(item) {
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

  TextWidgetDesignerComponent.prototype.handleClick = function(ev) {
    var item, ref, ref1;
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

  TextWidgetDesignerComponent.prototype.renderMenu = function() {
    return H.div({
      className: "mwater-visualization-text-palette"
    }, H.div({
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "bold")
    }, H.b(null, "B")), H.div({
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "italic")
    }, H.i(null, "I")), H.div({
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "underline")
    }, H.span({
      style: {
        textDecoration: "underline"
      }
    }, "U")), H.div({
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "justifyLeft")
    }, H.i({
      className: "fa fa-align-left"
    })), H.div({
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "justifyCenter")
    }, H.i({
      className: "fa fa-align-center"
    })), H.div({
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "justifyRight")
    }, H.i({
      className: "fa fa-align-right"
    })), H.div({
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "justifyFull")
    }, H.i({
      className: "fa fa-align-justify"
    })), H.div({
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "insertUnorderedList")
    }, H.i({
      className: "fa fa-list-ul"
    })), H.div({
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "insertOrderedList")
    }, H.i({
      className: "fa fa-list-ol"
    })), H.div({
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleCommand.bind(null, "insertOrderedList")
    }, H.i({
      className: "fa fa-list-ol"
    })), H.div({
      className: "mwater-visualization-text-palette-item",
      onClick: (function(_this) {
        return function(ev) {
          return _this.refs.exprInsertModal.open();
        };
      })(this)
    }, H.span(null, "f", H.sub(null, "x"))), this.props.onStopEditing ? H.div({
      className: "mwater-visualization-text-palette-item",
      onClick: this.props.onStopEditing
    }, "Close") : void 0);
  };

  TextWidgetDesignerComponent.prototype.renderModals = function() {
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

  TextWidgetDesignerComponent.prototype.render = function() {
    return H.div({
      style: {
        position: "relative"
      }
    }, this.renderModals(), H.div({
      className: "mwater-visualization-text-widget-style-" + (this.props.design.style || "default")
    }, R(ContentEditableComponent, {
      ref: "contentEditable",
      style: {
        outline: "none"
      },
      html: this.createHtml(),
      onChange: this.handleChange,
      onClick: this.handleClick
    })), this.renderMenu());
  };

  return TextWidgetDesignerComponent;

})(React.Component);
