var ExprCompiler, H, Layer, LoadingLegend, MWaterServerLayer, React, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Layer = require('./Layer');

ExprCompiler = require('mwater-expressions').ExprCompiler;

injectTableAlias = require('mwater-expressions').injectTableAlias;

React = require('react');

H = React.DOM;

module.exports = MWaterServerLayer = (function(superClass) {
  extend(MWaterServerLayer, superClass);

  function MWaterServerLayer() {
    return MWaterServerLayer.__super__.constructor.apply(this, arguments);
  }

  MWaterServerLayer.prototype.getJsonQLCss = function(design, schema, filters) {
    return design.type;
  };

  MWaterServerLayer.prototype.onGridClick = function(ev, options) {
    if (ev.data && ev.data.id) {
      return [this.design.table, ev.data.id];
    }
  };

  MWaterServerLayer.prototype.getMinZoom = function(design) {
    return design.minZoom;
  };

  MWaterServerLayer.prototype.getMaxZoom = function(design) {
    return design.maxZoom;
  };

  MWaterServerLayer.prototype.getLegend = function(design, schema) {
    var apiUrl;
    apiUrl = "https://api.mwater.co/v3/";
    return React.createElement(LoadingLegend, {
      url: apiUrl + "maps/legend?type=" + design.type
    });
  };

  MWaterServerLayer.prototype.getFilterableTables = function(design, schema) {
    return [design.table];
  };

  MWaterServerLayer.prototype.isEditable = function(design, schema) {
    return false;
  };

  MWaterServerLayer.prototype.cleanDesign = function(design, schema) {
    return design;
  };

  MWaterServerLayer.prototype.validateDesign = function(design, schema) {
    return null;
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
