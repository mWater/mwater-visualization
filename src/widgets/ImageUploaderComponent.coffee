React = require 'react'
H = React.DOM
R = React.createElement
Dropzone = require 'react-dropzone'

module.exports = class ImageUploaderComponent extends React.Component

  @propTypes:
    apiUrl: React.PropTypes.string.isRequired # The base url for api
    client: React.PropTypes.string.isRequired # The client ID required for authentication
    onUpload: React.PropTypes.func.isRequired # callback for when upload is successful
    uid: React.PropTypes.string # existing UID of the image if available

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
    @xhr.open "POST", @props.apiUrl + "images/#{id}?client=" + @props.client
    @xhr.send fd
    @setState(uid: id)

  uploadProgress: (e) =>
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

  createId: ->
    'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) ->
      r = Math.random()*16|0
      v = if c == 'x' then r else (r&0x3|0x8)
      return v.toString(16)
    )
  
  renderUploader: ->
    H.div null,
      R Dropzone,
        className: 'dropzone'
        multiple: false
        onDrop: @onFileDrop,

        if @state.uploading
          H.div className: 'progress',
            H.div className: 'progress-bar', style: { width: '0%'}, ref: (c) => @progressBar = c
        else
          H.div null, "Drop file here or click to select file"
          
      if @state.uid
        H.a onClick: (() => @setState(editing: false)),
          "Cancel"

  renderPreview: ->
    thumbnailStyle =
      width: "100px"
      maxWidth: "100%"
      maxHeight: "100%"
      padding: 4
      border: '1px solid #aeaeae'
      marginRight: 20
    H.div null,
      H.img style: thumbnailStyle, src: @props.apiUrl + "images/#{@state.uid}"
      H.a className: 'btn btn-default', onClick: @handleChangeImage, "Change"

  handleChangeImage: () =>
    @setState(editing: true)

  render: ->
    H.div null,
      if @state.uid and not @state.editing
        @renderPreview()
      if @state.editing or not @state.uid
        @renderUploader()