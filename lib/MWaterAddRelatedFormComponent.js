"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var $,
    AddRelatedFormModalComponent,
    ExprUtils,
    MWaterAddRelatedFormComponent,
    ModalPopupComponent,
    PropTypes,
    R,
    React,
    _,
    escapeRegex,
    formUtils,
    moment,
    querystring,
    ui,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

$ = require('jquery');
PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
moment = require('moment');
ModalPopupComponent = require('react-library/lib/ModalPopupComponent');
querystring = require('querystring');
ExprUtils = require('mwater-expressions').ExprUtils;
ui = require('./UIComponents');
formUtils = require('mwater-forms/lib/formUtils'); // TODO requireing this directly because of bizarre backbone issue
// Link that when clicked popup up a modal window allowing user to select a form
// with an Entity/Site question to the extraTables

module.exports = MWaterAddRelatedFormComponent = function () {
  var MWaterAddRelatedFormComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(MWaterAddRelatedFormComponent, _React$Component);

    function MWaterAddRelatedFormComponent(props) {
      var _this;

      (0, _classCallCheck2.default)(this, MWaterAddRelatedFormComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(MWaterAddRelatedFormComponent).call(this, props));
      _this.handleOpen = _this.handleOpen.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleSelect = _this.handleSelect.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.state = {
        open: false,
        waitingForTable: null // Set to table id that is being waited for as the result of being selected

      };
      return _this;
    }

    (0, _createClass2.default)(MWaterAddRelatedFormComponent, [{
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(nextProps) {
        // If waiting and table has arrived, cancel waiting
        if (this.state.waitingForTable && nextProps.schema.getTable(this.state.waitingForTable)) {
          return this.setState({
            waitingForTable: null
          });
        }
      }
    }, {
      key: "handleOpen",
      value: function handleOpen() {
        boundMethodCheck(this, MWaterAddRelatedFormComponent);
        return this.setState({
          open: true
        });
      }
    }, {
      key: "handleSelect",
      value: function handleSelect(table) {
        boundMethodCheck(this, MWaterAddRelatedFormComponent);
        this.setState({
          open: false
        }); // Wait for table if not in schema

        if (!this.props.schema.getTable(table)) {
          this.setState({
            waitingForTable: table
          });
        }

        return this.props.onSelect(table);
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        return R('div', null, this.state.waitingForTable ? R('div', null, R('i', {
          className: "fa fa-spin fa-spinner"
        }), " Adding...") : R('a', {
          className: "btn btn-link",
          onClick: this.handleOpen
        }, "+ Add Related Survey"), this.state.open ? R(AddRelatedFormModalComponent, {
          table: this.props.table,
          apiUrl: this.props.apiUrl,
          client: this.props.client,
          user: this.props.user,
          onSelect: this.handleSelect,
          onCancel: function onCancel() {
            return _this2.setState({
              open: false
            });
          }
        }) : void 0);
      }
    }]);
    return MWaterAddRelatedFormComponent;
  }(React.Component);

  ;
  MWaterAddRelatedFormComponent.propTypes = {
    table: PropTypes.string.isRequired,
    apiUrl: PropTypes.string.isRequired,
    client: PropTypes.string,
    user: PropTypes.string,
    // User id
    onSelect: PropTypes.func.isRequired,
    // Called with table id e.g. responses:someid
    schema: PropTypes.object.isRequired
  };
  return MWaterAddRelatedFormComponent;
}.call(void 0);

AddRelatedFormModalComponent = function () {
  // Actual modal that displays the 
  var AddRelatedFormModalComponent =
  /*#__PURE__*/
  function (_React$Component2) {
    (0, _inherits2.default)(AddRelatedFormModalComponent, _React$Component2);

    function AddRelatedFormModalComponent(props) {
      var _this3;

      (0, _classCallCheck2.default)(this, AddRelatedFormModalComponent);
      _this3 = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(AddRelatedFormModalComponent).call(this, props));
      _this3.state = {
        items: null,
        search: ""
      };
      return _this3;
    }

    (0, _createClass2.default)(AddRelatedFormModalComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this4 = this;

        var query; // Get all forms visible to user

        query = {};
        query.selector = JSON.stringify({
          state: {
            $ne: "deleted"
          }
        });

        if (this.props.client) {
          query.client = this.props.client;
        } // Get list of all form names


        return $.getJSON(this.props.apiUrl + "forms?" + querystring.stringify(query), function (forms) {
          var items; // Sort by modified.on desc but first by user

          forms = _.sortByOrder(forms, [function (form) {
            if (form.created.by === _this4.props.user) {
              return 1;
            } else {
              return 0;
            }
          }, function (form) {
            return form.modified.on;
          }], ['desc', 'desc']); // Filter by Entity and Site questions of tableId type

          forms = _.filter(forms, function (form) {
            return formUtils.findEntityQuestion(form.design, _this4.props.table.split(".")[1]);
          }); // Get _id, name, and description

          items = _.map(forms, function (form) {
            return {
              name: ExprUtils.localizeString(form.design.name, _this4.context.locale),
              desc: "Modified ".concat(moment(form.modified.on, moment.ISO_8601).format("ll")),
              onClick: _this4.props.onSelect.bind(null, "responses:" + form._id)
            };
          });
          return _this4.setState({
            items: items
          });
        }).fail(function (xhr) {
          return _this4.setState({
            error: xhr.responseText
          });
        });
      }
    }, {
      key: "renderContents",
      value: function renderContents() {
        var _this5 = this;

        var items, searchStringRegExp;

        if (!this.state.items) {
          return R('div', {
            className: "alert alert-info"
          }, R('i', {
            className: "fa fa-spin fa-spinner"
          }), " Loading...");
        }

        items = this.state.items; // Filter by search

        if (this.state.search) {
          searchStringRegExp = new RegExp(escapeRegex(this.state.search), "i");
          items = _.filter(items, function (item) {
            return item.name.match(searchStringRegExp);
          });
        }

        return R('div', null, R('input', {
          type: "text",
          className: "form-control",
          placeholder: "Search...",
          key: "search",
          ref: this.searchRef,
          style: {
            marginBottom: 10
          },
          value: this.state.search,
          onChange: function onChange(ev) {
            return _this5.setState({
              search: ev.target.value
            });
          }
        }), R(ui.OptionListComponent, {
          items: items
        }));
      }
    }, {
      key: "render",
      value: function render() {
        return R(ModalPopupComponent, {
          showCloseX: true,
          onClose: this.props.onCancel,
          header: "Add Related Survey"
        }, this.renderContents());
      }
    }]);
    return AddRelatedFormModalComponent;
  }(React.Component);

  ;
  AddRelatedFormModalComponent.propTypes = {
    table: PropTypes.string.isRequired,
    apiUrl: PropTypes.string.isRequired,
    client: PropTypes.string,
    user: PropTypes.string,
    // User id
    onSelect: PropTypes.func.isRequired,
    // Called with table id e.g. responses:someid
    onCancel: PropTypes.func.isRequired // When modal is closed

  };
  AddRelatedFormModalComponent.contextTypes = {
    locale: PropTypes.string // e.g. "en"

  };
  return AddRelatedFormModalComponent;
}.call(void 0);

escapeRegex = function escapeRegex(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};