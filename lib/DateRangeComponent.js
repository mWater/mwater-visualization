var DateRangeComponent, DateRangePicker, H, React, moment,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

moment = require('moment');

DateRangePicker = require('react-bootstrap-daterangepicker');

module.exports = DateRangeComponent = (function(superClass) {
  extend(DateRangeComponent, superClass);

  function DateRangeComponent() {
    this.handleApply = bind(this.handleApply, this);
    this.handleClear = bind(this.handleClear, this);
    return DateRangeComponent.__super__.constructor.apply(this, arguments);
  }

  DateRangeComponent.propTypes = {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    datetime: React.PropTypes.bool.isRequired
  };

  DateRangeComponent.prototype.handleClear = function(ev) {
    ev.stopPropagation();
    return this.props.onChange(null);
  };

  DateRangeComponent.prototype.handleApply = function(event, picker) {
    var value;
    if (this.props.datetime) {
      value = [picker.startDate.endOf('day').toISOString(), picker.endDate.endOf('day').toISOString()];
      return this.props.onChange(value);
    } else {
      value = [picker.startDate.format("YYYY-MM-DD"), picker.endDate.format("YYYY-MM-DD")];
      return this.props.onChange(value);
    }
  };

  DateRangeComponent.prototype.render = function() {
    var endDate, endStr, hasValue, label, ranges, startDate, startStr, style;
    hasValue = _.isArray(this.props.value);
    if (hasValue) {
      startDate = moment(this.props.value[0], moment.ISO_8601);
      endDate = moment(this.props.value[1], moment.ISO_8601);
      startStr = startDate.format('ll');
      endStr = endDate.format('ll');
      if (startStr === endStr) {
        label = startStr;
      } else {
        label = startStr + " - " + endStr;
      }
    } else {
      label = "Select...";
    }
    style = {
      height: 34,
      padding: "6px 12px",
      fontSize: 14,
      lineHeight: 1.42857143,
      color: "#555",
      border: "1px solid #ccc",
      borderRadius: 4,
      width: "100%"
    };
    if (!hasValue) {
      style.color = "#aaaaaa";
    }
    ranges = {
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')],
      'This Year': [moment().startOf('year'), moment().endOf('year')],
      'Last Year': [moment().subtract(1, 'years').startOf('year'), moment().subtract(1, 'years').endOf('year')]
    };
    return React.createElement(DateRangePicker, {
      startDate: startDate || moment(),
      endDate: endDate || moment(),
      onApply: this.handleApply,
      autoApply: true,
      ranges: ranges
    }, H.div({
      style: style
    }, hasValue ? H.a({
      style: {
        color: "#ccc",
        cursor: "pointer",
        float: "right"
      },
      onClick: this.handleClear
    }, H.span({
      className: "glyphicon glyphicon-remove"
    })) : void 0, label));
  };

  return DateRangeComponent;

})(React.Component);
