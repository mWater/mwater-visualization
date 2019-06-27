"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var BlocksLayoutManager,
    DirectWidgetDataSource,
    EditPopupComponent,
    ModalWindowComponent,
    PopupFilterJoinsEditComponent,
    PropTypes,
    R,
    React,
    WidgetFactory,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
ModalWindowComponent = require('react-library/lib/ModalWindowComponent');
BlocksLayoutManager = require('../layouts/blocks/BlocksLayoutManager');
WidgetFactory = require('../widgets/WidgetFactory');
DirectWidgetDataSource = require('../widgets/DirectWidgetDataSource');
PopupFilterJoinsEditComponent = require('./PopupFilterJoinsEditComponent'); // Modal for editing design of popup

module.exports = EditPopupComponent = function () {
  var EditPopupComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(EditPopupComponent, _React$Component);

    function EditPopupComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, EditPopupComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(EditPopupComponent).call(this, props));
      _this.handleItemsChange = _this.handleItemsChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleRemovePopup = _this.handleRemovePopup.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        editing: false
      };
      return _this;
    }

    (0, _createClass2["default"])(EditPopupComponent, [{
      key: "handleItemsChange",
      value: function handleItemsChange(items) {
        var design, popup;
        boundMethodCheck(this, EditPopupComponent);
        popup = this.props.design.popup || {};
        popup = _.extend({}, popup, {
          items: items
        });
        design = _.extend({}, this.props.design, {
          popup: popup
        });
        return this.props.onDesignChange(design);
      }
    }, {
      key: "handleRemovePopup",
      value: function handleRemovePopup() {
        var design;
        boundMethodCheck(this, EditPopupComponent);
        design = _.omit(this.props.design, "popup");
        return this.props.onDesignChange(design);
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var ref;
        return R('div', null, R('a', {
          className: "btn btn-link",
          onClick: function onClick() {
            return _this2.setState({
              editing: true
            });
          }
        }, R('i', {
          className: "fa fa-pencil"
        }), " Customize Popup"), this.props.design.popup ? R('a', {
          className: "btn btn-link",
          onClick: this.handleRemovePopup
        }, R('i', {
          className: "fa fa-times"
        }), " Remove Popup") : void 0, this.props.design.popup ? R(PopupFilterJoinsEditComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          idTable: this.props.idTable,
          defaultPopupFilterJoins: this.props.defaultPopupFilterJoins,
          popup: this.props.design.popup,
          design: this.props.design.popupFilterJoins,
          onDesignChange: function onDesignChange(popupFilterJoins) {
            return _this2.props.onDesignChange(_.extend({}, _this2.props.design, {
              popupFilterJoins: popupFilterJoins
            }));
          }
        }) : void 0, this.state.editing ? R(ModalWindowComponent, {
          isOpen: true,
          onRequestClose: function onRequestClose() {
            return _this2.setState({
              editing: false
            });
          }
        }, new BlocksLayoutManager().renderLayout({
          items: (ref = this.props.design.popup) != null ? ref.items : void 0,
          style: "popup",
          onItemsChange: this.handleItemsChange,
          disableMaps: true,
          renderWidget: function renderWidget(options) {
            var widget, widgetDataSource;
            widget = WidgetFactory.createWidget(options.type);
            widgetDataSource = new DirectWidgetDataSource({
              widget: widget,
              schema: _this2.props.schema,
              dataSource: _this2.props.dataSource
            });
            return widget.createViewElement({
              schema: _this2.props.schema,
              dataSource: _this2.props.dataSource,
              widgetDataSource: widgetDataSource,
              design: options.design,
              scope: null,
              filters: [],
              onScopeChange: null,
              onDesignChange: options.onDesignChange,
              width: options.width,
              height: options.height,
              standardWidth: options.standardWidth,
              singleRowTable: _this2.props.table
            });
          }
        })) : void 0);
      }
    }]);
    return EditPopupComponent;
  }(React.Component);

  ;
  EditPopupComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    dataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    // Design of the marker layer
    onDesignChange: PropTypes.func.isRequired,
    // Called with new design
    table: PropTypes.string.isRequired,
    // Table that popup is for
    idTable: PropTypes.string.isRequired,
    // Table of the row that join is to. Usually same as table except for choropleth maps
    defaultPopupFilterJoins: PropTypes.object.isRequired // Default popup filter joins

  };
  return EditPopupComponent;
}.call(void 0);