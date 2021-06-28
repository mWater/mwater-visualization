// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let ImageUploaderComponent;
import PropTypes from 'prop-types';
import React from 'react';
const R = React.createElement;
import Dropzone from 'react-dropzone';
import uuid from 'uuid';

export default ImageUploaderComponent = (function() {
  ImageUploaderComponent = class ImageUploaderComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        dataSource: PropTypes.object.isRequired, // Data source to use for chart
        onUpload: PropTypes.func.isRequired, // callback for when upload is successful
        uid: PropTypes.string
      };
       // existing UID of the image if available
    }

    constructor(props) {
      super(props);

      this.state = {
        uid: props.uid,
        files: null,
        uploading: false,
        editing: props.uid ? false : true
      };
    }

    onFileDrop = files => {
      this.setState({files, uploading: true});

      this.xhr = new XMLHttpRequest();
      const fd = new FormData();
      fd.append("image", files[0]);
      this.xhr.upload.onprogress = this.uploadProgress;
      this.xhr.addEventListener("load", this.uploadComplete, false);

      const id = this.createId();
      this.xhr.open("POST", this.props.dataSource.getImageUrl(id));
      this.xhr.send(fd);
      return this.setState({uid: id});
    };

    uploadProgress = e => {
      if (!this.progressBar) {
        return;
      }

      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded * 100) / e.total);
        return this.progressBar.style.width = `${percentComplete}%`;
      } else {
        return this.progressBar.style.width = "100%";
      }
    };

    uploadComplete = e => {
      if (e.target.status === 200) {
        this.setState({uploading: false, files: null, editing: false});
        return this.props.onUpload(this.state.uid);
      } else {
        return alert(`Upload failed: ${e.target.responseText}`);
      }
    };

    createId() { return uuid().replace(/-/g, ""); }

    renderUploader() {
      return R('div', null,
        R(Dropzone, {
          className: 'dropzone',
          multiple: false,
          onDrop: this.onFileDrop
        },

          this.state.uploading ?
            R('div', {className: 'progress'},
              R('div', {className: 'progress-bar', style: { width: '0%'}, ref: c => { return this.progressBar = c; }}))
          :
            R('div', null, "Drop file here or click to select file")
        ),
          
        this.state.uid ?
          R('a', {onClick: (() => this.setState({editing: false}))},
            "Cancel") : undefined
      );
    }

    renderPreview() {
      const thumbnailStyle = {
        width: "100px",
        maxWidth: "100%",
        maxHeight: "100%",
        padding: 4,
        border: '1px solid #aeaeae',
        marginRight: 20
      };
      return R('div', null,
        R('img', {style: thumbnailStyle, src: this.props.dataSource.getImageUrl(this.state.uid)}),
        R('a', {className: 'btn btn-default', onClick: this.handleChangeImage}, "Change"));
    }

    handleChangeImage = () => {
      return this.setState({editing: true});
    };

    render() {
      return R('div', null,
        this.state.uid && !this.state.editing ?
          this.renderPreview() : undefined,
        this.state.editing || !this.state.uid ?
          this.renderUploader() : undefined
      );
    }
  };
  ImageUploaderComponent.initClass();
  return ImageUploaderComponent;
})();