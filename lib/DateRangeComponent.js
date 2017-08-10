var ClickOutHandler, DatePicker, DateRangeComponent, H, PropTypes, R, React, ReactSelect, moment,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

R = React.createElement;

ReactSelect = require('react-select');

moment = require('moment');

ClickOutHandler = require('react-onclickout');

DatePicker = require('react-datepicker')["default"];

module.exports = DateRangeComponent = (function(superClass) {
  extend(DateRangeComponent, superClass);

  DateRangeComponent.propTypes = {
    value: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    datetime: PropTypes.bool
  };

  function DateRangeComponent() {
    this.renderClear = bind(this.renderClear, this);
    this.handlePreset = bind(this.handlePreset, this);
    this.handleEndChange = bind(this.handleEndChange, this);
    this.handleStartChange = bind(this.handleStartChange, this);
    this.handleClickOut = bind(this.handleClickOut, this);
    DateRangeComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      dropdownOpen: false
    };
  }

  DateRangeComponent.prototype.toMoment = function(value) {
    if (!value) {
      return null;
    }
    if (this.props.datetime) {
      return moment(value, moment.ISO_8601);
    } else {
      return moment(value, "YYYY-MM-DD");
    }
  };

  DateRangeComponent.prototype.fromMoment = function(value) {
    if (!value) {
      return null;
    }
    if (this.props.datetime) {
      return value.toISOString();
    } else {
      return value.format("YYYY-MM-DD");
    }
  };

  DateRangeComponent.prototype.handleClickOut = function() {
    return this.setState({
      dropdownOpen: false
    });
  };

  DateRangeComponent.prototype.handleStartChange = function(value) {
    var ref, ref1;
    if (((ref = this.props.value) != null ? ref[1] : void 0) && this.fromMoment(value) > this.props.value[1]) {
      return this.props.onChange([this.fromMoment(value), null]);
    } else {
      return this.props.onChange([this.fromMoment(value), (ref1 = this.props.value) != null ? ref1[1] : void 0]);
    }
  };

  DateRangeComponent.prototype.handleEndChange = function(value) {
    var ref, ref1;
    if (this.props.datetime) {
      value = moment(value);
      value.endOf("day");
    }
    if (((ref = this.props.value) != null ? ref[0] : void 0) && this.fromMoment(value) < this.props.value[0]) {
      this.props.onChange([null, this.fromMoment(value)]);
    } else {
      this.props.onChange([(ref1 = this.props.value) != null ? ref1[0] : void 0, this.fromMoment(value)]);
    }
    return this.setState({
      dropdownOpen: false
    });
  };

  DateRangeComponent.prototype.handlePreset = function(preset) {
    this.props.onChange([this.fromMoment(preset.value[0]), this.fromMoment(preset.value[1])]);
    return this.setState({
      dropdownOpen: false
    });
  };

  DateRangeComponent.prototype.getPresets = function() {
    var presets;
    presets = [
      {
        label: 'Today',
        value: [moment(), moment()]
      }, {
        label: 'Yesterday',
        value: [moment().subtract(1, 'days'), moment().subtract(1, 'days')]
      }, {
        label: 'Last 7 Days',
        value: [moment().subtract(6, 'days'), moment()]
      }, {
        label: 'Last 30 Days',
        value: [moment().subtract(29, 'days'), moment()]
      }, {
        label: 'This Month',
        value: [moment().startOf('month'), moment().endOf('month')]
      }, {
        label: 'Last Month',
        value: [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')]
      }, {
        label: 'This Year',
        value: [moment().startOf('year'), moment().endOf('year')]
      }, {
        label: 'Last Year',
        value: [moment().subtract(1, 'years').startOf('year'), moment().subtract(1, 'years').endOf('year')]
      }
    ];
    return presets;
  };

  DateRangeComponent.prototype.renderClear = function() {
    return H.div({
      style: {
        position: "absolute",
        right: 10,
        top: 7,
        color: "#AAA",
        lineHeight: 1.42857143
      },
      onClick: ((function(_this) {
        return function() {
          return _this.props.onChange(null);
        };
      })(this))
    }, H.i({
      className: "fa fa-remove"
    }));
  };

  DateRangeComponent.prototype.renderSummary = function() {
    var endDate, startDate;
    if (!this.props.value) {
      return H.span({
        className: "text-muted"
      }, "All");
    }
    startDate = this.toMoment(this.props.value[0]);
    endDate = this.toMoment(this.props.value[1]);
    return (startDate ? startDate.format("ll") : "") + " - " + (endDate ? endDate.format("ll") : "");
  };

  DateRangeComponent.prototype.renderPresets = function() {
    return H.div(null, _.map(this.getPresets(), (function(_this) {
      return function(preset) {
        return H.a({
          className: "btn btn-xs btn-link",
          onClick: _this.handlePreset.bind(null, preset)
        }, preset.label);
      };
    })(this)));
  };

  DateRangeComponent.prototype.renderDropdown = function() {
    var endDate, ref, ref1, startDate;
    startDate = this.toMoment((ref = this.props.value) != null ? ref[0] : void 0);
    endDate = this.toMoment((ref1 = this.props.value) != null ? ref1[1] : void 0);
    return H.div({
      style: {
        position: "absolute",
        top: "100%",
        left: 0,
        zIndex: 1000,
        padding: 5,
        border: "solid 1px #AAA",
        backgroundColor: "white"
      }
    }, H.div({
      style: {
        whiteSpace: "nowrap",
        verticalAlign: "top"
      }
    }, R(DatePicker, {
      inline: true,
      selectsStart: true,
      selected: startDate,
      startDate: startDate,
      endDate: endDate,
      showYearDropdown: true,
      onChange: this.handleStartChange
    }), R(DatePicker, {
      inline: true,
      selectsEnd: true,
      selected: endDate,
      startDate: startDate,
      endDate: endDate,
      showYearDropdown: true,
      onChange: this.handleEndChange
    })), this.renderPresets());
  };

  DateRangeComponent.prototype.render = function() {
    return R(ClickOutHandler, {
      onClickOut: this.handleClickOut
    }, H.div({
      style: {
        display: "inline-block",
        position: "relative"
      }
    }, H.div({
      className: "form-control",
      style: {
        width: 220
      },
      onClick: ((function(_this) {
        return function() {
          return _this.setState({
            dropdownOpen: true
          });
        };
      })(this))
    }, this.renderSummary()), this.props.value && (this.props.onChange != null) ? this.renderClear() : void 0, this.state.dropdownOpen ? this.renderDropdown() : void 0));
  };

  return DateRangeComponent;

})(React.Component);
