import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import _ from "lodash"
import * as ui from "react-library/lib/bootstrap"
import update from "react-library/lib/update"
import Widget from "./Widget"
import DropdownWidgetComponent from "./DropdownWidgetComponent"
import ModalPopupComponent from "react-library/lib/ModalPopupComponent"

// Table of contents widget that displays the h1, h2, etc entries from all text fields in one widget
// design is:
//   header: text of header. Defaults to "Contents"
//   borderWeight: border weight. Defaults to 0=None. 1=light, 2=medium, 3=heavy
//   numbering: true/false for prepending numbering to entries (e.g. 3.4.1)
export default class TOCWidget extends Widget {
  // Creates a React element that is a view of the widget
  // options:
  //  schema: schema to use
  //  dataSource: data source to use
  //  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
  //  design: widget design
  //  scope: scope of the widget (when the widget self-selects a particular scope)
  //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  //  onScopeChange: called with scope of widget
  //  onDesignChange: called with new design. null/undefined for readonly
  //  width: width in pixels on screen
  //  height: height in pixels on screen
  //  tocEntries: entries in the table of contents
  //  onScrollToTOCEntry: called with (widgetId, tocEntryId) to scroll to TOC entry
  createViewElement(options: any) {
    return R(TOCWidgetComponent, {
      design: options.design,
      onDesignChange: options.onDesignChange,
      width: options.width,
      height: options.height,
      tocEntries: options.tocEntries,
      onScrollToTOCEntry: options.onScrollToTOCEntry
    })
  }

  // Determine if widget is auto-height, which means that a vertical height is not required.
  isAutoHeight() {
    return true
  }
}

class TOCWidgetComponent extends React.Component {
  static propTypes = {
    design: PropTypes.object.isRequired, // See Map Design.md
    onDesignChange: PropTypes.func, // Called with new design. null/undefined for readonly

    width: PropTypes.number,
    height: PropTypes.number,
    tocEntries: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.any,
        widgetId: PropTypes.string.isRequired,
        level: PropTypes.number.isRequired,
        text: PropTypes.string.isRequired
      })
    ),
    onScrollToTOCEntry: PropTypes.func
  }

  constructor(props: any) {
    super(props)
    this.state = {
      editing: false // true if editing
    }
  }

  handleStartEditing = () => {
    return this.setState({ editing: true })
  }
  handleEndEditing = () => {
    return this.setState({ editing: false })
  }

  renderEditor() {
    if (!this.state.editing) {
      return null
    }

    // Create editor
    const editor = R(TOCWidgetDesignerComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    })

    return R(
      ModalPopupComponent,
      {
        showCloseX: true,
        header: "Table of Contents Options",
        onClose: this.handleEndEditing
      },
      editor
    )
  }

  renderContent() {
    return R(TOCWidgetViewComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      width: this.props.width,
      height: this.props.height,
      tocEntries: this.props.tocEntries,
      onScrollToTOCEntry: this.props.onScrollToTOCEntry
    })
  }

  render() {
    const dropdownItems = []
    if (this.props.onDesignChange != null) {
      dropdownItems.push({ label: "Edit", icon: "pencil", onClick: this.handleStartEditing })
    }

    // Wrap in a simple widget
    return R(
      "div",
      { onDoubleClick: this.handleStartEditing },
      this.props.onDesignChange != null ? this.renderEditor() : undefined,
      R(
        DropdownWidgetComponent,
        {
          width: this.props.width,
          height: this.props.height,
          dropdownItems
        },
        this.renderContent()
      )
    )
  }
}

// Displays the contents of the widget
class TOCWidgetViewComponent extends React.Component {
  static propTypes = {
    design: PropTypes.object.isRequired, // Design of chart
    onDesignChange: PropTypes.func, // Called with new design. null/undefined for readonly

    width: PropTypes.number,
    height: PropTypes.number,

    tocEntries: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.any,
        widgetId: PropTypes.string.isRequired,
        level: PropTypes.number.isRequired,
        text: PropTypes.string.isRequired
      })
    ),
    onScrollToTOCEntry: PropTypes.func
  }

  handleEntryClick = (tocEntry: any) => {
    return this.props.onScrollToTOCEntry?.(tocEntry.widgetId, tocEntry.id)
  }

  renderTOCEntry(tocEntry: any, index: any) {
    // Find indentation number (e.g "1.3.2") by counting # backwards that are same level with no level lower
    let level
    let indentation = ""
    if (this.props.design.numbering) {
      let asc, end
      for (
        level = 1, end = tocEntry.level, asc = 1 <= end;
        asc ? level <= end : level >= end;
        asc ? level++ : level--
      ) {
        let value = 0
        for (let i2 = 0, end1 = index, asc1 = 0 <= end1; asc1 ? i2 <= end1 : i2 >= end1; asc1 ? i2++ : i2--) {
          if (this.props.tocEntries[i2].level === level) {
            value += 1
          } else if (this.props.tocEntries[i2].level < level) {
            value = 0
          }
        }

        indentation += `${value}.`
      }
      indentation += " "
    }

    return R(
      "div",
      { key: index, style: { paddingLeft: tocEntry.level * 8 - 8 } },
      R(
        "a",
        { className: "link-plain", onClick: this.handleEntryClick.bind(null, tocEntry) },
        indentation,
        R("span", null, tocEntry.text)
      )
    )
  }

  render() {
    // Get border
    const border = (() => {
      switch (this.props.design.borderWeight) {
        case 0:
          return "none"
        case 1:
          return "solid 1px #f4f4f4"
        case 2:
          return "solid 1px #ccc"
        case 3:
          return "solid 1px #888"
      }
    })()

    return R(
      "div",
      {
        style: {
          width: this.props.width,
          height: this.props.height,
          border,
          padding: 5,
          margin: 1
        }
      },
      // Render header
      R("div", { style: { fontWeight: "bold" } }, this.props.design.header),
      _.map(this.props.tocEntries, (tocEntry, i) => {
        return this.renderTOCEntry(tocEntry, i)
      }),

      // Add placeholder if none and editable
      this.props.onDesignChange && this.props.tocEntries.length === 0
        ? R(
            "div",
            { className: "text-muted" },
            "Table of Contents will appear here as text blocks with headings are added to the dashboard"
          )
        : undefined
    )
  }
}

// Designer for TOC widget options
class TOCWidgetDesignerComponent extends React.Component {
  constructor(...args: any[]) {
    super(...args)
    this.update = this.update.bind(this)
  }

  static propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired
  }

  // Updates design with the specified changes
  update() {
    return update(this.props.design, this.props.onDesignChange, arguments)
  }

  handleMarkdownChange = (ev: any) => {
    const design = _.extend({}, this.props.design, { markdown: ev.target.value })
    return this.props.onDesignChange(design)
  }

  render() {
    return R(
      "div",
      null,
      R(
        ui.FormGroup,
        { label: "Header" },
        R(ui.TextInput, { value: this.props.design.header || "", onChange: this.update("header"), placeholder: "None" })
      ),
      R(
        ui.FormGroup,
        { label: "Border" },
        R(BorderComponent, { value: this.props.design.borderWeight || 0, onChange: this.update("borderWeight") })
      ),
      R(
        ui.FormGroup,
        { label: "Numbering" },
        R(
          ui.Radio,
          {
            inline: true,
            value: this.props.design.numbering || false,
            radioValue: true,
            onChange: this.update("numbering")
          },
          "On"
        ),
        R(
          ui.Radio,
          {
            inline: true,
            value: this.props.design.numbering || false,
            radioValue: false,
            onChange: this.update("numbering")
          },
          "Off"
        )
      )
    )
  }
}

// Allows setting border heaviness
class BorderComponent extends React.Component {
  static propTypes = {
    value: PropTypes.number,
    defaultValue: PropTypes.number,
    onChange: PropTypes.func.isRequired
  }

  render() {
    const value = this.props.value != null ? this.props.value : this.props.defaultValue

    return R(
      "div",
      null,
      R(ui.Radio, { inline: true, value, radioValue: 0, onChange: this.props.onChange }, "None"),
      R(ui.Radio, { inline: true, value, radioValue: 1, onChange: this.props.onChange }, "Light"),
      R(ui.Radio, { inline: true, value, radioValue: 2, onChange: this.props.onChange }, "Medium"),
      R(ui.Radio, { inline: true, value, radioValue: 3, onChange: this.props.onChange }, "Heavy")
    )
  }
}
