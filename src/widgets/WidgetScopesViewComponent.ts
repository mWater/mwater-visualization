// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let WidgetScopesViewComponent
import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement

// Shows widget scopes
export default WidgetScopesViewComponent = (function () {
  WidgetScopesViewComponent = class WidgetScopesViewComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        scopes: PropTypes.object.isRequired, // lookup of id to scope (see WidgetScoper for definition)
        onRemoveScope: PropTypes.func.isRequired
      }
      // Called with id of scope to remove
    }

    renderScope = (id, scope) => {
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
  WidgetScopesViewComponent.initClass()
  return WidgetScopesViewComponent
})()
