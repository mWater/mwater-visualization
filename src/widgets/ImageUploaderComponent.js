PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
Dropzone = require 'react-dropzone'

uuid = require 'uuid'

module.exports = class ImageUploaderComponent extends React.Component
  @propTypes:
    dataSource: PropTypes.object.isRequired # Data source to use for chart
    onUpload: PropTypes.func.isRequired # callback for when upload is successful
    uid: PropTypes.string # existing UID of the image if available

  constructor: (props) ->
    super(props)

    @state = {
      uid: props.uid
      files: null
      uploading: false
      editing: if props.uid then false else true
    }
  
  onFileDrop: (files) =>
    @setState(files: files, uploading: true)

    @xhr = new XMLHttpRequest()
    fd = new FormData()
    fd.append "image", files[0]
    @xhr.upload.onprogress = @uploadProgress
    @xhr.addEventListener "load", @uploadComplete, false

    id = @createId()
    @xhr.open "POST", @props.dataSource.getImageUrl(id)
    @xhr.send fd
    @setState(uid: id)

  uploadProgress: (e) =>
    if not @progressBar
      return

    if e.lengthComputable
      percentComplete = Math.round(e.loaded * 100 / e.total)
      @progressBar.style.width = "#{percentComplete}%"
    else
      @progressBar.style.width = "100%"

  uploadComplete: (e) =>
    if e.target.status == 200
      @setState(uploading: false, files: null, editing: false)
      @props.onUpload(@state.uid)
    else
      alert "Upload failed: #{e.target.responseText}",

  createId: -> uuid().replace(/-/g, "")
  
  renderUploader: ->
    R 'div', null,
      R Dropzone,
        className: 'dropzone'
        multiple: false
        onDrop: @onFileDrop,

        if @state.uploading
          R 'div', className: 'progress',
            R 'div', className: 'progress-bar', style: { width: '0%'}, ref: (c) => @progressBar = c
        else
          R 'div', null, "Drop file here or click to select file"
          
      if @state.uid
        R 'a', onClick: (() => @setState(editing: false)),
          "Cancel"

  renderPreview: ->
    thumbnailStyle =
      width: "100px"
      maxWidth: "100%"
      maxHeight: "100%"
      padding: 4
      border: '1px solid #aeaeae'
      marginRight: 20
    R 'div', null,
      R 'img', style: thumbnailStyle, src: @props.dataSource.getImageUrl(@state.uid)
      R 'a', className: 'btn btn-default', onClick: @handleChangeImage, "Change"

  handleChangeImage: () =>
    @setState(editing: true)

  render: ->
    R 'div', null,
      if @state.uid and not @state.editing
        @renderPreview()
      if @state.editing or not @state.uid
        @renderUploader()