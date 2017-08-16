var AxisBuilder, ExprUtils, H, LayerLegendComponent, LegendGroup, PropTypes, R, React, _, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

_ = require('lodash');

R = React.createElement;

AxisBuilder = require('../axes/AxisBuilder');

LegendGroup = require('./LegendGroup');

ExprUtils = require('mwater-expressions').ExprUtils;

injectTableAlias = require('mwater-expressions').injectTableAlias;

module.exports = LayerLegendComponent = (function(superClass) {
  extend(LayerLegendComponent, superClass);

  LayerLegendComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    radiusLayer: PropTypes.bool,
    axis: PropTypes.object,
    symbol: PropTypes.string,
    defaultColor: PropTypes.string,
    filters: PropTypes.array
  };

  LayerLegendComponent.defaultProps = {
    radiusLayer: false
  };

  function LayerLegendComponent() {
    LayerLegendComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      categories: []
    };
  }

  LayerLegendComponent.prototype.componentWillMount = function() {
    return this.loadCategories(this.props);
  };

  LayerLegendComponent.prototype.componentWillReceiveProps = function(nextProps) {
    if (!_.isEqual(nextProps.axis, this.props.axis) || !_.isEqual(nextProps.filters, this.props.filters)) {
      return this.loadCategories(nextProps);
    }
  };

  LayerLegendComponent.prototype.componentWillUnmount = function() {
    return this.unmounted = true;
  };

  LayerLegendComponent.prototype.loadCategories = function(props) {
    var axisBuilder, categories, filters, valuesQuery, whereClauses;
    axisBuilder = new AxisBuilder({
      schema: props.schema
    });
    if (!props.axis || !props.axis.colorMap) {
      return;
    }
    categories = axisBuilder.getCategories(props.axis);
    if (_.any(categories, function(category) {
      return category.value != null;
    })) {
      this.setState({
        categories: categories
      });
      return;
    }
    if (axisBuilder.isAxisAggr(props.axis)) {
      this.setState({
        categories: []
      });
      return;
    }
    if (!props.axis.expr.table) {
      this.setState({
        categories: []
      });
      return;
    }
    valuesQuery = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: axisBuilder.compileAxis({
            axis: props.axis,
            tableAlias: "main"
          }),
          alias: "val"
        }
      ],
      from: {
        type: "table",
        table: props.axis.expr.table,
        alias: "main"
      },
      groupBy: [1],
      limit: 50
    };
    filters = _.where(props.filters || [], {
      table: props.axis.expr.table
    });
    whereClauses = _.map(filters, function(f) {
      return injectTableAlias(f.jsonql, "main");
    });
    whereClauses = _.compact(whereClauses);
    if (whereClauses.length > 1) {
      valuesQuery.where = {
        type: "op",
        op: "and",
        exprs: whereClauses
      };
    } else {
      valuesQuery.where = whereClauses[0];
    }
    return props.dataSource.performQuery(valuesQuery, (function(_this) {
      return function(error, rows) {
        if (error) {
          return;
        }
        categories = axisBuilder.getCategories(props.axis, _.pluck(rows, "val"));
        return _this.setState({
          categories: categories
        });
      };
    })(this));
  };

  LayerLegendComponent.prototype.render = function() {
    var items;
    if (this.props.axis && this.props.axis.colorMap) {
      items = _.map(this.state.categories, (function(_this) {
        return function(category) {
          var color, label;
          if (_.includes(_this.props.axis.excludedValues, category.value)) {
            return null;
          }
          label = ExprUtils.localizeString(category.label);
          color = _.find(_this.props.axis.colorMap, {
            value: category.value
          });
          if (color) {
            return {
              color: color.color,
              name: label
            };
          } else {
            return {
              color: _this.props.defaultColor,
              name: label
            };
          }
        };
      })(this));
      items = _.compact(items);
    } else {
      items = [];
    }
    return React.createElement(LegendGroup, {
      symbol: this.props.symbol,
      items: items,
      defaultColor: this.props.defaultColor,
      name: this.props.name,
      radiusLayer: this.props.radiusLayer
    });
  };

  return LayerLegendComponent;

})(React.Component);
