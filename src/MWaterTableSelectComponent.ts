import _ from "lodash"
import $ from "jquery"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import { ToggleEditComponent, OptionListComponent } from "./UIComponents"
import { ExprUtils, Schema } from "mwater-expressions"
import MWaterResponsesFilterComponent from "./MWaterResponsesFilterComponent"
import ModalPopupComponent from "react-library/lib/ModalPopupComponent"
import MWaterCompleteTableSelectComponent from "./MWaterCompleteTableSelectComponent"

export interface MWaterTableSelectComponentProps {
  /** Url to hit api */
  apiUrl: string
  /** Optional client */
  client?: string
  schema: Schema
  /** User id */
  user?: string
  table?: string
  /** Called with table selected */
  onChange: any
  extraTables: any
  onExtraTablesChange: any
  /** Can also perform filtering for some types. Include these props to enable this */
  filter?: any
  onFilterChange?: any
}

interface MWaterTableSelectComponentState {
  pendingExtraTable: any
}

// Allows selection of a mwater-visualization table. Loads forms as well and calls event if modified
export default class MWaterTableSelectComponent extends React.Component<
  MWaterTableSelectComponentProps,
  MWaterTableSelectComponentState
> {
  static contextTypes = {
    locale: PropTypes.string, // e.g. "en"

    // Optional list of tables (ids) being used. Use this to present an initially short list to select from
    activeTables: PropTypes.arrayOf(PropTypes.string.isRequired)
  }
  toggleEdit: any

  constructor(props: any) {
    super(props)

    this.state = {
      pendingExtraTable: null // Set when waiting for a table to load
    }
  }

  componentWillReceiveProps(nextProps: any) {
    // If received new schema with pending extra table, select it
    let table
    if (this.state.pendingExtraTable) {
      table = this.state.pendingExtraTable
      if (nextProps.schema.getTable(table)) {
        // No longer waiting
        this.setState({ pendingExtraTable: null })

        // Close toggle edit
        this.toggleEdit.close()

        // Fire change
        nextProps.onChange(table)
      }
    }

    // If table is newly selected and is a responses table and no filters, set filters to final only
    if (
      nextProps.table &&
      nextProps.table.match(/responses:/) &&
      nextProps.table !== this.props.table &&
      !nextProps.filter &&
      nextProps.onFilterChange
    ) {
      return nextProps.onFilterChange({
        type: "op",
        op: "= any",
        table: nextProps.table,
        exprs: [
          { type: "field", table: nextProps.table, column: "status" },
          { type: "literal", valueType: "enumset", value: ["final"] }
        ]
      })
    }
  }

  handleChange = (tableId: any) => {
    // Close toggle edit
    this.toggleEdit.close()

    // Call onChange if different
    if (tableId !== this.props.table) {
      return this.props.onChange(tableId)
    }
  }

  handleTableChange = (tableId: any) => {
    // If not part of extra tables, add it and wait for new schema
    if (tableId && !this.props.schema.getTable(tableId)) {
      return this.setState({ pendingExtraTable: tableId }, () => {
        return this.props.onExtraTablesChange(_.union(this.props.extraTables, [tableId]))
      })
    } else {
      return this.handleChange(tableId)
    }
  }

  render() {
    const editor = R(EditModeTableSelectComponent, {
      apiUrl: this.props.apiUrl,
      client: this.props.client,
      schema: this.props.schema,
      user: this.props.user,
      table: this.props.table,
      onChange: this.handleTableChange,
      extraTables: this.props.extraTables,
      onExtraTablesChange: this.props.onExtraTablesChange
    })

    return R(
      "div",
      null,
      // Show message if loading
      this.state.pendingExtraTable
        ? R(
            "div",
            { className: "alert alert-info", key: "pendingExtraTable" },
            R("i", { className: "fa fa-spinner fa-spin" }),
            "\u00a0Please wait..."
          )
        : undefined,

      R(ToggleEditComponent, {
        ref: (c: any) => {
          this.toggleEdit = c
        },
        forceOpen: !this.props.table, // Must have table
        label: this.props.table
          ? ExprUtils.localizeString(this.props.schema.getTable(this.props.table)?.name, this.context.locale)
          : "",
        editor
      }),

      // Make sure table still exists
      this.props.table &&
        this.props.onFilterChange &&
        this.props.table.match(/^responses:/) &&
        this.props.schema.getTable(this.props.table)
        ? R(MWaterResponsesFilterComponent, {
            schema: this.props.schema,
            table: this.props.table,
            filter: this.props.filter,
            onFilterChange: this.props.onFilterChange
          })
        : undefined
    )
  }
}

interface EditModeTableSelectComponentProps {
  /** Url to hit api */
  apiUrl: string
  /** Optional client */
  client?: string
  schema: Schema
  /** User id */
  user?: string
  table?: string
  /** Called with table selected */
  onChange: any
  extraTables: any
  onExtraTablesChange: any
}

interface EditModeTableSelectComponentState {
  completeMode: any
}

// Is the table select component when in edit mode. Toggles between complete list and simplified list
class EditModeTableSelectComponent extends React.Component<
  EditModeTableSelectComponentProps,
  EditModeTableSelectComponentState
> {
  static contextTypes = {
    locale: PropTypes.string, // e.g. "en"

    // Optional list of tables (ids) being used. Use this to present an initially short list to select from
    activeTables: PropTypes.arrayOf(PropTypes.string.isRequired)
  }

  constructor(props: any) {
    super(props)

    this.state = {
      // True when in popup mode that shows all tables
      completeMode: false
    }
  }

  handleShowMore = () => {
    return this.setState({ completeMode: true })
  }

  // Get list of tables that should be included in shortlist
  // This is all active tables and all responses tables in schema (so as to include rosters) and all extra tables
  // Also includes current table
  getTableShortlist(): string[] {
    let tables: string[] = this.context.activeTables || []

    // Remove dead tables
    tables = tables.filter(
      (t: any) => this.props.schema.getTable(t) != null && !this.props.schema.getTable(t)!.deprecated
    )
    tables = _.union(
      tables,
      _.filter(_.pluck(this.props.schema.getTables(), "id"), (t) => t.match(/^responses:/))
    )
    if (this.props.table) {
      tables = _.union(tables, [this.props.table])
    }

    for (let extraTable of this.props.extraTables || []) {
      // Check if wildcard
      if (extraTable.match(/\*$/)) {
        for (let table of this.props.schema.getTables()) {
          if (table.id.startsWith(extraTable.substr(0, extraTable.length - 1)) && !table.deprecated) {
            tables = _.union(tables, [table.id])
          }
        }
      } else {
        // Add if exists
        if (this.props.schema.getTable(extraTable) && !this.props.schema.getTable(extraTable)!.deprecated) {
          tables = _.union(tables, [extraTable])
        }
      }
    }

    // Sort by name
    tables = _.sortBy(tables, (tableId) =>
      ExprUtils.localizeString(this.props.schema.getTable(tableId)!.name, this.context.locale)
    )

    return tables
  }

  handleCompleteChange = (tableId: any) => {
    this.setState({ completeMode: false })
    return this.props.onChange(tableId)
  }

  render() {
    const items = _.map(this.getTableShortlist(), (tableId) => {
      const table = this.props.schema.getTable(tableId)!

      return {
        name: ExprUtils.localizeString(table.name, this.context.locale),
        desc: ExprUtils.localizeString(table.desc, this.context.locale),
        onClick: this.props.onChange.bind(null, table.id)
      }
    })

    return R(
      "div",
      null,
      this.state.completeMode
        ? R(
            ModalPopupComponent,
            {
              header: "Select Data Source",
              onClose: () => this.setState({ completeMode: false }),
              showCloseX: true,
              size: "x-large"
            },
            R(MWaterCompleteTableSelectComponent, {
              apiUrl: this.props.apiUrl,
              client: this.props.client,
              schema: this.props.schema,
              user: this.props.user,
              table: this.props.table,
              onChange: this.handleCompleteChange,
              extraTables: this.props.extraTables,
              onExtraTablesChange: this.props.onExtraTablesChange
            })
          )
        : undefined,

      items.length > 0
        ? [
            R("div", { className: "text-muted" }, "Select Data Source:"),

            R(OptionListComponent, { items }),

            R(
              "div",
              null,
              items.length > 0
                ? R(
                    "button",
                    { type: "button", className: "btn btn-link btn-sm", onClick: this.handleShowMore },
                    "Show All Available Data Sources..."
                  )
                : undefined
            )
          ]
        : R(
            "button",
            { type: "button", className: "btn btn-link", onClick: this.handleShowMore },
            "Select Data Source..."
          )
    )
  }
}
