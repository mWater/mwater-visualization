import _ from "lodash"
import $ from "jquery"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import querystring from "querystring"
import TabbedComponent from "react-library/lib/TabbedComponent"
import * as uiComponents from "./UIComponents"
import { ExprUtils } from "mwater-expressions"
import moment from "moment"
import ModalPopupComponent from "react-library/lib/ModalPopupComponent"
import { MWaterCustomTablesetListComponent } from "./MWaterCustomTablesetListComponent"
import { MWaterMetricsTableListComponent } from "./MWaterMetricsTableListComponent"

const sitesOrder = {
  "entities.water_point": 1,
  "entities.sanitation_facility": 2,
  "entities.household": 3,
  "entities.community": 4,
  "entities.school": 5,
  "entities.health_facility": 6,
  "entities.place_of_worship": 7,
  "entities.water_system": 8,
  "entities.water_system_component": 9,
  "entities.wastewater_treatment_system": 10,
  "entities.waste_disposal_site": 11
}

interface MWaterCompleteTableSelectComponentProps {
  /** Url to hit api */
  apiUrl: string
  /** Optional client */
  client?: string
  schema: any
  /** User id */
  user?: string
  table?: string
  /** Called with table selected */
  onChange: any
  extraTables: any
  onExtraTablesChange: any
}

// Allows selection of a table. Is the complete list mode of tables
export default class MWaterCompleteTableSelectComponent extends React.Component<MWaterCompleteTableSelectComponentProps> {
  static contextTypes = { locale: PropTypes.string }

  handleExtraTableAdd = (tableId: any) => {
    return this.props.onExtraTablesChange(_.union(this.props.extraTables, [tableId]))
  }

  handleExtraTableRemove = (tableId: any) => {
    // Set to null if current table
    if (this.props.table === tableId) {
      this.props.onChange(null)
    }

    return this.props.onExtraTablesChange(_.without(this.props.extraTables, tableId))
  }

  renderSites() {
    let table
    let types = []

    for (table of this.props.schema.getTables()) {
      if (table.deprecated) {
        continue
      }

      if (!table.id.match(/^entities\./)) {
        continue
      }

      types.push(table.id)
    }

    // Sort by order if present
    types = _.sortBy(types, (type) => sitesOrder[type] || 999)

    return R(uiComponents.OptionListComponent, {
      items: _.compact(
        _.map(types, (tableId) => {
          table = this.props.schema.getTable(tableId)
          return {
            name: ExprUtils.localizeString(table.name, this.context.locale),
            desc: ExprUtils.localizeString(table.desc, this.context.locale),
            onClick: this.props.onChange.bind(null, table.id)
          }
        })
      )
    })
  }

  renderForms() {
    return R(FormsListComponent, {
      schema: this.props.schema,
      client: this.props.client,
      apiUrl: this.props.apiUrl,
      user: this.props.user,
      onChange: this.props.onChange,
      extraTables: this.props.extraTables,
      onExtraTableAdd: this.handleExtraTableAdd,
      onExtraTableRemove: this.handleExtraTableRemove
    })
  }

  renderIndicators() {
    return R(IndicatorsListComponent, {
      schema: this.props.schema,
      client: this.props.client,
      apiUrl: this.props.apiUrl,
      user: this.props.user,
      onChange: this.props.onChange,
      extraTables: this.props.extraTables,
      onExtraTableAdd: this.handleExtraTableAdd,
      onExtraTableRemove: this.handleExtraTableRemove
    })
  }

  renderIssues() {
    return R(IssuesListComponent, {
      schema: this.props.schema,
      client: this.props.client,
      apiUrl: this.props.apiUrl,
      user: this.props.user,
      onChange: this.props.onChange,
      extraTables: this.props.extraTables,
      onExtraTableAdd: this.handleExtraTableAdd,
      onExtraTableRemove: this.handleExtraTableRemove
    })
  }

  renderSweetSense() {
    let sweetSenseTables = this.getSweetSenseTables()

    sweetSenseTables = _.sortBy(sweetSenseTables, (table) => table.name.en)
    return R(uiComponents.OptionListComponent, {
      items: _.map(sweetSenseTables, (table) => {
        return {
          name: ExprUtils.localizeString(table.name, this.context.locale),
          desc: ExprUtils.localizeString(table.desc, this.context.locale),
          onClick: this.props.onChange.bind(null, table.id)
        }
      })
    })
  }

  renderTablesets() {
    return R(MWaterCustomTablesetListComponent, {
      schema: this.props.schema,
      client: this.props.client,
      apiUrl: this.props.apiUrl,
      user: this.props.user,
      onChange: this.props.onChange,
      extraTables: this.props.extraTables,
      onExtraTableAdd: this.handleExtraTableAdd,
      onExtraTableRemove: this.handleExtraTableRemove,
      locale: this.context.locale
    })
  }

  renderMetrics() {
    return R(MWaterMetricsTableListComponent, {
      schema: this.props.schema,
      client: this.props.client,
      apiUrl: this.props.apiUrl,
      user: this.props.user,
      onChange: this.props.onChange,
      extraTables: this.props.extraTables,
      onExtraTableAdd: this.handleExtraTableAdd,
      onExtraTableRemove: this.handleExtraTableRemove,
      locale: this.context.locale
    })
  }

  renderOther() {
    let otherTables = _.filter(this.props.schema.getTables(), (table) => {
      // Remove deprecated
      if (table.deprecated) {
        return false
      }

      // Remove sites
      if (table.id.match(/^entities\./)) {
        return false
      }

      // sweetsense tables
      if (table.id.match(/^sweetsense/)) {
        return false
      }

      // Remove responses
      if (table.id.match(/^responses:/)) {
        return false
      }

      // Remove indicators
      if (table.id.match(/^indicator_values:/)) {
        return false
      }

      // Remove issues
      if (table.id.match(/^(issues|issue_events):/)) {
        return false
      }

      // Remove custom tablesets
      if (table.id.match(/^custom\./)) {
        return false
      }

      // Remove metrics
      if (table.id.match(/^metric:/)) {
        return false
      }

      return true
    })

    otherTables = _.sortBy(otherTables, (table) => table.name.en)
    return R(uiComponents.OptionListComponent, {
      items: _.map(otherTables, (table) => {
        return {
          name: ExprUtils.localizeString(table.name, this.context.locale),
          desc: ExprUtils.localizeString(table.desc, this.context.locale),
          onClick: this.props.onChange.bind(null, table.id)
        }
      })
    })
  }

  getSweetSenseTables() {
    return _.filter(this.props.schema.getTables(), (table) => {
      if (table.deprecated) {
        return false
      }

      if (table.id.match(/^sweetsense/)) {
        return true
      }

      return false
    })
  }

  render() {
    const sweetSenseTables = this.getSweetSenseTables()

    const tabs = [
      { id: "sites", label: [R("i", { className: "fa fa-map-marker" }), " Sites"], elem: this.renderSites() },
      { id: "forms", label: [R("i", { className: "fa fa-th-list" }), " Surveys"], elem: this.renderForms() },
      {
        id: "indicators",
        label: [R("i", { className: "fa fa-check-circle" }), " Indicators"],
        elem: this.renderIndicators()
      },
      {
        id: "issues",
        label: [R("i", { className: "fa fa-exclamation-circle" }), " Issues"],
        elem: this.renderIssues()
      },
      { id: "tablesets", label: [R("i", { className: "fa fa-table" }), " Tables"], elem: this.renderTablesets() },
      { id: "metrics", label: [R("i", { className: "fa fa-line-chart" }), " Metrics"], elem: this.renderMetrics() }
    ]

    if (sweetSenseTables.length > 0) {
      tabs.push({ id: "sensors", label: " Sensors", elem: this.renderSweetSense() })
    }

    tabs.push({ id: "other", label: "Advanced", elem: this.renderOther() })

    return R(
      "div",
      null,
      R(
        "div",
        { className: "text-muted" },
        "Select data from sites, surveys or an advanced category below. Indicators can be found within their associated site types."
      ),

      R(TabbedComponent, {
        tabs,
        initialTabId: "sites"
      })
    )
  }
}

interface FormsListComponentProps {
  /** Url to hit api */
  apiUrl: string
  /** Optional client */
  client?: string
  schema: any
  /** User id */
  user?: string
  /** Called with table selected */
  onChange: any
  extraTables: any
  onExtraTableAdd: any
  onExtraTableRemove: any
}

interface FormsListComponentState {
  error: any
  search: any
  forms: any
}

// Searchable list of forms
class FormsListComponent extends React.Component<FormsListComponentProps, FormsListComponentState> {
  static contextTypes = { locale: PropTypes.string }

  constructor(props: any) {
    super(props)
    this.state = {
      forms: null,
      search: ""
    }
  }

  componentDidMount() {
    // Get names and basic of forms
    const query = {}
    query.fields = JSON.stringify({
      "design.name": 1,
      "design.description": 1,
      roles: 1,
      created: 1,
      modified: 1,
      state: 1,
      isMaster: 1
    })
    query.selector = JSON.stringify({ design: { $exists: true }, state: { $ne: "deleted" } })
    query.client = this.props.client

    // Get list of all form names
    return $.getJSON(this.props.apiUrl + "forms?" + querystring.stringify(query), (forms) => {
      // Sort by modified.on desc but first by user
      forms = _.sortByOrder(
        forms,
        [
          (form) => ((this.props.extraTables || []).includes("responses:" + form._id) ? 1 : 0),
          (form) => (form.created.by === this.props.user ? 1 : 0),
          (form) => form.modified.on
        ],
        ["desc", "desc", "desc"]
      )

      // TODO use name instead of design.name
      return this.setState({
        forms: _.map(forms, (form) => {
          let desc = ExprUtils.localizeString(form.design.description, this.context.locale) || ""
          if (desc) {
            desc += " - "
          }
          desc += `Modified ${moment(form.modified.on, moment.ISO_8601).format("ll")}`

          return {
            id: form._id,
            name: ExprUtils.localizeString(form.design.name, this.context.locale),
            desc
          }
        })
      })
    }).fail((xhr) => {
      return this.setState({ error: xhr.responseText })
    })
  }

  handleTableRemove = (table: any) => {
    if (
      confirm(
        `Remove ${ExprUtils.localizeString(
          table.name,
          this.context.locale
        )}? Any widgets that depend on it will no longer work properly.`
      )
    ) {
      return this.props.onExtraTableRemove(table.id)
    }
  }

  searchRef = (comp: any) => {
    // Focus
    if (comp) {
      return comp.focus()
    }
  }

  render() {
    let forms
    if (this.state.error) {
      return R("div", { className: "alert alert-danger" }, this.state.error)
    }

    // Filter forms
    if (this.state.search) {
      const escapeRegExp = (s: any) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")

      const searchStringRegExp = new RegExp(escapeRegExp(this.state.search), "i")

      forms = _.filter(this.state.forms, (form) => form.name.match(searchStringRegExp))
    } else {
      ;({ forms } = this.state)
    }

    // Remove if already included
    forms = _.filter(forms, (f) => !(this.props.extraTables || []).includes(`responses:${f.id}`))

    let tables = _.filter(
      this.props.schema.getTables(),
      (table) => (table.id.match(/^responses:/) || table.id.match(/^master_responses:/)) && !table.deprecated
    )
    tables = _.sortBy(tables, (t) => t.name.en)

    return R(
      "div",
      null,
      R("label", null, "Included Surveys:"),
      tables.length > 0
        ? R(uiComponents.OptionListComponent, {
            items: _.map(tables, (table) => {
              return {
                name: ExprUtils.localizeString(table.name, this.context.locale),
                desc: ExprUtils.localizeString(table.desc, this.context.locale),
                onClick: this.props.onChange.bind(null, table.id),
                onRemove: this.handleTableRemove.bind(null, table)
              }
            })
          })
        : R("div", null, "None"),

      R("br"),

      R("label", null, "All Surveys:"),
      !this.state.forms || this.state.forms.length === 0
        ? R(
            "div",
            { className: "alert alert-info" },
            R("i", { className: "fa fa-spinner fa-spin" }),
            "\u00A0Loading..."
          )
        : [
            R("input", {
              type: "text",
              className: "form-control input-sm",
              placeholder: "Search...",
              key: "search",
              ref: this.searchRef,
              style: { maxWidth: "20em", marginBottom: 10 },
              value: this.state.search,
              onChange: (ev: any) => this.setState({ search: ev.target.value })
            }),

            R(uiComponents.OptionListComponent, {
              items: _.map(forms, (form) => ({
                name: form.name,
                desc: form.desc,
                onClick: this.props.onChange.bind(null, "responses:" + form.id)
              }))
            })
          ]
    )
  }
}

interface IndicatorsListComponentProps {
  /** Url to hit api */
  apiUrl: string
  /** Optional client */
  client?: string
  schema: any
  /** User id */
  user?: string
  /** Called with table selected */
  onChange: any
  extraTables: any
  onExtraTableAdd: any
  onExtraTableRemove: any
}

interface IndicatorsListComponentState {
  error: any
  search: any
  indicators: any
}

// Searchable list of indicators
class IndicatorsListComponent extends React.Component<IndicatorsListComponentProps, IndicatorsListComponentState> {
  static contextTypes = { locale: PropTypes.string }

  constructor(props: any) {
    super(props)
    this.state = {
      indicators: null,
      search: ""
    }
  }

  componentDidMount() {
    // Get names and basic of forms
    const query = {}
    query.fields = JSON.stringify({ "design.name": 1, "design.desc": 1, "design.recommended": 1, deprecated: 1 })
    query.client = this.props.client

    // Get list of all indicator names
    return $.getJSON(this.props.apiUrl + "indicators?" + querystring.stringify(query), (indicators) => {
      // Remove deprecated
      indicators = _.filter(indicators, (indicator) => !indicator.deprecated)

      // Sort by name
      indicators = _.sortByOrder(
        indicators,
        [
          (indicator) => ((this.props.extraTables || []).includes("indicator_values:" + indicator._id) ? 0 : 1),
          (indicator) => (indicator.design.recommended ? 0 : 1),
          (indicator) => ExprUtils.localizeString(indicator.design.name, this.context.locale)
        ],
        ["asc", "asc", "asc"]
      )

      return this.setState({
        indicators: _.map(indicators, (indicator) => ({
          id: indicator._id,
          name: ExprUtils.localizeString(indicator.design.name, this.context.locale),
          desc: ExprUtils.localizeString(indicator.design.desc, this.context.locale)
        }))
      })
    }).fail((xhr) => {
      return this.setState({ error: xhr.responseText })
    })
  }

  handleTableRemove = (table: any) => {
    if (
      confirm(
        `Remove ${ExprUtils.localizeString(
          table.name,
          this.context.locale
        )}? Any widgets that depend on it will no longer work properly.`
      )
    ) {
      return this.props.onExtraTableRemove(table.id)
    }
  }

  searchRef = (comp: any) => {
    // Focus
    if (comp) {
      return comp.focus()
    }
  }

  handleSelect = (tableId: any) => {
    // Add table if not present
    if (!this.props.schema.getTable(tableId)) {
      this.props.onExtraTableAdd(tableId)
    }

    return this.addIndicatorConfirmPopup.show(tableId)
  }

  render() {
    let indicators
    if (this.state.error) {
      return R("div", { className: "alert alert-danger" }, this.state.error)
    }

    // Filter indicators
    if (this.state.search) {
      const escapeRegExp = (s: any) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")

      const searchStringRegExp = new RegExp(escapeRegExp(this.state.search), "i")

      indicators = _.filter(this.state.indicators, (indicator) => indicator.name.match(searchStringRegExp))
    } else {
      ;({ indicators } = this.state)
    }

    // Remove if already included
    indicators = _.filter(indicators, (f) => !(this.props.extraTables || []).includes(`indicator_values:${f.id}`))

    let tables = _.filter(
      this.props.schema.getTables(),
      (table) => table.id.match(/^indicator_values:/) && !table.deprecated
    )
    tables = _.sortBy(tables, (t) => t.name.en)

    return R(
      "div",
      null,
      R(AddIndicatorConfirmPopupComponent, {
        schema: this.props.schema,
        onChange: this.props.onChange,
        onExtraTableAdd: this.props.onExtraTableAdd,
        ref: (c: any) => {
          return (this.addIndicatorConfirmPopup = c)
        }
      }),

      R("label", null, "Included Indicators:"),
      tables.length > 0
        ? R(uiComponents.OptionListComponent, {
            items: _.map(tables, (table) => {
              return {
                name: ExprUtils.localizeString(table.name, this.context.locale),
                desc: ExprUtils.localizeString(table.desc, this.context.locale),
                onClick: this.handleSelect.bind(null, table.id),
                onRemove: this.handleTableRemove.bind(null, table)
              }
            })
          })
        : R("div", null, "None"),

      R("br"),

      R("label", null, "All Indicators:"),
      !this.state.indicators || this.state.indicators.length === 0
        ? R(
            "div",
            { className: "alert alert-info" },
            R("i", { className: "fa fa-spinner fa-spin" }),
            "\u00A0Loading..."
          )
        : [
            R("input", {
              type: "text",
              className: "form-control input-sm",
              placeholder: "Search...",
              key: "search",
              ref: this.searchRef,
              style: { maxWidth: "20em", marginBottom: 10 },
              value: this.state.search,
              onChange: (ev: any) => this.setState({ search: ev.target.value })
            }),

            R(uiComponents.OptionListComponent, {
              items: _.map(indicators, (indicator) => ({
                name: indicator.name,
                desc: indicator.desc,
                onClick: this.handleSelect.bind(null, "indicator_values:" + indicator.id)
              }))
            })
          ]
    )
  }
}

interface AddIndicatorConfirmPopupComponentProps {
  schema: any
  /** Called with table selected */
  onChange: any
  onExtraTableAdd: any
}

interface AddIndicatorConfirmPopupComponentState {
  indicatorTable: any
  visible: any
}

class AddIndicatorConfirmPopupComponent extends React.Component<
  AddIndicatorConfirmPopupComponentProps,
  AddIndicatorConfirmPopupComponentState
> {
  static contextTypes = { locale: PropTypes.string }

  constructor(props: any) {
    super(props)
    this.state = {
      visible: false,
      indicatorTable: null
    }
  }

  show(indicatorTable: any) {
    return this.setState({ visible: true, indicatorTable })
  }

  renderContents() {
    // Show loading if table not loaded
    if (!this.props.schema.getTable(this.state.indicatorTable)) {
      return R(
        "div",
        { className: "alert alert-info" },
        R("i", { className: "fa fa-spinner fa-spin" }),
        "\u00A0Loading..."
      )
    }

    // Find entity links
    const entityColumns = _.filter(this.props.schema.getColumns(this.state.indicatorTable), (col) =>
      col.join?.toTable?.match(/^entities\./)
    )

    return R(
      "div",
      null,
      R(
        "p",
        null,
        `In general, it is better to get indicator values from the related site. Please select the site 
below, then find the indicator values in the 'Related Indicators' section. Or click on 'Use Raw Indicator' if you 
are certain that you want to use the raw indicator table`
      ),

      R(uiComponents.OptionListComponent, {
        items: _.map(entityColumns, (entityColumn) => ({
          name: ExprUtils.localizeString(entityColumn.name, this.context.locale),
          desc: ExprUtils.localizeString(entityColumn.desc, this.context.locale),
          onClick: () => {
            // Select table
            this.props.onChange(entityColumn.join.toTable)
            return this.setState({ visible: false })
          }
        }))
      }),

      R("br"),

      R(
        "div",
        null,
        R("a", { onClick: this.props.onChange.bind(null, this.state.indicatorTable) }, "Use Raw Indicator")
      )
    )
  }

  render() {
    if (!this.state.visible) {
      return null
    }

    return R(
      ModalPopupComponent,
      {
        showCloseX: true,
        onClose: () => this.setState({ visible: false }),
        header: "Add Indicator"
      },
      this.renderContents()
    )
  }
}

interface IssuesListComponentProps {
  /** Url to hit api */
  apiUrl: string
  /** Optional client */
  client?: string
  schema: any
  /** User id */
  user?: string
  /** Called with table selected */
  onChange: any
  extraTables: any
  onExtraTableAdd: any
  onExtraTableRemove: any
}

interface IssuesListComponentState {
  error: any
  search: any
  issueTypes: any
}

// Searchable list of issue types
class IssuesListComponent extends React.Component<IssuesListComponentProps, IssuesListComponentState> {
  static contextTypes = { locale: PropTypes.string }

  constructor(props: any) {
    super(props)
    this.state = {
      issueTypes: null,
      search: ""
    }
  }

  componentDidMount() {
    // Get names and basic of issueTypes
    const query = {}
    query.fields = JSON.stringify({ name: 1, desc: 1, roles: 1, created: 1, modified: 1 })
    query.client = this.props.client

    // Get list of all issueType names
    return $.getJSON(this.props.apiUrl + "issue_types?" + querystring.stringify(query), (issueTypes) => {
      // Sort by modified.on desc but first by user
      issueTypes = _.sortByOrder(
        issueTypes,
        [
          (issueType) => ((this.props.extraTables || []).includes("issues:" + issueType._id) ? 0 : 1),
          (issueType) => (issueType.created.by === this.props.user ? 0 : 1),
          (issueType) => ExprUtils.localizeString(issueType.name, this.context.locale)
        ],
        ["asc", "asc", "asc"]
      )

      return this.setState({
        issueTypes: _.map(issueTypes, (issueType) => ({
          id: issueType._id,
          name: ExprUtils.localizeString(issueType.name, this.context.locale),
          desc: ExprUtils.localizeString(issueType.desc, this.context.locale)
        }))
      })
    }).fail((xhr) => {
      return this.setState({ error: xhr.responseText })
    })
  }

  handleTableRemove = (table: any) => {
    if (
      confirm(
        `Remove ${ExprUtils.localizeString(
          table.name,
          this.context.locale
        )}? Any widgets that depend on it will no longer work properly.`
      )
    ) {
      return this.props.onExtraTableRemove(table.id)
    }
  }

  searchRef = (comp: any) => {
    // Focus
    if (comp) {
      return comp.focus()
    }
  }

  render() {
    let issueTypes
    if (this.state.error) {
      return R("div", { className: "alert alert-danger" }, this.state.error)
    }

    // Filter issueTypes
    if (this.state.search) {
      const escapeRegExp = (s: any) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")

      const searchStringRegExp = new RegExp(escapeRegExp(this.state.search), "i")

      issueTypes = _.filter(this.state.issueTypes, (issueType) => issueType.name.match(searchStringRegExp))
    } else {
      ;({ issueTypes } = this.state)
    }

    // Remove if already included
    issueTypes = _.filter(issueTypes, (f) => !(this.props.extraTables || []).includes(`issues:${f.id}`))

    let tables = _.filter(
      this.props.schema.getTables(),
      (table) => (table.id.match(/^issues:/) || table.id.match(/^issue_events:/)) && !table.deprecated
    )
    tables = _.sortBy(tables, (t) => t.name.en)

    return R(
      "div",
      null,
      R("label", null, "Included Issues:"),
      tables.length > 0
        ? R(uiComponents.OptionListComponent, {
            items: _.map(tables, (table) => {
              return {
                name: ExprUtils.localizeString(table.name, this.context.locale),
                desc: ExprUtils.localizeString(table.desc, this.context.locale),
                onClick: this.props.onChange.bind(null, table.id),
                onRemove: this.handleTableRemove.bind(null, table)
              }
            })
          })
        : R("div", null, "None"),

      R("br"),

      R("label", null, "All Issues:"),
      !this.state.issueTypes || this.state.issueTypes.length === 0
        ? R(
            "div",
            { className: "alert alert-info" },
            R("i", { className: "fa fa-spinner fa-spin" }),
            "\u00A0Loading..."
          )
        : [
            R("input", {
              type: "text",
              className: "form-control input-sm",
              placeholder: "Search...",
              key: "search",
              ref: this.searchRef,
              style: { maxWidth: "20em", marginBottom: 10 },
              value: this.state.search,
              onChange: (ev: any) => this.setState({ search: ev.target.value })
            }),

            R(uiComponents.OptionListComponent, {
              items: _.map(issueTypes, (issueType) => ({
                name: issueType.name,
                desc: issueType.desc,
                onClick: this.props.onChange.bind(null, "issues:" + issueType.id)
              }))
            })
          ]
    )
  }
}
