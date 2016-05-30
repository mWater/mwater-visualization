var Cell, ExprCellComponent, ExprUtils, H, R, React, _, moment,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

moment = require('moment');

ExprUtils = require("mwater-expressions").ExprUtils;

Cell = require('fixed-data-table').Cell;

module.exports = ExprCellComponent = (function(superClass) {
  extend(ExprCellComponent, superClass);

  function ExprCellComponent() {
    this.handleClick = bind(this.handleClick, this);
    return ExprCellComponent.__super__.constructor.apply(this, arguments);
  }

  ExprCellComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    locale: React.PropTypes.string,
    exprType: React.PropTypes.string.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    value: React.PropTypes.any,
    expr: React.PropTypes.object.isRequired,
    muted: React.PropTypes.bool,
    onClick: React.PropTypes.func
  };

  ExprCellComponent.prototype.handleClick = function() {
    return this.setState({
      editing: true
    });
  };

  ExprCellComponent.prototype.renderImage = function(id) {
    var url;
    url = this.props.dataSource.getImageUrl(id);
    return H.a({
      href: url,
      key: id,
      target: "_blank",
      style: {
        paddingLeft: 5,
        paddingRight: 5
      }
    }, "Image");
  };

  ExprCellComponent.prototype.render = function() {
    var exprUtils, node, ref, ref1, value;
    exprUtils = new ExprUtils(this.props.schema);
    value = this.props.value;
    if (value == null) {
      node = null;
    } else {
      if (((ref = this.props.exprType) === 'image' || ref === 'imagelist' || ref === 'geometry' || ref === 'text[]') && _.isString(value)) {
        value = JSON.parse(value);
      }
      switch (this.props.exprType) {
        case "text":
        case "number":
          node = value;
          break;
        case "boolean":
        case "enum":
        case "enumset":
        case "text[]":
          node = exprUtils.stringifyExprLiteral(this.props.expr, value, this.props.locale);
          break;
        case "date":
          node = moment(value, "YYYY-MM-DD").format("ll");
          break;
        case "datetime":
          node = moment(value, moment.ISO_8601).format("lll");
          break;
        case "image":
          node = this.renderImage(value.id);
          break;
        case "imagelist":
          node = _.map(value, (function(_this) {
            return function(v) {
              return _this.renderImage(v.id);
            };
          })(this));
          break;
        case "geometry":
          node = (value.coordinates[1].toFixed(6)) + " " + (value.coordinates[0].toFixed(6));
          break;
        default:
          node = "" + value;
      }
    }
    return R(Cell, {
      width: this.props.width,
      height: this.props.height,
      onClick: this.props.onClick,
      style: {
        whiteSpace: "nowrap",
        textAlign: (ref1 = this.props.exprType) === 'number' ? "right" : "left",
        opacity: this.props.muted ? 0.4 : void 0
      }
    }, node);
  };

  return ExprCellComponent;

})(React.Component);
