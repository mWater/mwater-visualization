// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let MWaterAddRelatedFormComponent
import $ from "jquery"
import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import moment from "moment"
import ModalPopupComponent from "react-library/lib/ModalPopupComponent"
import querystring from "querystring"
import { ExprUtils } from "mwater-expressions"
import * as ui from "./UIComponents"
import formUtils from "mwater-forms/lib/formUtils" // TODO requireing this directly because of bizarre backbone issue

// Link that when clicked popup up a modal window allowing user to select a form
// with an Entity/Site question to the extraTables
export default MWaterAddRelatedFormComponent = (function () {
  MWaterAddRelatedFormComponent = class MWaterAddRelatedFormComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        table: PropTypes.string.isRequired,
        apiUrl: PropTypes.string.isRequired,
        client: PropTypes.string,
        user: PropTypes.string, // User id
        onSelect: PropTypes.func.isRequired, // Called with table id e.g. responses:someid
        schema: PropTypes.object.isRequired
      }
    }

    constructor(props: any) {
      super(props)

      this.state = {
        open: false,
        waitingForTable: null // Set to table id that is being waited for as the result of being selected
      }
    }

    componentWillReceiveProps(nextProps: any) {
      // If waiting and table has arrived, cancel waiting
      if (this.state.waitingForTable && nextProps.schema.getTable(this.state.waitingForTable)) {
        return this.setState({ waitingForTable: null })
      }
    }

    handleOpen = () => {
      return this.setState({ open: true })
    }

    handleSelect = (table: any) => {
      this.setState({ open: false })

      // Wait for table if not in schema
      if (!this.props.schema.getTable(table)) {
        this.setState({ waitingForTable: table })
      }

      return this.props.onSelect(table)
    }

    render() {
      return R(
        "div",
        null,
        this.state.waitingForTable
          ? R("div", null, R("i", { className: "fa fa-spin fa-spinner" }), " Adding...")
          : R("a", { className: "btn btn-link", onClick: this.handleOpen }, "+ Add Related Survey"),
        this.state.open
          ? R(AddRelatedFormModalComponent, {
              table: this.props.table,
              apiUrl: this.props.apiUrl,
              client: this.props.client,
              user: this.props.user,
              onSelect: this.handleSelect,
              onCancel: () => this.setState({ open: false })
            })
          : undefined
      )
    }
  }
  MWaterAddRelatedFormComponent.initClass()
  return MWaterAddRelatedFormComponent
})()

// Actual modal that displays the
class AddRelatedFormModalComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      table: PropTypes.string.isRequired,
      apiUrl: PropTypes.string.isRequired,
      client: PropTypes.string,
      user: PropTypes.string, // User id
      onSelect: PropTypes.func.isRequired, // Called with table id e.g. responses:someid
      onCancel: PropTypes.func.isRequired // When modal is closed
    }

    this.contextTypes = { locale: PropTypes.string }
    // e.g. "en"
  }

  constructor(props: any) {
    super(props)
    this.state = {
      items: null,
      search: ""
    }
  }

  componentDidMount() {
    // Get all forms visible to user
    const query = {}
    query.selector = JSON.stringify({ state: { $ne: "deleted" } })
    if (this.props.client) {
      query.client = this.props.client
    }

    // Get list of all form names
    return $.getJSON(this.props.apiUrl + "forms?" + querystring.stringify(query), (forms) => {
      // Sort by modified.on desc but first by user
      forms = _.sortByOrder(
        forms,
        [(form) => (form.created.by === this.props.user ? 1 : 0), (form) => form.modified.on],
        ["desc", "desc"]
      )

      // Filter by Entity and Site questions of tableId type
      forms = _.filter(forms, (form) => formUtils.findEntityQuestion(form.design, this.props.table.split(".")[1]))

      // Get _id, name, and description
      const items = _.map(forms, (form) => ({
        name: ExprUtils.localizeString(form.design.name, this.context.locale),
        desc: `Modified ${moment(form.modified.on, moment.ISO_8601).format("ll")}`,
        onClick: this.props.onSelect.bind(null, "responses:" + form._id)
      }))

      return this.setState({ items })
    }).fail((xhr) => {
      return this.setState({ error: xhr.responseText })
    })
  }

  renderContents() {
    if (!this.state.items) {
      return R("div", { className: "alert alert-info" }, R("i", { className: "fa fa-spin fa-spinner" }), " Loading...")
    }

    let { items } = this.state

    // Filter by search
    if (this.state.search) {
      const searchStringRegExp = new RegExp(escapeRegex(this.state.search), "i")
      items = _.filter(items, (item) => item.name.match(searchStringRegExp))
    }

    return R(
      "div",
      null,
      R("input", {
        type: "text",
        className: "form-control",
        placeholder: "Search...",
        key: "search",
        ref: this.searchRef,
        style: { marginBottom: 10 },
        value: this.state.search,
        onChange: (ev: any) => this.setState({ search: ev.target.value })
      }),

      R(ui.OptionListComponent, { items })
    );
  }

  render() {
    return R(
      ModalPopupComponent,
      {
        showCloseX: true,
        onClose: this.props.onCancel,
        header: "Add Related Survey"
      },
      this.renderContents()
    )
  }
}
AddRelatedFormModalComponent.initClass()

function escapeRegex(s: any) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}
