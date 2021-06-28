import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import ModalWindowComponent from "react-library/lib/ModalWindowComponent"
import BlocksLayoutManager from "../layouts/blocks/BlocksLayoutManager"
import WidgetFactory from "../widgets/WidgetFactory"
import DirectWidgetDataSource from "../widgets/DirectWidgetDataSource"
import PopupFilterJoinsEditComponent from "./PopupFilterJoinsEditComponent"

interface EditPopupComponentProps {
  /** Schema to use */
  schema: any
  dataSource: any
  /** Design of the marker layer */
  design: any
  /** Called with new design */
  onDesignChange: any
  /** Table that popup is for */
  table: string
  /** Table of the row that join is to. Usually same as table except for choropleth maps */
  idTable: string
  defaultPopupFilterJoins: any
}

interface EditPopupComponentState {
  editing: any
}

// Modal for editing design of popup
export default class EditPopupComponent extends React.Component<EditPopupComponentProps, EditPopupComponentState> {
  constructor(props: any) {
    super(props)
    this.state = { editing: false }
  }

  handleItemsChange = (items: any) => {
    let popup = this.props.design.popup || {}
    popup = _.extend({}, popup, { items })
    const design = _.extend({}, this.props.design, { popup })
    return this.props.onDesignChange(design)
  }

  handleRemovePopup = () => {
    const design = _.omit(this.props.design, "popup")
    return this.props.onDesignChange(design)
  }

  render() {
    return R(
      "div",
      null,
      R(
        "a",
        { className: "btn btn-link", onClick: () => this.setState({ editing: true }) },
        R("i", { className: "fa fa-pencil" }),
        " Customize Popup"
      ),

      this.props.design.popup
        ? R(
            "a",
            { className: "btn btn-link", onClick: this.handleRemovePopup },
            R("i", { className: "fa fa-times" }),
            " Remove Popup"
          )
        : undefined,

      this.props.design.popup
        ? R(PopupFilterJoinsEditComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.table,
            idTable: this.props.idTable,
            defaultPopupFilterJoins: this.props.defaultPopupFilterJoins,
            popup: this.props.design.popup,
            design: this.props.design.popupFilterJoins,
            onDesignChange: (popupFilterJoins: any) =>
              this.props.onDesignChange(_.extend({}, this.props.design, { popupFilterJoins }))
          })
        : undefined,

      this.state.editing
        ? R(
            ModalWindowComponent,
            { isOpen: true, onRequestClose: () => this.setState({ editing: false }) },
            new BlocksLayoutManager().renderLayout({
              items: this.props.design.popup?.items,
              style: "popup",
              onItemsChange: this.handleItemsChange,
              disableMaps: true,
              renderWidget: (options: any) => {
                const widget = WidgetFactory.createWidget(options.type)

                const widgetDataSource = new DirectWidgetDataSource({
                  widget,
                  schema: this.props.schema,
                  dataSource: this.props.dataSource
                })

                return widget.createViewElement({
                  schema: this.props.schema,
                  dataSource: this.props.dataSource,
                  widgetDataSource,
                  design: options.design,
                  scope: null,
                  filters: [],
                  onScopeChange: null,
                  onDesignChange: options.onDesignChange,
                  width: options.width,
                  height: options.height,
                  singleRowTable: this.props.table
                })
              }
            })
          )
        : undefined
    )
  }
}
