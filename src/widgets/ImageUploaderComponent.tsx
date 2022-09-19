import { DataSource } from "mwater-expressions"
import React from "react"
const R = React.createElement
import Dropzone, { DropzoneState } from "react-dropzone"
import uuid from "uuid"

export interface ImageUploaderComponentProps {
  /** Data source to use for chart */
  dataSource: DataSource
  /** callback for when upload is successful */
  onUpload: any
  uid?: string
}

interface ImageUploaderComponentState {
  uid: any
  uploading: any
  editing: any
  files: File[] | null
}

export default class ImageUploaderComponent extends React.Component<
  ImageUploaderComponentProps,
  ImageUploaderComponentState
> {
  progressBar: HTMLDivElement | null
  xhr: XMLHttpRequest

  constructor(props: any) {
    super(props)

    this.state = {
      uid: props.uid,
      files: null,
      uploading: false,
      editing: props.uid ? false : true
    }
  }

  onFileDrop = (files: any) => {
    this.setState({ files, uploading: true })

    this.xhr = new XMLHttpRequest()
    const fd = new FormData()
    fd.append("image", files[0])
    this.xhr.upload.onprogress = this.uploadProgress
    this.xhr.addEventListener("load", this.uploadComplete, false)

    const id = this.createId()
    this.xhr.open("POST", this.props.dataSource.getImageUploadUrl(id))
    this.xhr.send(fd)
    return this.setState({ uid: id })
  }

  uploadProgress = (e: any) => {
    if (!this.progressBar) {
      return
    }

    if (e.lengthComputable) {
      const percentComplete = Math.round((e.loaded * 100) / e.total)
      return (this.progressBar.style.width = `${percentComplete}%`)
    } else {
      return (this.progressBar.style.width = "100%")
    }
  }

  uploadComplete = (e: any) => {
    if (e.target.status === 200) {
      this.setState({ uploading: false, files: null, editing: false })
      this.props.onUpload(this.state.uid)
    } else {
      this.setState({ uploading: false, files: null, editing: false })
      alert(`Upload failed: ${e.target.responseText}`)
    }
  }

  createId() {
    return uuid().replace(/-/g, "")
  }

  renderUploader() {
    return <div>
      <Dropzone multiple={false} onDrop={this.onFileDrop} noDragEventsBubbling={true}>
        {({getRootProps, getInputProps, isDragActive}: DropzoneState) => (
          <div {...getRootProps({ className: "dropzone" })}>
            <input {...getInputProps()} />
            { this.state.uploading
            ? <div className="progress">
                <div 
                  className="progress-bar"
                  style={{ width: "0%" }}
                  ref={(c) => {
                    this.progressBar = c
                  }}
                />
              </div>
            : <div>
                 {
                 isDragActive ?
                  "Drop the files here" 
                  : "Drop file here or click to select file"
                 }
                </div>
            }
          </div>
        )}
      </Dropzone>

      { this.state.uid && <a className="link-plain" onClick={() => this.setState({ editing: false })}>Cancel</a> }
    </div>
  }

  renderPreview() {
    const thumbnailStyle = {
      width: "100px",
      maxWidth: "100%",
      maxHeight: "100%",
      padding: 4,
      border: "1px solid #aeaeae",
      marginRight: 20
    }
    return R(
      "div",
      null,
      R("img", { style: thumbnailStyle, src: this.props.dataSource.getImageUrl(this.state.uid) }),
      R("a", { className: "btn btn-secondary", onClick: this.handleChangeImage }, "Change")
    )
  }

  handleChangeImage = () => {
    return this.setState({ editing: true })
  }

  render() {
    return R(
      "div",
      null,
      this.state.uid && !this.state.editing ? this.renderPreview() : undefined,
      this.state.editing || !this.state.uid ? this.renderUploader() : undefined
    )
  }
}
