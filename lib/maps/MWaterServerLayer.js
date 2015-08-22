var ExpressionCompiler, H, Layer, LoadingLegend, MWaterServerLayer, React, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Layer = require('./Layer');

ExpressionCompiler = require('../expressions/ExpressionCompiler');

injectTableAlias = require('../injectTableAlias');

React = require('react');

H = React.DOM;

module.exports = MWaterServerLayer = (function(superClass) {
  extend(MWaterServerLayer, superClass);

  function MWaterServerLayer(options) {
    this.design = options.design;
    this.client = options.client;
    this.apiUrl = options.apiUrl;
    this.onMarkerClick = options.onMarkerClick;
  }

  MWaterServerLayer.prototype.getTileUrl = function(filters) {
    return this.createUrl("png", filters);
  };

  MWaterServerLayer.prototype.getUtfGridUrl = function(filters) {
    return this.createUrl("grid.json", filters);
  };

  MWaterServerLayer.prototype.onGridClick = function(ev) {
    if (this.onMarkerClick && ev.data && ev.data.id) {
      return this.onMarkerClick(this.design.table, ev.data.id);
    }
  };

  MWaterServerLayer.prototype.createUrl = function(extension, filters) {
    var relevantFilters, url, where, whereClauses;
    url = this.apiUrl + "maps/tiles/{z}/{x}/{y}." + extension + "?type=" + this.design.type + "&radius=1000";
    if (this.client) {
      url += "&client=" + this.client;
    }
    relevantFilters = _.where(filters, {
      table: this.design.table
    });
    whereClauses = _.map(relevantFilters, (function(_this) {
      return function(f) {
        return injectTableAlias(f.jsonql, "main");
      };
    })(this));
    if (whereClauses.length > 1) {
      where = {
        type: "op",
        op: "and",
        exprs: whereClauses
      };
    } else {
      where = whereClauses[0];
    }
    if (where) {
      url += "&where=" + encodeURIComponent(JSON.stringify(where));
    }
    return url;
  };

  MWaterServerLayer.prototype.getFilterableTables = function() {
    return [this.design.table];
  };

  MWaterServerLayer.prototype.getLegend = function() {
    return React.createElement(LoadingLegend, {
      url: this.apiUrl + "maps/legend?type=" + this.design.type
    });
  };

  return MWaterServerLayer;

})(Layer);

LoadingLegend = (function(superClass) {
  extend(LoadingLegend, superClass);

  LoadingLegend.propTypes = {
    url: React.PropTypes.string
  };

  function LoadingLegend() {
    LoadingLegend.__super__.constructor.apply(this, arguments);
    this.state = {
      html: "Loading..."
    };
  }

  LoadingLegend.prototype.componentDidMount = function() {
    return $.get(this.props.url).success((function(_this) {
      return function(data) {
        return _this.setState({
          html: data
        });
      };
    })(this));
  };

  LoadingLegend.prototype.componentWillReceiveProps = function(nextProps) {
    if (nextProps.url !== this.props.url) {
      return $.get(nextProps.url).success((function(_this) {
        return function(data) {
          return _this.setState({
            html: data
          });
        };
      })(this));
    }
  };

  LoadingLegend.prototype.render = function() {
    return H.div({
      style: {
        font: "14px/16px Arial, Helvetica, sans-serif",
        color: "#555"
      },
      dangerouslySetInnerHTML: {
        __html: this.state.html
      }
    });
  };

  return LoadingLegend;

})(React.Component);
