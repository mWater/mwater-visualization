import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement

interface WidgetScopesViewComponentProps {
  /** lookup of id to scope (see WidgetScoper for definition) */
  scopes: any
  onRemoveScope: any
}

// Shows widget scopes
export default class WidgetScopesViewComponent extends React.Component<WidgetScopesViewComponentProps> {
  renderScope = (id: any, scope: any) => {
    const style = {
      cursor: "pointer",
      borderRadius: 4,
      border: "solid 1px #BBB",
      padding: "1px 5px 1px 5px",
      color: "#666",
      backgroundColor: "#EEE",
      display: "inline-block",
      marginLeft: 4,
      marginRight: 4
    }

    if (!scope) {
      return null
    }

    return R(
      "div",
      { key: id, style, onClick: this.props.onRemoveScope.bind(null, id) },
      scope.name,
      " ",
      R("span", { className: "glyphicon glyphicon-remove" })
    )
  }

  render() {
    const { scopes } = this.props
    if (_.compact(_.values(scopes)).length === 0) {
      return null
    }

    return R(
      "div",
      { className: "alert alert-info" },
      R("span", { className: "glyphicon glyphicon-filter" }),
      " Filters: ",
      _.map(_.keys(scopes), (id) => this.renderScope(id, scopes[id]))
    )
  }
}
