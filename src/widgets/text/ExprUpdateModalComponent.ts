// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let ExprUpdateModalComponent;
import PropTypes from 'prop-types';
import React from 'react';
const R = React.createElement;

import { ExprUtils } from "mwater-expressions";
import { ExprComponent } from "mwater-expressions-ui";
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent";
import TableSelectComponent from '../../TableSelectComponent';
import ExprItemEditorComponent from './ExprItemEditorComponent';

// Modal that displays an expression builder for updating an expression
export default ExprUpdateModalComponent = (function() {
  ExprUpdateModalComponent = class ExprUpdateModalComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired,   // Schema to use
        dataSource: PropTypes.object.isRequired, // Data source to use to get values
        singleRowTable: PropTypes.string
      };
        // Table that is filtered to have one row
    }

    constructor(props) {
      super(props);

      this.state = {
        open: false,
        exprItem: null,
        onUpdate: null
      };
    }

    open(item, onUpdate) {
      return this.setState({open: true, exprItem: item, onUpdate});
    }

    render() {
      if (!this.state.open) {
        return null;
      }

      return R(ActionCancelModalComponent, { 
        actionLabel: "Update",
        onAction: () => { 
          // Close first to avoid strange effects when mixed with pojoviews
          return this.setState({open: false}, () => {
            return this.state.onUpdate(this.state.exprItem);
          });
        },
        onCancel: () => this.setState({open: false}),
        title: "Update Field"
      },
          R(ExprItemEditorComponent, { 
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            exprItem: this.state.exprItem,
            onChange: exprItem => this.setState({exprItem}),
            singleRowTable: this.props.singleRowTable
          }
          )
      );
    }
  };
  ExprUpdateModalComponent.initClass();
  return ExprUpdateModalComponent;
})();