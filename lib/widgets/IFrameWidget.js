var IFrameWidget, R, React, Widget, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

R = React.createElement;

_ = require('lodash');

Widget = require('./Widget');

module.exports = IFrameWidget = (function(superClass) {
  extend(IFrameWidget, superClass);

  function IFrameWidget() {
    return IFrameWidget.__super__.constructor.apply(this, arguments);
  }

  IFrameWidget.prototype.createViewElement = function(options) {
    var IFrameWidgetComponent;
    IFrameWidgetComponent = require('./IFrameWidgetComponent');
    return R(IFrameWidgetComponent, {
      design: options.design,
      onDesignChange: options.onDesignChange,
      width: options.width,
      height: options.height
    });
  };

  IFrameWidget.prototype.isAutoHeight = function() {
    return false;
  };

  return IFrameWidget;

})(Widget);
