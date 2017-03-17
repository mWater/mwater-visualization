var AxisComponent, H, R, React, SegmentDesignerComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

AxisComponent = require('../../../axes/AxisComponent');

module.exports = SegmentDesignerComponent = (function(superClass) {
  extend(SegmentDesignerComponent, superClass);

  function SegmentDesignerComponent() {
    this.handleLabelChange = bind(this.handleLabelChange, this);
    this.handleValueAxisChange = bind(this.handleValueAxisChange, this);
    return SegmentDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  SegmentDesignerComponent.propTypes = {
    segment: React.PropTypes.object.isRequired,
    table: React.PropTypes.string.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    segmentType: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  SegmentDesignerComponent.prototype.componentDidMount = function() {
    var ref;
    return (ref = this.labelElem) != null ? ref.focus() : void 0;
  };

  SegmentDesignerComponent.prototype.update = function(changes) {
    var segment;
    segment = _.extend({}, this.props.segment, changes);
    return this.props.onChange(segment);
  };

  SegmentDesignerComponent.prototype.handleValueAxisChange = function(valueAxis) {
    return this.update({
      valueAxis: valueAxis
    });
  };

  SegmentDesignerComponent.prototype.handleLabelChange = function(ev) {
    return this.update({
      label: ev.target.value
    });
  };

  SegmentDesignerComponent.prototype.renderLabel = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Label"), H.input({
      ref: (function(_this) {
        return function(elem) {
          return _this.labelElem = elem;
        };
      })(this),
      type: "text",
      className: "form-control",
      value: this.props.segment.label || "",
      onChange: this.handleLabelChange
    }), H.p({
      className: "help-block"
    }, "This is an optional label for the " + this.props.segmentType));
  };

  SegmentDesignerComponent.prototype.renderValueAxis = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Field"), H.div({
      style: {
        marginLeft: 8
      }
    }, R(AxisComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      types: ["enum", "text", "boolean", "date"],
      aggrNeed: "none",
      value: this.props.segment.valueAxis,
      onChange: this.handleValueAxisChange,
      allowExcludedValues: true
    })), H.p({
      className: "help-block"
    }, "This is an optional field for the " + this.props.segmentType + ". Leave blank to make a totals " + this.props.segmentType + "."));
  };

  SegmentDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderLabel(), this.renderValueAxis());
  };

  return SegmentDesignerComponent;

})(React.Component);
