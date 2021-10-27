"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const react_dropzone_1 = __importDefault(require("react-dropzone"));
const uuid_1 = __importDefault(require("uuid"));
class ImageUploaderComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.onFileDrop = (files) => {
            this.setState({ files, uploading: true });
            this.xhr = new XMLHttpRequest();
            const fd = new FormData();
            fd.append("image", files[0]);
            this.xhr.upload.onprogress = this.uploadProgress;
            this.xhr.addEventListener("load", this.uploadComplete, false);
            const id = this.createId();
            this.xhr.open("POST", this.props.dataSource.getImageUrl(id));
            this.xhr.send(fd);
            return this.setState({ uid: id });
        };
        this.uploadProgress = (e) => {
            if (!this.progressBar) {
                return;
            }
            if (e.lengthComputable) {
                const percentComplete = Math.round((e.loaded * 100) / e.total);
                return (this.progressBar.style.width = `${percentComplete}%`);
            }
            else {
                return (this.progressBar.style.width = "100%");
            }
        };
        this.uploadComplete = (e) => {
            if (e.target.status === 200) {
                this.setState({ uploading: false, files: null, editing: false });
                return this.props.onUpload(this.state.uid);
            }
            else {
                return alert(`Upload failed: ${e.target.responseText}`);
            }
        };
        this.handleChangeImage = () => {
            return this.setState({ editing: true });
        };
        this.state = {
            uid: props.uid,
            files: null,
            uploading: false,
            editing: props.uid ? false : true
        };
    }
    createId() {
        return uuid_1.default().replace(/-/g, "");
    }
    renderUploader() {
        return R("div", null, R(react_dropzone_1.default, {
            className: "dropzone",
            multiple: false,
            onDrop: this.onFileDrop
        }, this.state.uploading
            ? R("div", { className: "progress" }, R("div", {
                className: "progress-bar",
                style: { width: "0%" },
                ref: (c) => {
                    return (this.progressBar = c);
                }
            }))
            : R("div", null, "Drop file here or click to select file")), this.state.uid ? R("a", { className: "link-plain", onClick: () => this.setState({ editing: false }) }, "Cancel") : undefined);
    }
    renderPreview() {
        const thumbnailStyle = {
            width: "100px",
            maxWidth: "100%",
            maxHeight: "100%",
            padding: 4,
            border: "1px solid #aeaeae",
            marginRight: 20
        };
        return R("div", null, R("img", { style: thumbnailStyle, src: this.props.dataSource.getImageUrl(this.state.uid) }), R("a", { className: "btn btn-secondary", onClick: this.handleChangeImage }, "Change"));
    }
    render() {
        return R("div", null, this.state.uid && !this.state.editing ? this.renderPreview() : undefined, this.state.editing || !this.state.uid ? this.renderUploader() : undefined);
    }
}
exports.default = ImageUploaderComponent;
