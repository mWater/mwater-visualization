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

var Dropzone,
    ImageUploaderComponent,
    PropTypes,
    R,
    React,
    uuid,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
React = require('react');
R = React.createElement;
Dropzone = require('react-dropzone');
uuid = require('uuid');

module.exports = ImageUploaderComponent = function () {
  var ImageUploaderComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(ImageUploaderComponent, _React$Component);

    var _super = _createSuper(ImageUploaderComponent);

    function ImageUploaderComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, ImageUploaderComponent);
      _this = _super.call(this, props);
      _this.onFileDrop = _this.onFileDrop.bind((0, _assertThisInitialized2["default"])(_this));
      _this.uploadProgress = _this.uploadProgress.bind((0, _assertThisInitialized2["default"])(_this));
      _this.uploadComplete = _this.uploadComplete.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleChangeImage = _this.handleChangeImage.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        uid: props.uid,
        files: null,
        uploading: false,
        editing: props.uid ? false : true
      };
      return _this;
    }

    (0, _createClass2["default"])(ImageUploaderComponent, [{
      key: "onFileDrop",
      value: function onFileDrop(files) {
        var fd, id;
        boundMethodCheck(this, ImageUploaderComponent);
        this.setState({
          files: files,
          uploading: true
        });
        this.xhr = new XMLHttpRequest();
        fd = new FormData();
        fd.append("image", files[0]);
        this.xhr.upload.onprogress = this.uploadProgress;
        this.xhr.addEventListener("load", this.uploadComplete, false);
        id = this.createId();
        this.xhr.open("POST", this.props.dataSource.getImageUrl(id));
        this.xhr.send(fd);
        return this.setState({
          uid: id
        });
      }
    }, {
      key: "uploadProgress",
      value: function uploadProgress(e) {
        var percentComplete;
        boundMethodCheck(this, ImageUploaderComponent);

        if (!this.progressBar) {
          return;
        }

        if (e.lengthComputable) {
          percentComplete = Math.round(e.loaded * 100 / e.total);
          return this.progressBar.style.width = "".concat(percentComplete, "%");
        } else {
          return this.progressBar.style.width = "100%";
        }
      }
    }, {
      key: "uploadComplete",
      value: function uploadComplete(e) {
        boundMethodCheck(this, ImageUploaderComponent);

        if (e.target.status === 200) {
          this.setState({
            uploading: false,
            files: null,
            editing: false
          });
          return this.props.onUpload(this.state.uid);
        } else {
          return alert("Upload failed: ".concat(e.target.responseText));
        }
      }
    }, {
      key: "createId",
      value: function createId() {
        return uuid().replace(/-/g, "");
      }
    }, {
      key: "renderUploader",
      value: function renderUploader() {
        var _this2 = this;

        return R('div', null, R(Dropzone, {
          className: 'dropzone',
          multiple: false,
          onDrop: this.onFileDrop
        }, this.state.uploading ? R('div', {
          className: 'progress'
        }, R('div', {
          className: 'progress-bar',
          style: {
            width: '0%'
          },
          ref: function ref(c) {
            return _this2.progressBar = c;
          }
        })) : R('div', null, "Drop file here or click to select file")), this.state.uid ? R('a', {
          onClick: function onClick() {
            return _this2.setState({
              editing: false
            });
          }
        }, "Cancel") : void 0);
      }
    }, {
      key: "renderPreview",
      value: function renderPreview() {
        var thumbnailStyle;
        thumbnailStyle = {
          width: "100px",
          maxWidth: "100%",
          maxHeight: "100%",
          padding: 4,
          border: '1px solid #aeaeae',
          marginRight: 20
        };
        return R('div', null, R('img', {
          style: thumbnailStyle,
          src: this.props.dataSource.getImageUrl(this.state.uid)
        }), R('a', {
          className: 'btn btn-default',
          onClick: this.handleChangeImage
        }, "Change"));
      }
    }, {
      key: "handleChangeImage",
      value: function handleChangeImage() {
        boundMethodCheck(this, ImageUploaderComponent);
        return this.setState({
          editing: true
        });
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', null, this.state.uid && !this.state.editing ? this.renderPreview() : void 0, this.state.editing || !this.state.uid ? this.renderUploader() : void 0);
      }
    }]);
    return ImageUploaderComponent;
  }(React.Component);

  ;
  ImageUploaderComponent.propTypes = {
    dataSource: PropTypes.object.isRequired,
    // Data source to use for chart
    onUpload: PropTypes.func.isRequired,
    // callback for when upload is successful
    uid: PropTypes.string // existing UID of the image if available

  };
  return ImageUploaderComponent;
}.call(void 0);