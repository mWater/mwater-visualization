"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var ActionCancelModalComponent,
    ExprComponent,
    ExprInsertModalComponent,
    ExprItemEditorComponent,
    ExprUtils,
    PropTypes,
    R,
    React,
    TableSelectComponent,
    uuid,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
uuid = require('uuid');
ExprUtils = require("mwater-expressions").ExprUtils;
ExprComponent = require("mwater-expressions-ui").ExprComponent;
ActionCancelModalComponent = require("react-library/lib/ActionCancelModalComponent");
TableSelectComponent = require('../../TableSelectComponent');
ExprItemEditorComponent = require('./ExprItemEditorComponent'); // Modal that displays an expression builder

module.exports = ExprInsertModalComponent = function () {
  var ExprInsertModalComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(ExprInsertModalComponent, _React$Component);

    function ExprInsertModalComponent(props) {
      var _this;

      (0, _classCallCheck2.default)(this, ExprInsertModalComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ExprInsertModalComponent).call(this, props));
      _this.handleInsert = _this.handleInsert.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.state = {
        open: false,
        exprItem: null
      };
      return _this;
    }

    (0, _createClass2.default)(ExprInsertModalComponent, [{
      key: "open",
      value: function open() {
        return this.setState({
          open: true,
          exprItem: {
            type: "expr",
            id: uuid()
          }
        });
      }
    }, {
      key: "handleInsert",
      value: function handleInsert(ev) {
        var _this2 = this;

        boundMethodCheck(this, ExprInsertModalComponent);

        if (!this.state.exprItem) {
          return;
        } // Close first to avoid strange effects when mixed with pojoviews


        return this.setState({
          open: false
        }, function () {
          return _this2.props.onInsert(_this2.state.exprItem);
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        if (!this.state.open) {
          return null;
        }

        return R(ActionCancelModalComponent, {
          actionLabel: "Insert",
          onAction: this.handleInsert,
          onCancel: function onCancel() {
            return _this3.setState({
              open: false
            });
          },
          title: "Insert Field"
        }, R(ExprItemEditorComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          exprItem: this.state.exprItem,
          onChange: function onChange(exprItem) {
            return _this3.setState({
              exprItem: exprItem
            });
          },
          singleRowTable: this.props.singleRowTable
        }));
      }
    }]);
    return ExprInsertModalComponent;
  }(React.Component);

  ;
  ExprInsertModalComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    // Data source to use to get values
    onInsert: PropTypes.func.isRequired,
    // Called with expr item to insert
    singleRowTable: PropTypes.string // Table that is filtered to have one row

  };
  return ExprInsertModalComponent;
}.call(void 0);