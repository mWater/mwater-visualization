var AsyncLoadComponent, PropTypes, R, React, TextComponent, TextWidget, TextWidgetComponent, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

_ = require('lodash');

TextComponent = require('./TextComponent');

TextWidget = require('./TextWidget');

AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent');

module.exports = TextWidgetComponent = (function(superClass) {
  extend(TextWidgetComponent, superClass);

  TextWidgetComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    filters: PropTypes.array,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    widgetDataSource: PropTypes.object.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    standardWidth: PropTypes.number,
    singleRowTable: PropTypes.string,
    namedStrings: PropTypes.object
  };

  function TextWidgetComponent(props) {
    TextWidgetComponent.__super__.constructor.call(this, props);
    this.state = {
      exprValues: {},
      error: null,
      cacheExpiry: props.dataSource.getCacheExpiry()
    };
  }

  TextWidgetComponent.prototype.isLoadNeeded = function(newProps, oldProps) {
    var getExprItems;
    getExprItems = function(items) {
      var exprItems, i, item, len, ref;
      exprItems = [];
      ref = items || [];
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        if (item.type === "expr") {
          exprItems.push(item);
        }
        if (item.items) {
          exprItems = exprItems.concat(getExprItems(item.items));
        }
      }
      return exprItems;
    };
    return !_.isEqual(newProps.filters, oldProps.filters) || !_.isEqual(getExprItems(newProps.design.items), getExprItems(oldProps.design.items)) || newProps.dataSource.getCacheExpiry() !== this.state.cacheExpiry;
  };

  TextWidgetComponent.prototype.load = function(props, prevProps, callback) {
    var widget;
    widget = new TextWidget();
    if (widget.getExprItems(props.design.items).length === 0) {
      callback({
        error: null,
        exprValues: {}
      }, props.dataSource.getCacheExpiry());
      return;
    }
    return props.widgetDataSource.getData(props.design, props.filters, (function(_this) {
      return function(error, data) {
        return callback({
          error: error,
          exprValues: data || {},
          cacheExpiry: props.dataSource.getCacheExpiry()
        });
      };
    })(this));
  };

  TextWidgetComponent.prototype.scrollToTOCEntry = function(entryId) {
    var entries, entry;
    entries = this.divComp.querySelectorAll("h1,h2,h3,h4,h5,h6,h7,h8,h9");
    entry = entries[entryId];
    if (entry) {
      return entry.scrollIntoView(true);
    }
  };

  TextWidgetComponent.prototype.render = function() {
    var exprValues;
    exprValues = !this.state.loading ? this.state.exprValues : {};
    return R('div', {
      ref: ((function(_this) {
        return function(c) {
          return _this.divComp = c;
        };
      })(this))
    }, R(TextComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      filters: this.props.filters,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      exprValues: exprValues,
      width: this.props.width,
      height: this.props.height,
      standardWidth: this.props.standardWidth,
      singleRowTable: this.props.singleRowTable,
      namedStrings: this.props.namedStrings
    }));
  };

  return TextWidgetComponent;

})(AsyncLoadComponent);
