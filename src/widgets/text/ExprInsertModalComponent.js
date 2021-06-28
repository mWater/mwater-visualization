let ExprInsertModalComponent;
import PropTypes from 'prop-types';
import React from 'react';
const R = React.createElement;

import uuid from 'uuid';
import { ExprUtils } from "mwater-expressions";
import { ExprComponent } from "mwater-expressions-ui";
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent";
import TableSelectComponent from '../../TableSelectComponent';
import ExprItemEditorComponent from './ExprItemEditorComponent';

// Modal that displays an expression builder
export default ExprInsertModalComponent = (function() {
  ExprInsertModalComponent = class ExprInsertModalComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired,   // Schema to use
        dataSource: PropTypes.object.isRequired, // Data source to use to get values
        onInsert: PropTypes.func.isRequired,   // Called with expr item to insert
        singleRowTable: PropTypes.string
      };
        // Table that is filtered to have one row
    }

    constructor(props) {
      this.handleInsert = this.handleInsert.bind(this);
      super(props);

      this.state = {
        open: false,
        exprItem: null
      };
    }

    open() {
      return this.setState({open: true, exprItem: { type: "expr", id: uuid() }});
    }

    handleInsert(ev) {
      if (!this.state.exprItem) {
        return;
      }

      // Close first to avoid strange effects when mixed with pojoviews
      return this.setState({open: false}, () => {
        return this.props.onInsert(this.state.exprItem);
      });
    }

    render() {
      if (!this.state.open) {
        return null;
      }

      return R(ActionCancelModalComponent, { 
        actionLabel: "Insert",
        onAction: this.handleInsert, 
        onCancel: () => this.setState({open: false}),
        title: "Insert Field"
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
  ExprInsertModalComponent.initClass();
  return ExprInsertModalComponent;
})();

