"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var DropdownWidgetComponent,
    IFrameWidgetComponent,
    ModalPopupComponent,
    PropTypes,
    R,
    React,
    _,
    ui,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
_ = require('lodash');
ui = require('react-library/lib/bootstrap');
DropdownWidgetComponent = require('./DropdownWidgetComponent');
ModalPopupComponent = require('react-library/lib/ModalPopupComponent');

module.exports = IFrameWidgetComponent = function () {
  var IFrameWidgetComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(IFrameWidgetComponent, _React$Component);

    function IFrameWidgetComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, IFrameWidgetComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(IFrameWidgetComponent).call(this, props));
      _this.handleStartEditing = _this.handleStartEditing.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleEndEditing = _this.handleEndEditing.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        // True when editing chart
        editing: false,
        editUrl: null
      };
      return _this;
    }

    (0, _createClass2["default"])(IFrameWidgetComponent, [{
      key: "handleStartEditing",
      value: function handleStartEditing() {
        boundMethodCheck(this, IFrameWidgetComponent);
        return this.setState({
          editing: true,
          editUrl: this.props.design.url
        });
      }
    }, {
      key: "handleEndEditing",
      value: function handleEndEditing() {
        boundMethodCheck(this, IFrameWidgetComponent);
        this.setState({
          editing: false
        });
        return this.props.onDesignChange(_.extend({}, this.props.design, {
          url: this.state.editUrl
        }));
      }
    }, {
      key: "renderEditor",
      value: function renderEditor() {
        var _this2 = this;

        var content;

        if (!this.state.editing) {
          return null;
        }

        content = R('div', {
          className: "form-group"
        }, R('label', null, "URL to embed"), R('input', {
          type: "text",
          className: "form-control",
          value: this.state.editUrl || "",
          onChange: function onChange(ev) {
            return _this2.setState({
              editUrl: ev.target.value
            });
          }
        }), R('p', {
          className: "help-block"
        }, 'e.g. https://www.youtube.com/embed/dQw4w9WgXcQ'));
        return R(ModalPopupComponent, {
          header: "Configure",
          showCloseX: true,
          onClose: this.handleEndEditing
        }, content);
      } // Render a link to start editing

    }, {
      key: "renderEditLink",
      value: function renderEditLink() {
        return R('div', {
          className: "mwater-visualization-widget-placeholder",
          onClick: this.handleStartEditing
        }, R(ui.Icon, {
          id: "fa-youtube-play"
        }));
      } // R 'div', style: { position: "absolute", bottom: @props.height / 2, left: 0, right: 0, textAlign: "center" },
      //   R 'a', className: "btn btn-link", onClick: @handleStartEditing, "Click Here to Configure"

    }, {
      key: "render",
      value: function render() {
        var dropdownItems;
        dropdownItems = [];

        if (this.props.onDesignChange != null) {
          dropdownItems.push({
            label: "Edit",
            icon: "pencil",
            onClick: this.handleStartEditing
          });
        }

        return R(DropdownWidgetComponent, {
          width: this.props.width,
          height: this.props.height,
          dropdownItems: dropdownItems
        }, this.renderEditor(), this.props.design.url ? R('iframe', {
          src: this.props.design.url,
          width: this.props.width,
          height: this.props.height,
          frameborder: 0,
          allowfullscreen: true
        }) : this.props.onDesignChange != null ? this.renderEditLink() : void 0);
      }
    }]);
    return IFrameWidgetComponent;
  }(React.Component);

  ;
  IFrameWidgetComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    // Called with new design. null/undefined for readonly
    width: PropTypes.number,
    height: PropTypes.number
  };
  return IFrameWidgetComponent;
}.call(void 0);