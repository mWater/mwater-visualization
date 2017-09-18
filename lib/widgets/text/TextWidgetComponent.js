var AsyncLoadComponent, H, PropTypes, R, React, TextComponent, TextWidgetComponent, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

R = React.createElement;

_ = require('lodash');

TextComponent = require('./TextComponent');

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
    var base;
    TextWidgetComponent.__super__.constructor.call(this, props);
    this.state = {
      exprValues: {},
      error: null,
      cacheExpiry: typeof (base = props.widgetDataSource).getCacheExpiry === "function" ? base.getCacheExpiry() : void 0
    };
  }

  TextWidgetComponent.prototype.isLoadNeeded = function(newProps, oldProps) {
    var base, getExprItems;
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
    return !_.isEqual(newProps.filters, oldProps.filters) || !_.isEqual(getExprItems(newProps.design.items), getExprItems(oldProps.design.items)) || (typeof (base = newProps.widgetDataSource).getCacheExpiry === "function" ? base.getCacheExpiry() : void 0) !== this.state.cacheExpiry;
  };

  TextWidgetComponent.prototype.load = function(props, prevProps, callback) {
    return props.widgetDataSource.getData(props.design, props.filters, (function(_this) {
      return function(error, data) {
        var base;
        return callback({
          error: error,
          exprValues: data || {},
          cacheExpiry: typeof (base = props.widgetDataSource).getCacheExpiry === "function" ? base.getCacheExpiry() : void 0
        });
      };
    })(this));
  };

  TextWidgetComponent.prototype.render = function() {
    var exprValues;
    exprValues = !this.state.loading ? this.state.exprValues : {};
    return R(TextComponent, {
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
    });
  };

  return TextWidgetComponent;

})(AsyncLoadComponent);
