var Dropzone, H, ImageUploaderComponent, R, React, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

Dropzone = require('react-dropzone');

uuid = require('node-uuid');

module.exports = ImageUploaderComponent = (function(superClass) {
  extend(ImageUploaderComponent, superClass);

  ImageUploaderComponent.propTypes = {
    apiUrl: React.PropTypes.string.isRequired,
    client: React.PropTypes.string.isRequired,
    onUpload: React.PropTypes.func.isRequired,
    uid: React.PropTypes.string
  };

  function ImageUploaderComponent(props) {
    this.handleChangeImage = bind(this.handleChangeImage, this);
    this.uploadComplete = bind(this.uploadComplete, this);
    this.uploadProgress = bind(this.uploadProgress, this);
    this.onFileDrop = bind(this.onFileDrop, this);
    ImageUploaderComponent.__super__.constructor.call(this, props);
    this.state = {
      uid: props.uid,
      files: null,
      uploading: false,
      editing: props.uid ? false : true
    };
  }

  ImageUploaderComponent.prototype.onFileDrop = function(files) {
    var fd, id;
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
    this.xhr.open("POST", this.props.apiUrl + ("images/" + id + "?client=") + this.props.client);
    this.xhr.send(fd);
    return this.setState({
      uid: id
    });
  };

  ImageUploaderComponent.prototype.uploadProgress = function(e) {
    var percentComplete;
    if (e.lengthComputable) {
      percentComplete = Math.round(e.loaded * 100 / e.total);
      return this.progressBar.style.width = percentComplete + "%";
    } else {
      return this.progressBar.style.width = "100%";
    }
  };

  ImageUploaderComponent.prototype.uploadComplete = function(e) {
    if (e.target.status === 200) {
      this.setState({
        uploading: false,
        files: null,
        editing: false
      });
      return this.props.onUpload(this.state.uid);
    } else {
      return alert("Upload failed: " + e.target.responseText);
    }
  };

  ImageUploaderComponent.prototype.createId = function() {
    return uuid.v4().replace(/-/g, "");
  };

  ImageUploaderComponent.prototype.renderUploader = function() {
    return H.div(null, R(Dropzone, {
      className: 'dropzone',
      multiple: false,
      onDrop: this.onFileDrop
    }, this.state.uploading ? H.div({
      className: 'progress'
    }, H.div({
      className: 'progress-bar',
      style: {
        width: '0%'
      },
      ref: (function(_this) {
        return function(c) {
          return _this.progressBar = c;
        };
      })(this)
    })) : H.div(null, "Drop file here or click to select file")), this.state.uid ? H.a({
      onClick: ((function(_this) {
        return function() {
          return _this.setState({
            editing: false
          });
        };
      })(this))
    }, "Cancel") : void 0);
  };

  ImageUploaderComponent.prototype.renderPreview = function() {
    var thumbnailStyle;
    thumbnailStyle = {
      width: "100px",
      maxWidth: "100%",
      maxHeight: "100%",
      padding: 4,
      border: '1px solid #aeaeae',
      marginRight: 20
    };
    return H.div(null, H.img({
      style: thumbnailStyle,
      src: this.props.apiUrl + ("images/" + this.state.uid)
    }), H.a({
      className: 'btn btn-default',
      onClick: this.handleChangeImage
    }, "Change"));
  };

  ImageUploaderComponent.prototype.handleChangeImage = function() {
    return this.setState({
      editing: true
    });
  };

  ImageUploaderComponent.prototype.render = function() {
    return H.div(null, this.state.uid && !this.state.editing ? this.renderPreview() : void 0, this.state.editing || !this.state.uid ? this.renderUploader() : void 0);
  };

  return ImageUploaderComponent;

})(React.Component);
