React = require 'react'
H = React.DOM

# Shows widget scopes
module.exports = class WidgetScopesViewComponent extends React.Component
  @propTypes:
    scopes: React.PropTypes.object.isRequired # lookup of id to scope (see WidgetScoper for definition)
    onRemoveScope: React.PropTypes.func.isRequired # Called with id of scope to remove

  renderScope: (id, scope) =>
    style = {
      cursor: "pointer"
      borderRadius: 4
      border: "solid 1px #BBB"
      padding: "1px 5px 1px 5px"
      color: "#666"
      backgroundColor: "#EEE"
      display: "inline-block"
      marginLeft: 4
      marginRight: 4
    }

    if not scope
      return null

    return H.div key: id, style: style, onClick: @props.onRemoveScope.bind(null, id),
      scope.name
      " "
      H.span className: "glyphicon glyphicon-remove"

  render: ->
    scopes = @props.scopes
    if _.compact(_.values(scopes)).length == 0
      return null

    return H.div className: "alert alert-info", 
      H.span(className: "glyphicon glyphicon-filter")
      " Filters: "
      _.map(_.keys(scopes), (id) => @renderScope(id, scopes[id]))