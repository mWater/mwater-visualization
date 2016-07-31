var H, LegendGroup, LegendItem, React, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

_ = require('lodash');

module.exports = LegendGroup = (function(superClass) {
  extend(LegendGroup, superClass);

  function LegendGroup() {
    return LegendGroup.__super__.constructor.apply(this, arguments);
  }

  LegendGroup.propTypes = {
    items: React.PropTypes.array
  };

  LegendGroup.prototype.render = function() {
    var titleStyle;
    titleStyle = {
      margin: 2,
      fontWeight: 'bold'
    };
    return H.div(null, _.map(this.props.items, (function(_this) {
      return function(item) {
        return React.createElement(LegendItem, {
          color: item.color,
          name: item.name,
          key: item.name
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
    name: React.PropTypes.string
  };

  LegendItem.prototype.render = function() {
    var indicatorStyle;
    indicatorStyle = {
      height: 10,
      width: 10,
      backgroundColor: this.props.color,
      display: 'inline-block',
      marginRight: 4
    };
    return H.div(null, H.span({
      style: indicatorStyle
    }, ""), H.span(null, this.props.name));
  };

  return LegendItem;

})(React.Component);
