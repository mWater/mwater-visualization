var AsyncLoadComponent, H, ItemsHtmlConverter, R, React, TextWidgetViewComponent, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

_ = require('lodash');

ItemsHtmlConverter = require('./ItemsHtmlConverter');

AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent');

module.exports = TextWidgetViewComponent = (function(superClass) {
  extend(TextWidgetViewComponent, superClass);

  TextWidgetViewComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    schema: React.PropTypes.object.isRequired,
    widgetDataSource: React.PropTypes.object.isRequired
  };

  function TextWidgetViewComponent(props) {
    TextWidgetViewComponent.__super__.constructor.call(this, props);
    this.state = {
      exprValues: {},
      error: null
    };
  }

  TextWidgetViewComponent.prototype.isLoadNeeded = function(newProps, oldProps) {
    return !_.isEqual(_.pick(newProps, "filters", "design"), _.pick(oldProps, "filters", "design"));
  };

  TextWidgetViewComponent.prototype.load = function(props, prevProps, callback) {
    return props.widgetDataSource.getData(props.filters, (function(_this) {
      return function(error, data) {
        return callback({
          error: error,
          exprValues: data || {}
        });
      };
    })(this));
  };

  TextWidgetViewComponent.prototype.createHtml = function() {
    return new ItemsHtmlConverter(this.props.schema, false, (!this.state.loading ? this.state.exprValues : {})).itemsToHtml(this.props.design.items);
  };

  TextWidgetViewComponent.prototype.render = function() {
    var ref;
    if (((ref = this.props.design.items) != null ? ref[0] : void 0) != null) {
      return H.div({
        className: "mwater-visualization-text-widget-style-" + (this.props.design.style || "default"),
        dangerouslySetInnerHTML: {
          __html: this.createHtml()
        }
      });
    } else {
      return H.div({
        className: "mwater-visualization-text-widget-style-" + (this.props.design.style || "default") + " text-muted"
      }, "Click to Edit");
    }
  };

  return TextWidgetViewComponent;

})(AsyncLoadComponent);
