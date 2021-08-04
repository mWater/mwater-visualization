"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var ClickOutHandler,
    DatePicker,
    DateRangeComponent,
    PropTypes,
    R,
    React,
    _,
    moment,
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
DatePicker = require('react-datepicker')["default"]; // Allows selection of a date range

module.exports = DateRangeComponent = function () {
  var DateRangeComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(DateRangeComponent, _React$Component);

    var _super = _createSuper(DateRangeComponent);

    function DateRangeComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, DateRangeComponent);
      _this = _super.call(this, props);
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

    (0, _createClass2["default"])(DateRangeComponent, [{
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
      key: "handleClickOut",
      value: function handleClickOut() {
        boundMethodCheck(this, DateRangeComponent);
        return this.setState({
          dropdownOpen: false
        });
      }
    }, {
      key: "handleStartChange",
      value: function handleStartChange(value) {
        var ref, ref1;
        boundMethodCheck(this, DateRangeComponent); // Go to start of day if datetime

        if (this.props.datetime) {
          value = moment(value);
          value.startOf("day");
        } // Clear end if after


        if (((ref = this.props.value) != null ? ref[1] : void 0) && this.fromMoment(value) > this.props.value[1]) {
          return this.props.onChange([this.fromMoment(value), null]);
        } else {
          return this.props.onChange([this.fromMoment(value), (ref1 = this.props.value) != null ? ref1[1] : void 0]);
        }
      }
    }, {
      key: "handleEndChange",
      value: function handleEndChange(value) {
        var ref, ref1;
        boundMethodCheck(this, DateRangeComponent); // Go to end of day if datetime

        if (this.props.datetime) {
          value = moment(value);
          value.endOf("day");
        } // Clear start if before


        if (((ref = this.props.value) != null ? ref[0] : void 0) && this.fromMoment(value) < this.props.value[0]) {
          this.props.onChange([null, this.fromMoment(value)]);
        } else {
          this.props.onChange([(ref1 = this.props.value) != null ? ref1[0] : void 0, this.fromMoment(value)]);
        }

        return this.setState({
          dropdownOpen: false
        });
      }
    }, {
      key: "handlePreset",
      value: function handlePreset(preset) {
        var end, start;
        boundMethodCheck(this, DateRangeComponent); // Go to start/end of day if datetime

        if (this.props.datetime) {
          start = moment(preset.value[0]);
          start.startOf("day");
          end = moment(preset.value[1]);
          end.endOf("day");
        } else {
          start = preset.value[0];
          end = preset.value[1];
        }

        this.props.onChange([this.fromMoment(start), this.fromMoment(end)]);
        return this.setState({
          dropdownOpen: false
        });
      }
    }, {
      key: "getPresets",
      value: function getPresets() {
        var presets;
        presets = [{
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
        }];
        return presets;
      }
    }, {
      key: "renderClear",
      value: function renderClear() {
        var _this2 = this;

        boundMethodCheck(this, DateRangeComponent);
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
        var endDate, startDate;

        if (!this.props.value) {
          return R('span', {
            className: "text-muted"
          }, "All Dates");
        }

        startDate = this.toMoment(this.props.value[0]);
        endDate = this.toMoment(this.props.value[1]);
        return (startDate ? startDate.format("ll") : "") + " - " + (endDate ? endDate.format("ll") : "");
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
        }, _.map(this.getPresets(), function (preset) {
          return R('li', null, R('a', {
            style: {
              padding: 5
            },
            onClick: _this3.handlePreset.bind(null, preset)
          }, preset.label));
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
      key: "renderCustomDropdown",
      value: function renderCustomDropdown() {
        var endDate, ref, ref1, startDate;
        startDate = this.toMoment((ref = this.props.value) != null ? ref[0] : void 0);
        endDate = this.toMoment((ref1 = this.props.value) != null ? ref1[1] : void 0);
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
      key: "renderDropdown",
      value: function renderDropdown() {
        if (this.state.custom) {
          return this.renderCustomDropdown();
        } else {
          return this.renderPresets();
        }
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
            width: 220
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
    return DateRangeComponent;
  }(React.Component);

  ;
  DateRangeComponent.propTypes = {
    value: PropTypes.array,
    // Array of [start date, end date] in iso 8601 format
    onChange: PropTypes.func.isRequired,
    // Array of [start date, end date] in iso 8601 format
    datetime: PropTypes.bool // true if for datetime, not date

  };
  return DateRangeComponent;
}.call(void 0);