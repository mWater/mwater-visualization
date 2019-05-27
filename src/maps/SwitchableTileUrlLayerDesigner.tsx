import _ from 'lodash'
import React from 'react'
const R = React.createElement
import { produce } from "immer"

import { ExprComponent, FilterExprComponent } from "mwater-expressions-ui"
import { ExprCompiler, Schema, DataSource, Expr, OpExpr } from 'mwater-expressions'
import AxisComponent from './../axes/AxisComponent'
import TableSelectComponent from '../TableSelectComponent'
import ColorComponent from '../ColorComponent'
import Rcslider from 'rc-slider'
import ChoroplethLayerDesign from './ChoroplethLayerDesign'
import { JsonQLFilter } from '../index';
const EditPopupComponent = require('./EditPopupComponent');
const ZoomLevelsComponent = require('./ZoomLevelsComponent');
import ui, { Radio } from 'react-library/lib/bootstrap'
import { Axis } from '../axes/Axis';
import { SwitchableTileUrlLayerDesign } from './SwitchableTileUrlLayer';

const AdminScopeAndDetailLevelComponent = require('./AdminScopeAndDetailLevelComponent');
const ScopeAndDetailLevelComponent = require('./ScopeAndDetailLevelComponent');

/** Designer for a switchable tile url layer */
export default class SwitchableTileUrlLayerDesigner extends React.Component<{
  design: SwitchableTileUrlLayerDesign
  onDesignChange: (design: SwitchableTileUrlLayerDesign) => void
  /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
  filters: JsonQLFilter[]
}> {
  update(mutation: (d: SwitchableTileUrlLayerDesign) => void) {
    this.props.onDesignChange(produce(this.props.design, mutation))
  }

  handleChange = (activeOption: string) => {
    this.props.onDesignChange({ ...this.props.design, activeOption: activeOption })
  }

  render() {
    return <div>
      { this.props.design.options.map(opt => {
        return <Radio key={opt.id} value={this.props.design.activeOption} radioValue={opt.id} onChange={this.handleChange} inline={false}>{opt.name}</Radio>
      })}
    </div>
  }
}