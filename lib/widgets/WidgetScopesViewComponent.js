"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var PropTypes,
    R,
    React,
    WidgetScopesViewComponent,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
R = React.createElement; // Shows widget scopes

module.exports = WidgetScopesViewComponent = function () {
  var WidgetScopesViewComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(WidgetScopesViewComponent, _React$Component);

    function WidgetScopesViewComponent() {
      var _this;

      (0, _classCallCheck2.default)(this, WidgetScopesViewComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(WidgetScopesViewComponent).apply(this, arguments));
      _this.renderScope = _this.renderScope.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      return _this;
    }

    (0, _createClass2.default)(WidgetScopesViewComponent, [{
      key: "renderScope",
      value: function renderScope(id, scope) {
        var style;
        boundMethodCheck(this, WidgetScopesViewComponent);
        style = {
          cursor: "pointer",
          borderRadius: 4,
          border: "solid 1px #BBB",
          padding: "1px 5px 1px 5px",
          color: "#666",
          backgroundColor: "#EEE",
          display: "inline-block",
          marginLeft: 4,
          marginRight: 4
        };

        if (!scope) {
          return null;
        }

        return R('div', {
          key: id,
          style: style,
          onClick: this.props.onRemoveScope.bind(null, id)
        }, scope.name, " ", R('span', {
          className: "glyphicon glyphicon-remove"
        }));
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var scopes;
        scopes = this.props.scopes;

        if (_.compact(_.values(scopes)).length === 0) {
          return null;
        }

        return R('div', {
          className: "alert alert-info"
        }, R('span', {
          className: "glyphicon glyphicon-filter"
        }), " Filters: ", _.map(_.keys(scopes), function (id) {
          return _this2.renderScope(id, scopes[id]);
        }));
      }
    }]);
    return WidgetScopesViewComponent;
  }(React.Component);

  ;
  WidgetScopesViewComponent.propTypes = {
    scopes: PropTypes.object.isRequired,
    // lookup of id to scope (see WidgetScoper for definition)
    onRemoveScope: PropTypes.func.isRequired // Called with id of scope to remove

  };
  return WidgetScopesViewComponent;
}.call(void 0);