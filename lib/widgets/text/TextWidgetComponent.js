var AsyncLoadComponent, ExprInsertModalComponent, ExprItemsHtmlConverter, ExprUpdateModalComponent, H, R, React, RichTextComponent, TextWidgetComponent, _,
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

AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent');

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
    height: React.PropTypes.number,
    standardWidth: React.PropTypes.number,
    singleRowTable: React.PropTypes.string
  };

  function TextWidgetComponent(props) {
    this.handleAddExpr = bind(this.handleAddExpr, this);
    this.handleItemClick = bind(this.handleItemClick, this);
    this.handleInsertExpr = bind(this.handleInsertExpr, this);
    this.handleItemsChange = bind(this.handleItemsChange, this);
    TextWidgetComponent.__super__.constructor.call(this, props);
    this.state = {
      exprValues: {},
      error: null
    };
  }

  TextWidgetComponent.prototype.isLoadNeeded = function(newProps, oldProps) {
    var getExprItems;
    getExprItems = function(items) {
      var exprItems, item, j, len, ref;
      exprItems = [];
      ref = items || [];
      for (j = 0, len = ref.length; j < len; j++) {
        item = ref[j];
        if (item.type === "expr") {
          exprItems.push(item);
        }
        if (item.items) {
          exprItems = exprItems.concat(getExprItems(item.items));
        }
      }
      return exprItems;
    };
    return !_.isEqual(newProps.filters, oldProps.filters) || !_.isEqual(getExprItems(newProps.design.items), getExprItems(oldProps.design.items));
  };

  TextWidgetComponent.prototype.load = function(props, prevProps, callback) {
    return props.widgetDataSource.getData(props.design, props.filters, (function(_this) {
      return function(error, data) {
        return callback({
          error: error,
          exprValues: data || {}
        });
      };
    })(this));
  };

  TextWidgetComponent.prototype.createItemsHtmlConverter = function() {
    var exprValues;
    exprValues = !this.state.loading ? this.state.exprValues : {};
    return new ExprItemsHtmlConverter(this.props.schema, this.props.onDesignChange != null, exprValues, (this.props.onDesignChange != null) && (this.props.singleRowTable != null));
  };

  TextWidgetComponent.prototype.handleItemsChange = function(items) {
    var design;
    design = _.extend({}, this.props.design, {
      items: items
    });
    return this.props.onDesignChange(design);
  };

  TextWidgetComponent.prototype.handleInsertExpr = function(item) {
    var html;
    html = '<div data-embed="' + _.escape(JSON.stringify(item)) + '"></div>';
    return this.refs.editor.pasteHTML(html);
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

  TextWidgetComponent.prototype.handleItemClick = function(item) {
    return this.refs.exprUpdateModal.open(item, (function(_this) {
      return function(item) {
        return _this.replaceItem(item);
      };
    })(this));
  };

  TextWidgetComponent.prototype.handleAddExpr = function(ev) {
    ev.preventDefault();
    return this.refs.exprInsertModal.open();
  };

  TextWidgetComponent.prototype.renderExtraPaletteButtons = function() {
    return H.div({
      key: "expr",
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleAddExpr
    }, H.i({
      className: "fa fa-plus"
    }), " Field");
  };

  TextWidgetComponent.prototype.renderModals = function() {
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

  TextWidgetComponent.prototype.render = function() {
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
      includeHeadings: this.props.design.style !== "title",
      extraPaletteButtons: this.renderExtraPaletteButtons()
    }));
  };

  return TextWidgetComponent;

})(AsyncLoadComponent);
