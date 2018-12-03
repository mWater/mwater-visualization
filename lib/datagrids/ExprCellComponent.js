var Cell, ExprCellComponent, ExprUtils, PropTypes, R, React, _, moment,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

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
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    locale: PropTypes.string,
    exprType: PropTypes.string,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    value: PropTypes.any,
    expr: PropTypes.object,
    muted: PropTypes.bool,
    onClick: PropTypes.func
  };

  ExprCellComponent.prototype.handleClick = function() {
    return this.setState({
      editing: true
    });
  };

  ExprCellComponent.prototype.renderImage = function(id) {
    var url;
    url = this.props.dataSource.getImageUrl(id);
    return R('a', {
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
    if ((value == null) || !this.props.expr) {
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
          if (value.type === "Point") {
            node = (value.coordinates[1].toFixed(6)) + " " + (value.coordinates[0].toFixed(6));
          } else {
            node = value.type;
          }
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
