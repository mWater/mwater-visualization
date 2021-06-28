// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let AdminScopeAndDetailLevelComponent
import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import RegionSelectComponent from "./RegionSelectComponent"
import DetailLevelSelectComponent from "./DetailLevelSelectComponent"
import { default as ReactSelect } from "react-select"

// Scope and detail level setter for AdminChoropleth layers when using admin_regions
export default AdminScopeAndDetailLevelComponent = (function () {
  AdminScopeAndDetailLevelComponent = class AdminScopeAndDetailLevelComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired, // Schema to use
        dataSource: PropTypes.object.isRequired,
        scope: PropTypes.string, // admin region that is outside bounds. null for whole world
        scopeLevel: PropTypes.number, // level of scope region. null for whole world
        detailLevel: PropTypes.number, // Detail level within scope region
        onScopeAndDetailLevelChange: PropTypes.func.isRequired
      }
      // Called with (scope, scopeLevel, detailLevel)
    }

    handleScopeChange = (scope, scopeLevel) => {
      if (scope) {
        // Detail level will be set by DetailLevelSelectComponent
        return this.props.onScopeAndDetailLevelChange(scope, scopeLevel, null)
      } else {
        return this.props.onScopeAndDetailLevelChange(null, null, 0)
      }
    }

    handleDetailLevelChange = (detailLevel) => {
      return this.props.onScopeAndDetailLevelChange(this.props.scope, this.props.scopeLevel, detailLevel)
    }

    render() {
      const basicDetailLevelOptions = [
        { value: 0, label: "Countries" },
        { value: 1, label: "Level 1 (State/Province/District)" }
      ]

      return R(
        "div",
        null,
        R(
          "div",
          { className: "form-group" },
          R("label", { className: "text-muted" }, "Region to Map"),
          R(RegionSelectComponent, {
            region: this.props.scope,
            onChange: this.handleScopeChange,
            schema: this.props.schema,
            dataSource: this.props.dataSource
          })
        ),
        (() => {
          if (this.props.scope != null && this.props.detailLevel != null) {
            return R(
              "div",
              { className: "form-group" },
              R("label", { className: "text-muted" }, "Detail Level"),
              R(DetailLevelSelectComponent, {
                scope: this.props.scope,
                scopeLevel: this.props.scopeLevel,
                detailLevel: this.props.detailLevel,
                onChange: this.handleDetailLevelChange,
                schema: this.props.schema,
                dataSource: this.props.dataSource
              })
            )
          } else if (this.props.scope == null && this.props.detailLevel != null) {
            // Case of whole world. Allow selecting country or admin level 1
            return R(
              "div",
              { className: "form-group" },
              R("label", { className: "text-muted" }, "Detail Level"),
              R(ReactSelect, {
                value: _.findWhere(basicDetailLevelOptions, { value: this.props.detailLevel }) || null,
                options: basicDetailLevelOptions,
                onChange: (opt) => this.handleDetailLevelChange(opt.value)
              })
            )
          }
        })()
      )
    }
  }
  AdminScopeAndDetailLevelComponent.initClass()
  return AdminScopeAndDetailLevelComponent
})()
