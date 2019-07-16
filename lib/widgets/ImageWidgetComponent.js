"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var AsyncLoadComponent,
    AutoSizeComponent,
    DropdownWidgetComponent,
    Dropzone,
    ExprComponent,
    ImageUploaderComponent,
    ImageWidgetComponent,
    ImageWidgetDesignComponent,
    ImagelistCarouselComponent,
    ModalPopupComponent,
    PropTypes,
    R,
    React,
    RotatedImageComponent,
    TabbedComponent,
    TableSelectComponent,
    _,
    classNames,
    ui,
    uuid,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
_ = require('lodash');
classNames = require('classnames');
ui = require('react-library/lib/bootstrap');
uuid = require('uuid');
Dropzone = require('react-dropzone');
AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent');
AutoSizeComponent = require('react-library/lib/AutoSizeComponent');
DropdownWidgetComponent = require('./DropdownWidgetComponent');
ModalPopupComponent = require('react-library/lib/ModalPopupComponent');
TabbedComponent = require('react-library/lib/TabbedComponent');
ExprComponent = require("mwater-expressions-ui").ExprComponent;
TableSelectComponent = require('../TableSelectComponent');
ImageUploaderComponent = require('./ImageUploaderComponent');
ImagelistCarouselComponent = require('./ImagelistCarouselComponent');

module.exports = ImageWidgetComponent = function () {
  var ImageWidgetComponent =
  /*#__PURE__*/
  function (_AsyncLoadComponent) {
    (0, _inherits2["default"])(ImageWidgetComponent, _AsyncLoadComponent);

    function ImageWidgetComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, ImageWidgetComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(ImageWidgetComponent).apply(this, arguments));
      _this.handleStartEditing = _this.handleStartEditing.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    } // Override to determine if a load is needed. Not called on mounting


    (0, _createClass2["default"])(ImageWidgetComponent, [{
      key: "isLoadNeeded",
      value: function isLoadNeeded(newProps, oldProps) {
        return newProps.design.expr && (!_.isEqual(newProps.design.expr, oldProps.design.expr) || !_.isEqual(newProps.filters, oldProps.filters));
      } // Call callback with state changes

    }, {
      key: "load",
      value: function load(props, prevProps, callback) {
        // Get data
        return props.widgetDataSource.getData(props.design, props.filters, function (error, data) {
          return callback({
            error: error,
            data: data
          });
        });
      }
    }, {
      key: "handleStartEditing",
      value: function handleStartEditing() {
        boundMethodCheck(this, ImageWidgetComponent);
        return this.editor.edit();
      } // Render a link to start editing

    }, {
      key: "renderEditLink",
      value: function renderEditLink() {
        return R('div', {
          className: "mwater-visualization-widget-placeholder",
          onClick: this.handleStartEditing
        }, R('i', {
          className: "icon fa fa-image"
        }));
      }
    }, {
      key: "renderEditor",
      value: function renderEditor() {
        var _this2 = this;

        return R(ImageWidgetDesignComponent, {
          ref: function ref(c) {
            return _this2.editor = c;
          },
          key: "editor",
          design: this.props.design,
          onDesignChange: this.props.onDesignChange,
          schema: this.props.schema,
          dataSource: this.props.dataSource
        });
      }
    }, {
      key: "renderExpression",
      value: function renderExpression() {
        var _this3 = this;

        if (this.state.loading) {
          return R('span', null, "Loading");
        } else if (this.state.data) {
          // Make into array if not
          if (!_.isArray(this.state.data)) {
            return R(AutoSizeComponent, {
              injectHeight: true
            }, function (size) {
              return R(ImagelistCarouselComponent, {
                widgetDataSource: _this3.props.widgetDataSource,
                imagelist: [_this3.state.data],
                height: size.height
              });
            });
          } else {
            return R(AutoSizeComponent, {
              injectHeight: true
            }, function (size) {
              return R(ImagelistCarouselComponent, {
                widgetDataSource: _this3.props.widgetDataSource,
                imagelist: _this3.state.data,
                height: size.height
              });
            });
          }
        }
      }
    }, {
      key: "renderContent",
      value: function renderContent() {
        var imageHeight, source;

        if (this.props.design.imageUrl || this.props.design.uid) {
          // Determine approximate height
          imageHeight = null;

          if (this.props.height <= 160) {
            imageHeight = 160;
          } else if (this.props.height <= 320) {
            imageHeight = 320;
          } else if (this.props.height <= 640) {
            imageHeight = 640;
          } else if (this.props.height <= 1280) {
            imageHeight = 1280;
          }

          source = this.props.design.imageUrl || this.props.widgetDataSource.getImageUrl(this.props.design.uid, imageHeight);
          return R(RotatedImageComponent, {
            imgUrl: source,
            url: this.props.design.url,
            rotation: this.props.design.rotation
          });
        } else {
          return this.renderExpression();
        }
      }
    }, {
      key: "render",
      value: function render() {
        var captionPosition, dropdownItems;
        dropdownItems = [];

        if (this.props.onDesignChange != null) {
          dropdownItems.push({
            label: "Edit",
            icon: "pencil",
            onClick: this.handleStartEditing
          });
        }

        captionPosition = this.props.design.captionPosition || "bottom";
        return R(DropdownWidgetComponent, {
          width: this.props.width,
          height: this.props.height,
          dropdownItems: dropdownItems
        }, this.renderEditor(), !this.props.design.imageUrl && !this.props.design.expr && !this.props.design.uid && this.props.onDesignChange ? this.renderEditLink() : R('div', {
          className: "mwater-visualization-image-widget",
          style: {
            position: "relative",
            width: this.props.width,
            height: this.props.height
          }
        }, captionPosition === "top" ? R('div', {
          className: "caption"
        }, this.props.design.caption) : void 0, R('div', {
          className: "image"
        }, this.renderContent()), captionPosition === "bottom" ? R('div', {
          className: "caption"
        }, this.props.design.caption) : void 0));
      }
    }]);
    return ImageWidgetComponent;
  }(AsyncLoadComponent);

  ;
  ImageWidgetComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    // Called with new design. null/undefined for readonly
    filters: PropTypes.array,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    // Data source to use for widget
    widgetDataSource: PropTypes.object.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    singleRowTable: PropTypes.string // Table that is filtered to have one row

  };
  return ImageWidgetComponent;
}.call(void 0);

ImageWidgetDesignComponent = function () {
  var ImageWidgetDesignComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(ImageWidgetDesignComponent, _React$Component);

    function ImageWidgetDesignComponent(props) {
      var _this4;

      (0, _classCallCheck2["default"])(this, ImageWidgetDesignComponent);
      _this4 = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(ImageWidgetDesignComponent).call(this, props));
      _this4.edit = _this4.edit.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleImageUrlChange = _this4.handleImageUrlChange.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleUrlChange = _this4.handleUrlChange.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleFileUpload = _this4.handleFileUpload.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleExpressionChange = _this4.handleExpressionChange.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleTableChange = _this4.handleTableChange.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleCaptionChange = _this4.handleCaptionChange.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleRotationChange = _this4.handleRotationChange.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleCaptionPositionChange = _this4.handleCaptionPositionChange.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleSave = _this4.handleSave.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleCancel = _this4.handleCancel.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.state = {
        // Widget data
        data: null,
        error: null,
        editing: false,
        imageUrl: null,
        expr: null,
        table: null,
        uid: null,
        files: null,
        uploading: false,
        caption: null,
        currentTab: "url",
        rotation: null,
        captionPosition: null,
        url: null
      };
      return _this4;
    }

    (0, _createClass2["default"])(ImageWidgetDesignComponent, [{
      key: "edit",
      value: function edit() {
        var ref, state;
        boundMethodCheck(this, ImageWidgetDesignComponent);
        this.setCurrentTab();
        state = {
          editing: true,
          imageUrl: this.props.design.imageUrl,
          uid: this.props.design.uid,
          expr: this.props.design.expr,
          table: (ref = this.props.design.expr) != null ? ref.table : void 0,
          caption: this.props.design.caption,
          rotation: this.props.design.rotation,
          captionPosition: this.props.design.captionPosition,
          url: this.props.design.url
        };
        return this.setState(state);
      }
    }, {
      key: "setCurrentTab",
      value: function setCurrentTab() {
        var tab;
        tab = "upload";

        if (this.props.design.url) {
          tab = "url";
        }

        if (this.props.design.expr) {
          tab = "expression";
        }

        return this.setState({
          currentTab: tab
        });
      }
    }, {
      key: "handleImageUrlChange",
      value: function handleImageUrlChange(e) {
        boundMethodCheck(this, ImageWidgetDesignComponent);
        return this.setState({
          imageUrl: e.target.value,
          uid: null,
          expr: null
        });
      }
    }, {
      key: "handleUrlChange",
      value: function handleUrlChange(e) {
        boundMethodCheck(this, ImageWidgetDesignComponent);
        return this.setState({
          url: e.target.value
        });
      }
    }, {
      key: "renderUploadEditor",
      value: function renderUploadEditor() {
        return R('div', null, R(ImageUploaderComponent, {
          dataSource: this.props.dataSource,
          onUpload: this.handleFileUpload,
          uid: this.props.design.uid
        }), this.renderRotation());
      }
    }, {
      key: "handleFileUpload",
      value: function handleFileUpload(uid) {
        boundMethodCheck(this, ImageWidgetDesignComponent);
        return this.setState({
          imageUrl: null,
          uid: uid,
          expr: null
        });
      }
    }, {
      key: "handleExpressionChange",
      value: function handleExpressionChange(expr) {
        boundMethodCheck(this, ImageWidgetDesignComponent);
        return this.setState({
          imageUrl: null,
          uid: null,
          expr: expr,
          url: null
        });
      }
    }, {
      key: "handleTableChange",
      value: function handleTableChange(table) {
        boundMethodCheck(this, ImageWidgetDesignComponent);
        return this.setState({
          table: table
        });
      }
    }, {
      key: "handleCaptionChange",
      value: function handleCaptionChange(ev) {
        boundMethodCheck(this, ImageWidgetDesignComponent);
        return this.setState({
          caption: ev.target.value
        });
      }
    }, {
      key: "handleRotationChange",
      value: function handleRotationChange(rotation) {
        boundMethodCheck(this, ImageWidgetDesignComponent);
        return this.setState({
          rotation: rotation
        });
      }
    }, {
      key: "handleCaptionPositionChange",
      value: function handleCaptionPositionChange(captionPosition) {
        boundMethodCheck(this, ImageWidgetDesignComponent);
        return this.setState({
          captionPosition: captionPosition
        });
      }
    }, {
      key: "handleSave",
      value: function handleSave() {
        var updates;
        boundMethodCheck(this, ImageWidgetDesignComponent);
        this.setState({
          editing: false
        });
        updates = {
          imageUrl: this.state.imageUrl,
          url: this.state.url,
          uid: this.state.uid,
          expr: this.state.expr,
          caption: this.state.caption,
          rotation: this.state.rotation,
          captionPosition: this.state.captionPosition
        };
        return this.props.onDesignChange(_.extend({}, this.props.design, updates));
      }
    }, {
      key: "handleCancel",
      value: function handleCancel() {
        boundMethodCheck(this, ImageWidgetDesignComponent);
        this.setCurrentTab();
        return this.setState({
          editing: false,
          imageUrl: null,
          url: null,
          uid: null,
          expr: null,
          table: null,
          files: null,
          uploading: false,
          captionPosition: null
        });
      }
    }, {
      key: "renderExpressionEditor",
      value: function renderExpressionEditor() {
        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, R('i', {
          className: "fa fa-database"
        }), " ", "Data Source"), ": ", R(TableSelectComponent, {
          schema: this.props.schema,
          value: this.state.table,
          onChange: this.handleTableChange
        }), R('br'), this.state.table ? R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, "Field"), ": ", R(ExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.state.table,
          types: ['image', 'imagelist'],
          value: this.state.expr,
          aggrStatuses: ["individual", "literal"],
          onChange: this.handleExpressionChange
        })) : void 0);
      }
    }, {
      key: "renderRotation",
      value: function renderRotation() {
        return R('div', {
          style: {
            paddingTop: 10
          }
        }, "Rotation: ", R(ui.Radio, {
          value: this.state.rotation || null,
          radioValue: null,
          onChange: this.handleRotationChange,
          inline: true
        }, "0 degrees"), R(ui.Radio, {
          value: this.state.rotation || null,
          radioValue: 90,
          onChange: this.handleRotationChange,
          inline: true
        }, "90 degrees"), R(ui.Radio, {
          value: this.state.rotation || null,
          radioValue: 180,
          onChange: this.handleRotationChange,
          inline: true
        }, "180 degrees"), R(ui.Radio, {
          value: this.state.rotation || null,
          radioValue: 270,
          onChange: this.handleRotationChange,
          inline: true
        }, "270 degrees"));
      }
    }, {
      key: "renderImageUrlEditor",
      value: function renderImageUrlEditor() {
        return R('div', {
          className: "form-group"
        }, R('label', null, "URL of image"), R('input', {
          type: "text",
          className: "form-control",
          value: this.state.imageUrl || "",
          onChange: this.handleImageUrlChange
        }), R('p', {
          className: "help-block"
        }, 'e.g. http://somesite.com/image.jpg'), this.renderRotation());
      }
    }, {
      key: "renderUrlEditor",
      value: function renderUrlEditor() {
        return R('div', {
          className: "form-group"
        }, R('label', null, "URL to open"), R('input', {
          type: "text",
          className: "form-control",
          value: this.state.url || "",
          onChange: this.handleUrlChange
        }), R('p', {
          className: "help-block"
        }, 'e.g. http://somesite.com/'), R('p', {
          className: "help-block"
        }, 'When clicked on image, this link will open in a new tab'));
      }
    }, {
      key: "render",
      value: function render() {
        var content, footer;

        if (!this.state.editing) {
          return null;
        }

        content = R('div', null, R('div', {
          className: "form-group"
        }, R('label', null, "Caption"), R('input', {
          type: "text",
          className: "form-control",
          value: this.state.caption || "",
          onChange: this.handleCaptionChange,
          placeholder: "Optional caption to display below image"
        })), this.state.caption ? R('div', {
          className: "form-group"
        }, R('label', null, "Caption position"), R(ui.Select, {
          options: [{
            value: "bottom",
            label: "Bottom"
          }, {
            value: "top",
            label: "Top"
          }],
          value: this.state.captionPosition,
          onChange: this.handleCaptionPositionChange
        })) : void 0, R(TabbedComponent, {
          tabs: [{
            id: "upload",
            label: "Upload",
            elem: this.renderUploadEditor()
          }, {
            id: "expression",
            label: "From Data",
            elem: this.renderExpressionEditor()
          }, {
            id: "url",
            label: "From URL",
            elem: this.renderImageUrlEditor()
          }],
          initialTabId: this.state.currentTab // No target URL when using expressions

        }), this.state.imageUrl || this.state.uid ? this.renderUrlEditor() : void 0);
        footer = R('div', null, R('button', {
          key: "save",
          type: "button",
          className: "btn btn-primary",
          onClick: this.handleSave
        }, "Save"), R('button', {
          key: "cancel",
          type: "button",
          className: "btn btn-default",
          onClick: this.handleCancel
        }, "Cancel"));
        return R(ModalPopupComponent, {
          header: "Image",
          scrollDisabled: true,
          footer: footer
        }, content);
      }
    }]);
    return ImageWidgetDesignComponent;
  }(React.Component);

  ;
  ImageWidgetDesignComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    // Called with new design. null/undefined for readonly
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired // Data source to use for widget

  };
  return ImageWidgetDesignComponent;
}.call(void 0);

RotatedImageComponent = function () {
  // Image which is rotated by x degrees (0, 90, 180, 270)
  var RotatedImageComponent =
  /*#__PURE__*/
  function (_React$Component2) {
    (0, _inherits2["default"])(RotatedImageComponent, _React$Component2);

    function RotatedImageComponent() {
      (0, _classCallCheck2["default"])(this, RotatedImageComponent);
      return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(RotatedImageComponent).apply(this, arguments));
    }

    (0, _createClass2["default"])(RotatedImageComponent, [{
      key: "render",
      value: function render() {
        var _this5 = this;

        return R(AutoSizeComponent, {
          injectWidth: true,
          injectHeight: true
        }, function (size) {
          var classes, containerStyle, imageStyle, img;
          imageStyle = {};
          containerStyle = {}; // These css classes are defined in mwater-forms

          classes = classNames({
            "rotated": _this5.props.rotation,
            "rotate-90": _this5.props.rotation && _this5.props.rotation === 90,
            "rotate-180": _this5.props.rotation && _this5.props.rotation === 180,
            "rotate-270": _this5.props.rotation && _this5.props.rotation === 270
          });
          imageStyle.maxWidth = "100%";
          imageStyle.maxHeight = "100%"; // Set width if rotated left or right

          if (_this5.props.rotation === 90 || _this5.props.rotation === 270) {
            imageStyle.width = size.height;
          }

          img = R('span', {
            className: "rotated-image-container",
            style: containerStyle
          }, R('img', {
            src: _this5.props.imgUrl,
            style: imageStyle,
            className: classes,
            onClick: _this5.props.onClick,
            alt: _this5.props.caption || ""
          }));

          if (!_this5.props.url) {
            return img;
          } else {
            return R('a', {
              href: _this5.props.url,
              target: '_blank'
            }, img);
          }
        });
      }
    }]);
    return RotatedImageComponent;
  }(React.Component);

  ;
  RotatedImageComponent.propTypes = {
    imgUrl: PropTypes.string.isRequired,
    // Url of the image
    rotation: PropTypes.number,
    onClick: PropTypes.func,
    caption: PropTypes.string,
    url: PropTypes.string // Url to be opened when the image is clicked

  };
  return RotatedImageComponent;
}.call(void 0);