var AxisComponent, H, IntersectionDesignerComponent, R, React, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

AxisComponent = require('../../../axes/AxisComponent');

module.exports = IntersectionDesignerComponent = (function(superClass) {
  extend(IntersectionDesignerComponent, superClass);

  function IntersectionDesignerComponent() {
    this.handleValueAxisChange = bind(this.handleValueAxisChange, this);
    return IntersectionDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  IntersectionDesignerComponent.propTypes = {
    intersection: React.PropTypes.object.isRequired,
    table: React.PropTypes.string.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  IntersectionDesignerComponent.prototype.update = function(changes) {
    var intersection;
    intersection = _.extend({}, this.props.intersection, changes);
    return this.props.onChange(intersection);
  };

  IntersectionDesignerComponent.prototype.handleValueAxisChange = function(valueAxis) {
    return this.update({
      valueAxis: valueAxis
    });
  };

  IntersectionDesignerComponent.prototype.renderValueAxis = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Calculation"), H.div({
      style: {
        marginLeft: 8
      }
    }, R(AxisComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      types: ["enum", "text", "boolean", "date", "number"],
      aggrNeed: "required",
      value: this.props.intersection.valueAxis,
      onChange: this.handleValueAxisChange
    })), H.p({
      className: "help-block"
    }, "This is the calculated value that is displayed. Leave as blank to make an empty section"));
  };

  IntersectionDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderValueAxis());
  };

  return IntersectionDesignerComponent;

})(React.Component);
