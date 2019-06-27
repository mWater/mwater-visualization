"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var MarkerSymbolSelectComponent, PropTypes, R, React, ReactSelect, _;

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
ReactSelect = require('react-select')["default"]; // Allows selecting of map marker symbol

module.exports = MarkerSymbolSelectComponent = function () {
  var MarkerSymbolSelectComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(MarkerSymbolSelectComponent, _React$Component);

    function MarkerSymbolSelectComponent() {
      (0, _classCallCheck2["default"])(this, MarkerSymbolSelectComponent);
      return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(MarkerSymbolSelectComponent).apply(this, arguments));
    }

    (0, _createClass2["default"])(MarkerSymbolSelectComponent, [{
      key: "render",
      value: function render() {
        var _this = this;

        var optionRenderer, options; // Create options

        options = [{
          value: "font-awesome/dot-circle-o",
          label: "Dot circle"
        }, {
          value: "font-awesome/bullseye",
          label: "Bullseye"
        }, {
          value: "font-awesome/star",
          label: "Star"
        }, {
          value: "font-awesome/square",
          label: "Square"
        }, {
          value: "font-awesome/home",
          label: "Home"
        }, {
          value: "font-awesome/plus",
          label: "Plus"
        }, {
          value: "font-awesome/plus-circle",
          label: "Plus Circle"
        }, {
          value: "font-awesome/plus-square",
          label: "Plus Square"
        }, {
          value: "font-awesome/asterisk",
          label: "Asterisk"
        }, {
          value: "font-awesome/mobile",
          label: "Mobile"
        }, {
          value: "font-awesome/check",
          label: "Check"
        }, {
          value: "font-awesome/university",
          label: "Institution"
        }, {
          value: "font-awesome/check-circle",
          label: "Check Circle"
        }, {
          value: "font-awesome/times",
          label: "Removed"
        }, {
          value: "font-awesome/ban",
          label: "Ban"
        }, {
          value: "font-awesome/crosshairs",
          label: "Crosshairs"
        }, {
          value: "font-awesome/flask",
          label: "Flask"
        }, {
          value: "font-awesome/flag",
          label: "Flag"
        }, {
          value: "font-awesome/info-circle",
          label: "Info Circle"
        }, {
          value: "font-awesome/exclamation-circle",
          label: "Exclamation Circle"
        }, {
          value: "font-awesome/exclamation-triangle",
          label: "Exclamation Triangle"
        }, {
          value: "font-awesome/bell",
          label: "Bell"
        }, {
          value: "font-awesome/bolt",
          label: "Bolt"
        }, {
          value: "font-awesome/building",
          label: "Building"
        }, {
          value: "font-awesome/bus",
          label: "Bus"
        }, {
          value: "font-awesome/certificate",
          label: "Certificate"
        }, {
          value: "font-awesome/comment",
          label: "Comment"
        }, {
          value: "font-awesome/male",
          label: "Male"
        }, {
          value: "font-awesome/female",
          label: "Female"
        }, {
          value: "font-awesome/user",
          label: "Person"
        }, {
          value: "font-awesome/users",
          label: "Group"
        }, {
          value: "font-awesome/wheelchair",
          label: "Wheelchair"
        }, {
          value: "font-awesome/h-square",
          label: "Hospital Symbol"
        }, {
          value: "font-awesome/thumbs-up",
          label: "Thumbs Up"
        }, {
          value: "font-awesome/thumbs-down",
          label: "Thumbs Down"
        }, {
          value: "font-awesome/ticket",
          label: "Ticket"
        }, {
          value: "font-awesome/tint",
          label: "Tint"
        }, {
          value: "font-awesome/times-circle",
          label: "Times Circle"
        }, {
          value: "font-awesome/tree",
          label: "Tree"
        }, {
          value: "font-awesome/file",
          label: "File"
        }, {
          value: "font-awesome/usd",
          label: "USD"
        }, {
          value: "font-awesome/caret-up",
          label: "Caret Up"
        }, {
          value: "font-awesome/chevron-circle-up",
          label: "Chevron Up"
        }, {
          value: "font-awesome/chevron-circle-down",
          label: "Chevron Down"
        }, {
          value: "font-awesome/medkit",
          label: "Medkit"
        }, {
          value: "font-awesome/cloud",
          label: "Cloud"
        }, {
          value: "font-awesome/beer",
          label: "Cup"
        }];

        optionRenderer = function optionRenderer(option) {
          return R('span', null, R('i', {
            className: "fa fa-".concat(option.value.substr(13) // Trim "font-awesome/"
            )
          }), " ".concat(option.label));
        };

        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, R('span', {
          className: "fa fa-star"
        }), " ", "Symbol"), R(ReactSelect, {
          placeholder: "Circle",
          value: _.findWhere(options, {
            value: this.props.symbol
          }) || null,
          options: options,
          formatOptionLabel: optionRenderer,
          isClearable: true,
          onChange: function onChange(opt) {
            return _this.props.onChange((opt != null ? opt.value : void 0) || null);
          }
        }));
      }
    }]);
    return MarkerSymbolSelectComponent;
  }(React.Component);

  ;
  MarkerSymbolSelectComponent.propTypes = {
    symbol: PropTypes.string,
    onChange: PropTypes.func.isRequired
  };
  return MarkerSymbolSelectComponent;
}.call(void 0);