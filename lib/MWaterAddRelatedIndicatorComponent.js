var ExprUtils, H, MWaterAddRelatedIndicatorComponent, PropTypes, R, React, _, filterMatches, flattenProperties, moment, querystring, ui,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

moment = require('moment');

querystring = require('querystring');

ExprUtils = require('mwater-expressions').ExprUtils;

ui = require('./UIComponents');

module.exports = MWaterAddRelatedIndicatorComponent = (function(superClass) {
  extend(MWaterAddRelatedIndicatorComponent, superClass);

  MWaterAddRelatedIndicatorComponent.propTypes = {
    table: PropTypes.string.isRequired,
    apiUrl: PropTypes.string.isRequired,
    client: PropTypes.string,
    user: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
    schema: PropTypes.object.isRequired,
    filter: PropTypes.string
  };

  MWaterAddRelatedIndicatorComponent.contextTypes = {
    locale: PropTypes.string
  };

  function MWaterAddRelatedIndicatorComponent() {
    this.handleSelect = bind(this.handleSelect, this);
    MWaterAddRelatedIndicatorComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      addingTables: [],
      indicators: null
    };
  }

  MWaterAddRelatedIndicatorComponent.prototype.componentDidMount = function() {
    var query;
    query = {};
    query.selector = JSON.stringify({
      type: "response"
    });
    query.fields = JSON.stringify({
      "design.name": 1,
      "design.desc": 1,
      "design.properties": 1,
      "design.recommended": 1,
      "deprecated": 1
    });
    if (this.props.client) {
      query.client = this.props.client;
    }
    return $.getJSON(this.props.apiUrl + "indicators?" + querystring.stringify(query), (function(_this) {
      return function(indicators) {
        indicators = _.filter(indicators, function(indicator) {
          return _this.doesIndicatorReferenceTable(indicator, _this.props.table) && !indicator.deprecated;
        });
        indicators = _.sortByOrder(indicators, [
          function(indicator) {
            if (indicator.design.recommended) {
              return 0;
            } else {
              return 1;
            }
          }, function(indicator) {
            return ExprUtils.localizeString(indicator.design.name, _this.context.locale);
          }
        ], ['asc', 'asc']);
        return _this.setState({
          indicators: indicators
        });
      };
    })(this)).fail((function(_this) {
      return function(xhr) {
        return _this.setState({
          error: xhr.responseText
        });
      };
    })(this));
  };

  MWaterAddRelatedIndicatorComponent.prototype.doesIndicatorReferenceTable = function(indicator, table) {
    var i, j, len, len1, property, proplist, ref, ref1;
    ref = _.values(indicator.design.properties);
    for (i = 0, len = ref.length; i < len; i++) {
      proplist = ref[i];
      ref1 = flattenProperties(proplist);
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        property = ref1[j];
        if (property.idTable === table) {
          return true;
        }
      }
    }
    return false;
  };

  MWaterAddRelatedIndicatorComponent.prototype.handleSelect = function(table) {
    this.setState({
      addingTables: _.union(this.state.addingTables, [table])
    });
    return this.props.onSelect(table);
  };

  MWaterAddRelatedIndicatorComponent.prototype.render = function() {
    var indicators;
    indicators = _.filter(this.state.indicators, (function(_this) {
      return function(indicator) {
        var ref;
        return !_this.props.schema.getTable("indicator_values:" + indicator._id) || (ref = "indicator_values:" + indicator._id, indexOf.call(_this.state.addingTables, ref) >= 0);
      };
    })(this));
    if (this.props.filter) {
      indicators = _.filter(indicators, (function(_this) {
        return function(indicator) {
          return filterMatches(_this.props.filter, ExprUtils.localizeString(indicator.design.name, _this.context.locale));
        };
      })(this));
    }
    return H.div(null, H.div({
      style: {
        paddingLeft: 5
      },
      className: "text-muted"
    }, "Other Available Indicators. Click to enable. ", H.i({
      className: "fa fa-check-circle"
    }), " = recommended", !this.state.indicators ? H.div({
      className: "text-muted"
    }, H.i({
      className: "fa fa-spin fa-spinner"
    }), " Loading...") : void 0, H.div({
      style: {
        paddingLeft: 10
      }
    }, _.map(indicators, (function(_this) {
      return function(indicator) {
        var desc, name, ref;
        name = ExprUtils.localizeString(indicator.design.name, _this.context.locale);
        desc = ExprUtils.localizeString(indicator.design.desc, _this.context.locale);
        if (_this.props.schema.getTable("indicator_values:" + indicator._id)) {
          return H.div({
            key: indicator._id,
            style: {
              cursor: "pointer",
              padding: 4
            },
            className: "text-success"
          }, name + " added. See above.");
        }
        return H.div({
          key: indicator._id,
          style: {
            cursor: "pointer",
            color: "#478",
            padding: 4
          },
          onClick: _this.handleSelect.bind(null, "indicator_values:" + indicator._id)
        }, (ref = indicator._id, indexOf.call(_this.state.addingTables, ref) >= 0) ? H.i({
          className: "fa fa-spin fa-spinner"
        }) : void 0, indicator.design.recommended ? H.i({
          className: "fa fa-check-circle fa-fw",
          style: {
            color: "#337ab7"
          }
        }) : void 0, name, desc ? H.span({
          className: "text-muted",
          style: {
            fontSize: 12,
            paddingLeft: 3
          }
        }, " - " + desc) : void 0);
      };
    })(this)))));
  };

  return MWaterAddRelatedIndicatorComponent;

})(React.Component);

flattenProperties = function(properties) {
  var i, len, prop, props;
  props = [];
  for (i = 0, len = properties.length; i < len; i++) {
    prop = properties[i];
    if (prop.contents) {
      props = props.concat(flattenProperties(prop.contents));
    } else {
      props.push(prop);
    }
  }
  return props;
};

filterMatches = function(filter, text) {
  if (!filter) {
    return true;
  }
  if (!text) {
    return false;
  }
  if (text.match(new RegExp(_.escapeRegExp(filter), "i"))) {
    return true;
  }
  return false;
};
