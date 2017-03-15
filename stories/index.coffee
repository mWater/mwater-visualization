_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
storiesOf = require('@kadira/storybook').storiesOf
action = require('@kadira/storybook').action

require './pivotChart'

storiesOf('Pivot', module)
  .add 'test', => 
    R HoverTable
  .add 'test2', => 
    R HoverTable2

    # R UpdateableComponent, 
    #   deployment: deployment,
    #   (state, update) =>
    #     R DeploymentEditorComp, 
    #       value: state.deployment
    #       onChange: update("deployment")
    #       ctx: createCtx()
    #       form: form




# Convenience wrapper that allows updating state
class UpdateableComponent extends React.Component
  constructor: (props) ->
    super
    @state = _.clone(@props or {})

  # Creates update function
  update: (name) =>
    return (value) =>
      upt = {}
      upt[name] = value
      @setState(upt)
      action("update")(upt)

  render: ->
    @props.children(@state, @update)



class HoverTable extends React.Component
  constructor: (props) ->
    super

    @state = {
      hoverSection: null
    }

  renderCell: (section, row, column, content) ->
    style = {}

    hover = @state.hoverSection == section and section
    if hover
      style.backgroundColor = "#EEE"
      style.position = "relative"

    left = section == "c1" and column == 1 # /*section == "r1" and row == 1 or*/ 
    top = section == "r1" and row == 1 #or section == "c1" and column == 1
    right = section == "r1" and row == 1 or section == "c1" and column == 2
    bottom = section == "r1" and row == 3 or section == "c1" and column == 1
    remove = section == "r1" and row == 1 or section == "c1" and column == 1

    H.td 
      onMouseEnter: => if @state.hoverSection != section then @setState(hoverSection: section)
      style: style
      key: column, 
        if left and hover
          H.i className: "fa fa-plus-square", style: { position: "absolute", left: 0, zIndex: 1000, paddingTop: 3, color: "#337ab7", cursor: "pointer", opacity: 0.65}
        if right and hover
          H.i className: "fa fa-plus-square", style: { position: "absolute", right: 0, bottom: "50%", zIndex: 1000, paddingTop: 3, color: "#337ab7", cursor: "pointer", opacity: 0.65}
        if bottom and hover
          H.i className: "fa fa-plus-square", style: { position: "absolute", bottom: 0, right: "50%", zIndex: 1000, color: "#337ab7", cursor: "pointer", opacity: 0.65}
        if top and hover
          H.i className: "fa fa-plus-square", style: { position: "absolute", top: 0, right: "50%", zIndex: 1000, color: "#337ab7", cursor: "pointer", opacity: 0.65}
        if top and hover
          H.i className: "fa fa-plus-square", style: { position: "absolute", top: 0, right: "50%", zIndex: 1000, color: "#337ab7", cursor: "pointer", opacity: 0.65}
        if remove and hover
          H.i className: "fa fa-minus-square", style: { position: "absolute", top: -2, left: 0, zIndex: 1000, color: "#d9534f", cursor: "pointer", opacity: 0.65}
        content

  render: ->
    H.table style: { position: "relative" }, className: "table table-bordered",
      H.tbody onMouseLeave: (=> @setState(hoverSection: null)),
        H.tr null, 
          @renderCell(null, 0, 0, null)
          @renderCell("c1", 0, 1, "January")
          @renderCell("c1", 0, 2, "February")
        H.tr null, 
          @renderCell("r1", 1, 0, "Station")
          @renderCell(null, 1, 1, null)
          @renderCell(null, 1, 2, null)
        H.tr null, 
          @renderCell("r1", 2, 0, "Portland")
          @renderCell("d11", 2, 1, 2)
          @renderCell("d11", 2, 2, 3)
        H.tr null, 
          @renderCell("r1", 3, 0, "Kansas")
          @renderCell("d11", 3, 1, 4)
          @renderCell("d11", 3, 2, 1.5)


class HoverTable2 extends React.Component
  constructor: (props) ->
    super

    @state = {
      hoverSection: null
    }

  renderCell: (section, row, column, content) ->
    style = {}

    hover = @state.hoverSection == section and section
    if hover
      style.backgroundColor = "#F8F8F8"
      style.position = "relative"

    topRight = section == "r1" and row == 1 or section == "c1" and column == 2 or section == "d11" and row == 2 and column == 2

    H.td 
      onMouseEnter: => if @state.hoverSection != section then @setState(hoverSection: section)
      style: style
      key: column, 
        if topRight and hover
          H.div style: { backgroundColor: "white", border: "solid 1px #337ab7", opacity: 0.7, position: "absolute", top: 5, right: 5, zIndex: 1000 },
            H.i className: "fa fa-pencil fa-fw", style: { color: "#337ab7", cursor: "pointer" }
        content

  render: ->
    H.table style: { position: "relative" }, className: "table table-bordered",
      H.tbody onMouseLeave: (=> @setState(hoverSection: null)),
        H.tr null, 
          @renderCell(null, 0, 0, null)
          @renderCell("c1", 0, 1, "January")
          @renderCell("c1", 0, 2, "February")
        H.tr null, 
          @renderCell("r1", 1, 0, "Station")
          @renderCell(null, 1, 1, null)
          @renderCell(null, 1, 2, null)
        H.tr null, 
          @renderCell("r1", 2, 0, "Portland")
          @renderCell("d11", 2, 1, 2)
          @renderCell("d11", 2, 2, 3)
        H.tr null, 
          @renderCell("r1", 3, 0, "Kansas")
          @renderCell("d11", 3, 1, 4)
          @renderCell("d11", 3, 2, 1.5)

