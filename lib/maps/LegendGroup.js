var H, LegendGroup, LegendItem, React, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

_ = require('lodash');

LegendGroup = (function(superClass) {
  extend(LegendGroup, superClass);

  function LegendGroup() {
    return LegendGroup.__super__.constructor.apply(this, arguments);
  }

  LegendGroup.propTypes = {
    items: React.PropTypes.array,
    radiusLayer: React.PropTypes.bool,
    defaultColor: React.PropTypes.string,
    name: React.PropTypes.string,
    symbol: React.PropTypes.string
  };

  LegendGroup.defaultProps = {
    items: [],
    radiusLayer: false,
    symbol: null
  };

  LegendGroup.prototype.render = function() {
    return H.div({
      style: {
        marginBottom: 5
      }
    }, React.createElement(LegendItem, {
      symbol: this.props.symbol,
      color: this.props.defaultColor,
      name: this.props.name,
      key: this.props.name,
      radiusLayer: this.props.radiusLayer
    }), _.map(this.props.items, (function(_this) {
      return function(item) {
        return React.createElement(LegendItem, {
          isChild: true,
          symbol: _this.props.symbol,
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
    color: React.PropTypes.string,
    name: React.PropTypes.string,
    radiusLayer: React.PropTypes.bool,
    symbol: React.PropTypes.string,
    isHeader: React.PropTypes.bool,
    isChild: React.PropTypes.bool
  };

  LegendItem.defaultProps = {
    radiusLayer: false,
    isHeader: true,
    isChild: false
  };

  LegendItem.prototype.renderSymbol = function() {
    var className, symbolStyle;
    symbolStyle = {
      color: this.props.color,
      display: 'inline-block',
      marginRight: 4
    };
    className = this.props.symbol.replace('font-awesome/', 'fa fa-');
    return H.span({
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
    return H.span({
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
    return H.div({
      style: containerStyle
    }, this.renderIndicator(), H.span({
      style: titleStyle
    }, this.props.name));
  };

  return LegendItem;

})(React.Component);

module.exports = {
  LegendItem: LegendItem,
  LegendGroup: LegendGroup
};
