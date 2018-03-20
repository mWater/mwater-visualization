var DropdownWidgetComponent, H, PropTypes, React, TOCWidget, TOCWidgetComponent, TOCWidgetViewComponent, Widget, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

_ = require('lodash');

Widget = require('./Widget');

DropdownWidgetComponent = require('./DropdownWidgetComponent');

module.exports = TOCWidget = (function(superClass) {
  extend(TOCWidget, superClass);

  function TOCWidget() {
    return TOCWidget.__super__.constructor.apply(this, arguments);
  }

  TOCWidget.prototype.createViewElement = function(options) {
    return React.createElement(TOCWidgetComponent, {
      design: options.design,
      onDesignChange: options.onDesignChange,
      width: options.width,
      height: options.height,
      tocEntries: options.tocEntries,
      onScrollToTOCEntry: options.onScrollToTOCEntry
    });
  };

  TOCWidget.prototype.isAutoHeight = function() {
    return true;
  };

  return TOCWidget;

})(Widget);

TOCWidgetComponent = (function(superClass) {
  extend(TOCWidgetComponent, superClass);

  function TOCWidgetComponent() {
    return TOCWidgetComponent.__super__.constructor.apply(this, arguments);
  }

  TOCWidgetComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    width: PropTypes.number,
    height: PropTypes.number,
    tocEntries: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.any,
      widgetId: PropTypes.string.isRequired,
      level: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired
    })),
    onScrollToTOCEntry: PropTypes.func
  };

  TOCWidgetComponent.prototype.render = function() {
    return React.createElement(TOCWidgetViewComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      width: this.props.width,
      height: this.props.height,
      tocEntries: this.props.tocEntries,
      onScrollToTOCEntry: this.props.onScrollToTOCEntry
    });
  };

  return TOCWidgetComponent;

})(React.Component);

TOCWidgetViewComponent = (function(superClass) {
  extend(TOCWidgetViewComponent, superClass);

  function TOCWidgetViewComponent() {
    this.handleEntryClick = bind(this.handleEntryClick, this);
    return TOCWidgetViewComponent.__super__.constructor.apply(this, arguments);
  }

  TOCWidgetViewComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    width: PropTypes.number,
    height: PropTypes.number,
    tocEntries: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.any,
      widgetId: PropTypes.string.isRequired,
      level: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired
    })),
    onScrollToTOCEntry: PropTypes.func
  };

  TOCWidgetViewComponent.prototype.handleEntryClick = function(tocEntry) {
    var base;
    return typeof (base = this.props).onScrollToTOCEntry === "function" ? base.onScrollToTOCEntry(tocEntry.widgetId, tocEntry.id) : void 0;
  };

  TOCWidgetViewComponent.prototype.renderTOCEntry = function(tocEntry, index) {
    var i2, indentation, j, k, level, ref, ref1, value;
    indentation = "";
    for (level = j = 1, ref = tocEntry.level; 1 <= ref ? j <= ref : j >= ref; level = 1 <= ref ? ++j : --j) {
      value = 0;
      for (i2 = k = 0, ref1 = index; 0 <= ref1 ? k <= ref1 : k >= ref1; i2 = 0 <= ref1 ? ++k : --k) {
        if (this.props.tocEntries[i2].level === level) {
          value += 1;
        } else if (this.props.tocEntries[i2].level < level) {
          value = 0;
        }
      }
      indentation += value + ".";
    }
    return H.div({
      key: index,
      style: {
        paddingLeft: tocEntry.level * 8 - 8
      }
    }, H.a({
      onClick: this.handleEntryClick.bind(null, tocEntry),
      style: {
        cursor: "pointer"
      }
    }, indentation, " ", H.span(null, tocEntry.text)));
  };

  TOCWidgetViewComponent.prototype.render = function() {
    return H.div({
      style: {
        width: this.props.standardWidth,
        height: this.props.height
      }
    }, _.map(this.props.tocEntries, (function(_this) {
      return function(tocEntry, i) {
        return _this.renderTOCEntry(tocEntry, i);
      };
    })(this)), this.props.onDesignChange && this.props.tocEntries.length === 0 ? H.div({
      className: "text-muted"
    }, "Table of Contents will appear here as text blocks with headings are added to the dashboard") : void 0);
  };

  return TOCWidgetViewComponent;

})(React.Component);
