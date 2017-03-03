var ExprInsertModalComponent, ExprItemsHtmlConverter, ExprUpdateModalComponent, H, R, React, RichTextComponent, TextComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

_ = require('lodash');

RichTextComponent = require('../../richtext/RichTextComponent');

ExprInsertModalComponent = require('./ExprInsertModalComponent');

ExprUpdateModalComponent = require('./ExprUpdateModalComponent');

ExprItemsHtmlConverter = require('../../richtext/ExprItemsHtmlConverter');

module.exports = TextComponent = (function(superClass) {
  extend(TextComponent, superClass);

  function TextComponent() {
    this.handleAddExpr = bind(this.handleAddExpr, this);
    this.handleItemClick = bind(this.handleItemClick, this);
    this.handleInsertExpr = bind(this.handleInsertExpr, this);
    this.handleItemsChange = bind(this.handleItemsChange, this);
    return TextComponent.__super__.constructor.apply(this, arguments);
  }

  TextComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    exprValues: React.PropTypes.object.isRequired,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    standardWidth: React.PropTypes.number,
    singleRowTable: React.PropTypes.string
  };

  TextComponent.prototype.createItemsHtmlConverter = function() {
    return new ExprItemsHtmlConverter(this.props.schema, this.props.onDesignChange != null, this.props.exprValues, (this.props.onDesignChange != null) && (this.props.singleRowTable != null));
  };

  TextComponent.prototype.handleItemsChange = function(items) {
    var design;
    design = _.extend({}, this.props.design, {
      items: items
    });
    return this.props.onDesignChange(design);
  };

  TextComponent.prototype.handleInsertExpr = function(item) {
    var html;
    html = '<div data-embed="' + _.escape(JSON.stringify(item)) + '"></div>';
    return this.refs.editor.pasteHTML(html);
  };

  TextComponent.prototype.replaceItem = function(item) {
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

  TextComponent.prototype.handleItemClick = function(item) {
    return this.refs.exprUpdateModal.open(item, (function(_this) {
      return function(item) {
        return _this.replaceItem(item);
      };
    })(this));
  };

  TextComponent.prototype.handleAddExpr = function(ev) {
    ev.preventDefault();
    return this.refs.exprInsertModal.open();
  };

  TextComponent.prototype.renderExtraPaletteButtons = function() {
    return H.div({
      key: "expr",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleAddExpr
    }, H.i({
      className: "fa fa-plus"
    }), " Field");
  };

  TextComponent.prototype.renderModals = function() {
    return [
      R(ExprInsertModalComponent, {
        key: "exprInsertModal",
        ref: "exprInsertModal",
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        onInsert: this.handleInsertExpr,
        singleRowTable: this.props.singleRowTable
      }), R(ExprUpdateModalComponent, {
        key: "exprUpdateModal",
        ref: "exprUpdateModal",
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        singleRowTable: this.props.singleRowTable
      })
    ];
  };

  TextComponent.prototype.render = function() {
    var style;
    style = {
      position: "relative"
    };
    if (this.props.standardWidth && this.props.standardWidth !== this.props.width) {
      style.width = this.props.standardWidth;
      style.height = this.props.height * (this.props.standardWidth / this.props.width);
      style.transform = "scale(" + (this.props.width / this.props.standardWidth) + ", " + (this.props.width / this.props.standardWidth) + ")";
      style.transformOrigin = "0 0";
    } else {
      style.width = this.props.width;
      style.height = this.props.height;
    }
    return H.div(null, this.renderModals(), R(RichTextComponent, {
      ref: "editor",
      className: "mwater-visualization-text-widget-style-" + (this.props.design.style || "default"),
      style: style,
      items: this.props.design.items,
      onItemsChange: this.props.onDesignChange ? this.handleItemsChange : void 0,
      onItemClick: this.handleItemClick,
      itemsHtmlConverter: this.createItemsHtmlConverter(),
      includeHeadings: this.props.design.style === "default" || !this.props.design.style,
      extraPaletteButtons: this.renderExtraPaletteButtons()
    }));
  };

  return TextComponent;

})(React.Component);
