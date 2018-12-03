var LegendGroup, LegendItem, PropTypes, R, React, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

_ = require('lodash');

module.exports = LegendGroup = (function(superClass) {
  extend(LegendGroup, superClass);

  function LegendGroup() {
    return LegendGroup.__super__.constructor.apply(this, arguments);
  }

  LegendGroup.propTypes = {
    items: PropTypes.array,
    radiusLayer: PropTypes.bool,
    defaultColor: PropTypes.string,
    name: PropTypes.string,
    symbol: PropTypes.string,
    markerSize: PropTypes.number
  };

  LegendGroup.defaultProps = {
    items: [],
    radiusLayer: false,
    symbol: null
  };

  LegendGroup.prototype.render = function() {
    return R('div', {
      style: {
        marginBottom: 5
      }
    }, React.createElement(LegendItem, {
      hasChildren: this.props.items.length > 0,
      symbol: this.props.symbol,
      markerSize: this.props.markerSize,
      color: this.props.defaultColor,
      name: this.props.name,
      key: this.props.name,
      radiusLayer: this.props.radiusLayer
    }), _.map(this.props.items, (function(_this) {
      return function(item) {
        return React.createElement(LegendItem, {
          isChild: true,
          symbol: _this.props.symbol,
          markerSize: _this.props.markerSize,
          color: item.color,
          name: item.name,
          key: item.name,
          radiusLayer: _this.props.radiusLayer
        });
      };
    })(this)));
  };

  return LegendGroup;

})(React.Component);

LegendItem = (function(superClass) {
  extend(LegendItem, superClass);

  function LegendItem() {
    return LegendItem.__super__.constructor.apply(this, arguments);
  }

  LegendItem.propTypes = {
    color: PropTypes.string,
    name: PropTypes.string,
    radiusLayer: PropTypes.bool,
    symbol: PropTypes.string,
    markerSize: PropTypes.number,
    hasChildren: PropTypes.bool,
    isChild: PropTypes.bool
  };

  LegendItem.defaultProps = {
    radiusLayer: false,
    hasChildren: false,
    isChild: false
  };

  LegendItem.prototype.renderSymbol = function() {
    var className, symbolStyle;
    symbolStyle = {
      color: this.props.color,
      display: 'inline-block',
      marginRight: 4,
      fontSize: this.props.markerSize
    };
    className = this.props.symbol.replace('font-awesome/', 'fa fa-');
    return R('span', {
      className: className,
      style: symbolStyle
    }, "");
  };

  LegendItem.prototype.renderColorIndicator = function() {
    var indicatorStyle;
    indicatorStyle = {
      height: 10,
      width: 10,
      backgroundColor: this.props.color,
      display: 'inline-block',
      marginRight: 4
    };
    if (this.props.radiusLayer) {
      indicatorStyle['borderRadius'] = 5;
    }
    return R('span', {
      style: indicatorStyle
    }, "");
  };

  LegendItem.prototype.renderIndicator = function() {
    if (this.props.symbol) {
      return this.renderSymbol();
    } else {
      return this.renderColorIndicator();
    }
  };

  LegendItem.prototype.render = function() {
    var containerStyle, titleStyle;
    titleStyle = {};
    if (!this.props.isChild) {
      titleStyle = {
        margin: 2,
        fontWeight: 'bold'
      };
    }
    containerStyle = {
      paddingLeft: this.props.isChild ? 5 : 0
    };
    return R('div', {
      style: containerStyle
    }, !this.props.hasChildren ? this.renderIndicator() : void 0, R('span', {
      style: titleStyle
    }, this.props.name));
  };

  return LegendItem;

})(React.Component);
