var $, ExprCompiler, Layer, LoadingLegend, MWaterServerLayer, PropTypes, R, React, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = require('jquery');

PropTypes = require('prop-types');

Layer = require('./Layer');

ExprCompiler = require('mwater-expressions').ExprCompiler;

injectTableAlias = require('mwater-expressions').injectTableAlias;

React = require('react');

R = React.createElement;

module.exports = MWaterServerLayer = (function(superClass) {
  extend(MWaterServerLayer, superClass);

  function MWaterServerLayer() {
    return MWaterServerLayer.__super__.constructor.apply(this, arguments);
  }

  MWaterServerLayer.prototype.onGridClick = function(ev, options) {
    if (ev.data && ev.data.id) {
      return {
        row: {
          tableId: options.design.table,
          primaryKey: ev.data.id
        }
      };
    }
    return null;
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
    if (design.table) {
      return [design.table];
    } else {
      return [];
    }
  };

  MWaterServerLayer.prototype.isEditable = function() {
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
    url: PropTypes.string
  };

  function LoadingLegend(props) {
    LoadingLegend.__super__.constructor.call(this, props);
    this.state = {
      html: "Loading..."
    };
  }

  LoadingLegend.prototype.componentDidMount = function() {
    return $.get(this.props.url).done((function(_this) {
      return function(data) {
        return _this.setState({
          html: data
        });
      };
    })(this));
  };

  LoadingLegend.prototype.componentWillReceiveProps = function(nextProps) {
    if (nextProps.url !== this.props.url) {
      return $.get(nextProps.url).done((function(_this) {
        return function(data) {
          return _this.setState({
            html: data
          });
        };
      })(this));
    }
  };

  LoadingLegend.prototype.render = function() {
    return R('div', {
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
