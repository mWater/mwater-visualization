"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var ClickOutHandler,
    DateExprComponent,
    DatePicker,
    PropTypes,
    R,
    React,
    _,
    moment,
    presets,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
moment = require('moment');
ClickOutHandler = require('react-onclickout');
DatePicker = require('react-datepicker')["default"]; // Allows selection of a date expressions for quickfilters

module.exports = DateExprComponent = function () {
  var DateExprComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(DateExprComponent, _React$Component);

    function DateExprComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, DateExprComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(DateExprComponent).call(this, props));
      _this.handleClickOut = _this.handleClickOut.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleStartChange = _this.handleStartChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleEndChange = _this.handleEndChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handlePreset = _this.handlePreset.bind((0, _assertThisInitialized2["default"])(_this));
      _this.renderClear = _this.renderClear.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        dropdownOpen: false,
        custom: false // True when custom dates displayed

      };
      return _this;
    }

    (0, _createClass2["default"])(DateExprComponent, [{
      key: "toMoment",
      value: function toMoment(value) {
        if (!value) {
          return null;
        }

        if (this.props.datetime) {
          return moment(value, moment.ISO_8601);
        } else {
          return moment(value, "YYYY-MM-DD");
        }
      }
    }, {
      key: "fromMoment",
      value: function fromMoment(value) {
        if (!value) {
          return null;
        }

        if (this.props.datetime) {
          return value.toISOString();
        } else {
          return value.format("YYYY-MM-DD");
        }
      }
    }, {
      key: "toLiteral",
      value: function toLiteral(value) {
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
      }
    }, {
      key: "handleClickOut",
      value: function handleClickOut() {
        boundMethodCheck(this, DateExprComponent);
        return this.setState({
          dropdownOpen: false
        });
      }
    }, {
      key: "handleStartChange",
      value: function handleStartChange(value) {
        var ref, ref1, ref2;
        boundMethodCheck(this, DateExprComponent); // Clear end if after

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
      }
    }, {
      key: "handleEndChange",
      value: function handleEndChange(value) {
        var ref, ref1, ref2;
        boundMethodCheck(this, DateExprComponent); // Go to end of day if datetime

        if (this.props.datetime) {
          value = moment(value);
          value.endOf("day");
        } // Clear start if before


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
      }
    }, {
      key: "handlePreset",
      value: function handlePreset(preset) {
        boundMethodCheck(this, DateExprComponent);
        this.props.onChange({
          type: "op",
          op: preset.id,
          exprs: []
        });
        return this.setState({
          dropdownOpen: false
        });
      }
    }, {
      key: "renderClear",
      value: function renderClear() {
        var _this2 = this;

        boundMethodCheck(this, DateExprComponent);
        return R('div', {
          style: {
            position: "absolute",
            right: 10,
            top: 7,
            color: "#AAA"
          },
          onClick: function onClick() {
            return _this2.props.onChange(null);
          }
        }, R('i', {
          className: "fa fa-remove"
        }));
      }
    }, {
      key: "renderSummary",
      value: function renderSummary() {
        var endDate, preset, ref, ref1, startDate;

        if (!this.props.value) {
          return R('span', {
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
          endDate = this.toMoment((ref1 = this.props.value.exprs[1]) != null ? ref1.value : void 0); // Add/subtract hours to work around https://github.com/moment/moment/issues/2749

          if (this.props.datetime) {
            return (startDate ? startDate.add("hours", 3).format("ll") : "") + " - " + (endDate ? endDate.subtract("hours", 3).format("ll") : "");
          } else {
            return (startDate ? startDate.format("ll") : "") + " - " + (endDate ? endDate.format("ll") : "");
          }
        }

        return "???";
      }
    }, {
      key: "renderPresets",
      value: function renderPresets() {
        var _this3 = this;

        return R('div', {
          style: {
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: 4000,
            padding: 5,
            border: "solid 1px #AAA",
            backgroundColor: "white",
            borderRadius: 4
          }
        }, R('ul', {
          className: "nav nav-pills nav-stacked"
        }, _.map(presets, function (preset) {
          return R('li', null, R('a', {
            style: {
              padding: 5
            },
            onClick: _this3.handlePreset.bind(null, preset)
          }, preset.name));
        }), R('li', null, R('a', {
          style: {
            padding: 5
          },
          onClick: function onClick() {
            return _this3.setState({
              custom: true
            });
          }
        }, "Custom Date Range..."))));
      }
    }, {
      key: "renderDropdown",
      value: function renderDropdown() {
        if (this.state.custom) {
          return this.renderCustomDropdown();
        } else {
          return this.renderPresets();
        }
      }
    }, {
      key: "renderCustomDropdown",
      value: function renderCustomDropdown() {
        var endDate, ref, ref1, ref2, ref3, startDate;
        startDate = this.toMoment((ref = this.props.value) != null ? (ref1 = ref.exprs[0]) != null ? ref1.value : void 0 : void 0);
        endDate = this.toMoment((ref2 = this.props.value) != null ? (ref3 = ref2.exprs[1]) != null ? ref3.value : void 0 : void 0);
        return R('div', {
          style: {
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: 4000,
            padding: 5,
            border: "solid 1px #AAA",
            backgroundColor: "white",
            borderRadius: 4
          }
        }, R('div', {
          style: {
            whiteSpace: "nowrap"
          }
        }, R('div', {
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
        })), R('div', {
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
        }))));
      }
    }, {
      key: "render",
      value: function render() {
        var _this4 = this;

        return R(ClickOutHandler, {
          onClickOut: this.handleClickOut
        }, R('div', {
          style: {
            display: "inline-block",
            position: "relative"
          }
        }, R('div', {
          className: "form-control",
          style: {
            width: 220,
            height: 36
          },
          onClick: function onClick() {
            return _this4.setState({
              dropdownOpen: true,
              custom: false
            });
          } // Clear button

        }, this.renderSummary()), this.props.value && this.props.onChange != null ? this.renderClear() : void 0, this.state.dropdownOpen ? this.renderDropdown() : void 0));
      }
    }]);
    return DateExprComponent;
  }(React.Component);

  ;
  DateExprComponent.propTypes = {
    value: PropTypes.any,
    // Current value of quickfilter (state of filter selected)
    onChange: PropTypes.func,
    // Called when value changes
    datetime: PropTypes.bool // True to use datetime

  };
  return DateExprComponent;
}.call(void 0);

presets = [{
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
}];