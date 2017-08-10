var ClickOutHandler, DateExprComponent, DatePicker, H, PropTypes, R, React, ReactSelect, moment, presets,
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

module.exports = DateExprComponent = (function(superClass) {
  extend(DateExprComponent, superClass);

  DateExprComponent.propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.func,
    datetime: PropTypes.bool
  };

  function DateExprComponent() {
    this.renderClear = bind(this.renderClear, this);
    this.handlePreset = bind(this.handlePreset, this);
    this.handleEndChange = bind(this.handleEndChange, this);
    this.handleStartChange = bind(this.handleStartChange, this);
    this.handleClickOut = bind(this.handleClickOut, this);
    DateExprComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      dropdownOpen: false
    };
  }

  DateExprComponent.prototype.toMoment = function(value) {
    if (!value) {
      return null;
    }
    if (this.props.datetime) {
      return moment(value, moment.ISO_8601);
    } else {
      return moment(value, "YYYY-MM-DD");
    }
  };

  DateExprComponent.prototype.fromMoment = function(value) {
    if (!value) {
      return null;
    }
    if (this.props.datetime) {
      return value.toISOString();
    } else {
      return value.format("YYYY-MM-DD");
    }
  };

  DateExprComponent.prototype.toLiteral = function(value) {
    if (this.props.datetime) {
      return {
        type: "literal",
        valueType: "datetime",
        value: value
      };
    } else {
      return {
        type: "literal",
        valueType: "date",
        value: value
      };
    }
  };

  DateExprComponent.prototype.handleClickOut = function() {
    return this.setState({
      dropdownOpen: false
    });
  };

  DateExprComponent.prototype.handleStartChange = function(value) {
    var ref, ref1, ref2;
    if (((ref = this.props.value) != null ? ref.exprs[1] : void 0) && this.fromMoment(value) > ((ref1 = this.props.value.exprs[1]) != null ? ref1.value : void 0)) {
      return this.props.onChange({
        type: "op",
        op: "between",
        exprs: [this.toLiteral(this.fromMoment(value)), null]
      });
    } else {
      return this.props.onChange({
        type: "op",
        op: "between",
        exprs: [this.toLiteral(this.fromMoment(value)), (ref2 = this.props.value) != null ? ref2.exprs[1] : void 0]
      });
    }
  };

  DateExprComponent.prototype.handleEndChange = function(value) {
    var ref, ref1, ref2;
    if (this.props.datetime) {
      value = moment(value);
      value.endOf("day");
    }
    if (((ref = this.props.value) != null ? ref.exprs[0] : void 0) && this.fromMoment(value) < ((ref1 = this.props.value.exprs[0]) != null ? ref1.value : void 0)) {
      this.props.onChange({
        type: "op",
        op: "between",
        exprs: [null, this.toLiteral(this.fromMoment(value))]
      });
    } else {
      this.props.onChange({
        type: "op",
        op: "between",
        exprs: [(ref2 = this.props.value) != null ? ref2.exprs[0] : void 0, this.toLiteral(this.fromMoment(value))]
      });
    }
    return this.setState({
      dropdownOpen: false
    });
  };

  DateExprComponent.prototype.handlePreset = function(preset) {
    this.props.onChange({
      type: "op",
      op: preset.id,
      exprs: []
    });
    return this.setState({
      dropdownOpen: false
    });
  };

  DateExprComponent.prototype.renderClear = function() {
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

  DateExprComponent.prototype.renderSummary = function() {
    var endDate, preset, ref, ref1, startDate;
    if (!this.props.value) {
      return H.span({
        className: "text-muted"
      }, "All");
    }
    preset = _.findWhere(presets, {
      id: this.props.value.op
    });
    if (preset) {
      return preset.name;
    }
    if (this.props.value.op === "between") {
      startDate = this.toMoment((ref = this.props.value.exprs[0]) != null ? ref.value : void 0);
      endDate = this.toMoment((ref1 = this.props.value.exprs[1]) != null ? ref1.value : void 0);
      return (startDate ? startDate.format("ll") : "") + " - " + (endDate ? endDate.format("ll") : "");
    }
    return "???";
  };

  DateExprComponent.prototype.renderPresets = function() {
    return H.div(null, _.map(presets, (function(_this) {
      return function(preset) {
        return H.a({
          className: "btn btn-xs btn-link",
          onClick: _this.handlePreset.bind(null, preset)
        }, preset.name);
      };
    })(this)));
  };

  DateExprComponent.prototype.renderDropdown = function() {
    var endDate, ref, ref1, ref2, ref3, startDate;
    startDate = this.toMoment((ref = this.props.value) != null ? (ref1 = ref.exprs[0]) != null ? ref1.value : void 0 : void 0);
    endDate = this.toMoment((ref2 = this.props.value) != null ? (ref3 = ref2.exprs[1]) != null ? ref3.value : void 0 : void 0);
    return H.div({
      style: {
        position: "absolute",
        top: "100%",
        left: 0,
        zIndex: 4000,
        padding: 5,
        border: "solid 1px #AAA",
        backgroundColor: "white"
      }
    }, H.div({
      style: {
        whiteSpace: "nowrap"
      }
    }, H.div({
      style: {
        display: "inline-block",
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
    })), H.div({
      style: {
        display: "inline-block",
        verticalAlign: "top"
      }
    }, R(DatePicker, {
      inline: true,
      selectsEnd: true,
      selected: endDate,
      startDate: startDate,
      endDate: endDate,
      showYearDropdown: true,
      onChange: this.handleEndChange
    }))), this.renderPresets());
  };

  DateExprComponent.prototype.render = function() {
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
        width: 220,
        height: 36
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

  return DateExprComponent;

})(React.Component);

presets = [
  {
    id: "thisyear",
    name: "This Year"
  }, {
    id: "lastyear",
    name: "Last Year"
  }, {
    id: "thismonth",
    name: "This Month"
  }, {
    id: "lastmonth",
    name: "Last Month"
  }, {
    id: "today",
    name: "Today"
  }, {
    id: "yesterday",
    name: "Yesterday"
  }, {
    id: "last24hours",
    name: "In Last 24 Hours"
  }, {
    id: "last7days",
    name: "In Last 7 Days"
  }, {
    id: "last30days",
    name: "In Last 30 Days"
  }, {
    id: "last365days",
    name: "In Last 365 Days"
  }
];
