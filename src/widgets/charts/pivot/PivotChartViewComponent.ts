// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let PivotChartViewComponent;
import PropTypes from 'prop-types';
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
const R = React.createElement;

import ActionCancelModalComponent from 'react-library/lib/ActionCancelModalComponent';
import { ExprUtils } from 'mwater-expressions';
import TextComponent from '../../text/TextComponent';
import * as PivotChartUtils from './PivotChartUtils';
import PivotChartLayoutComponent from './PivotChartLayoutComponent';
import PivotChartLayoutBuilder from './PivotChartLayoutBuilder';
import SegmentDesignerComponent from './SegmentDesignerComponent';
import IntersectionDesignerComponent from './IntersectionDesignerComponent';

// Displays a pivot chart
export default PivotChartViewComponent = (function() {
  PivotChartViewComponent = class PivotChartViewComponent extends React.Component {
    static initClass() {
      this.propTypes = { 
        schema: PropTypes.object.isRequired,
        dataSource: PropTypes.object.isRequired,
        design: PropTypes.object.isRequired,
        data: PropTypes.object.isRequired,
        onDesignChange: PropTypes.func,
  
        width: PropTypes.number.isRequired,
  
        scope: PropTypes.any, // scope of the widget (when the widget self-selects a particular scope)
        onScopeChange: PropTypes.func, // called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details
        filters: PropTypes.array   // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
      };
  
      this.contextTypes =
        {locale: PropTypes.string};
        // e.g. "en"
    }

    constructor(props) {
      super(props);

      this.state = {
        editSegment: null,   // Segment being edited
        editIntersectionId: null, // id of intersection being edited
        editIntersection: null // value of intersection being edited
      };
    }

    handleHeaderChange = header => {
      return this.props.onDesignChange(_.extend({}, this.props.design, {header}));
    };

    handleFooterChange = footer => {
      return this.props.onDesignChange(_.extend({}, this.props.design, {footer}));
    };

    handleEditSection = sectionId => {
      // If intersection
      if (sectionId.match(":")) {
        return this.setState({editIntersectionId: sectionId, editIntersection: this.props.design.intersections[sectionId] || {}});
      } else {
        // Find segment
        const segment = PivotChartUtils.findSegment(this.props.design.rows, sectionId) || PivotChartUtils.findSegment(this.props.design.columns, sectionId);
        return this.setState({editSegment: segment});
      }
    };

    handleSaveEditSegment = () => {
      // Always has label when saved
      let segment = this.state.editSegment;

      if ((segment.label == null)) {
        segment = _.extend({}, segment, {label: ""});
      }
    
      const design = _.extend({}, this.props.design, {
        rows: PivotChartUtils.replaceSegment(this.props.design.rows, segment),
        columns: PivotChartUtils.replaceSegment(this.props.design.columns, segment)
        });

      this.props.onDesignChange(design);
      return this.setState({editSegment: null});
    };

    handleCancelEditSegment = () => {
      return this.setState({editSegment: null});
    };

    handleSaveEditIntersection = () => {
      const intersections = _.clone(this.props.design.intersections);
      intersections[this.state.editIntersectionId] = this.state.editIntersection;

      const design = _.extend({}, this.props.design, {intersections});
      this.props.onDesignChange(design);
      return this.setState({editIntersectionId: null, editIntersection: null});
    };

    handleCancelEditIntersection = () => {
      return this.setState({editIntersectionId: null, editIntersection: null});
    };

    handleRemoveSegment = segmentId => {
      const design = _.extend({}, this.props.design, {
        rows: PivotChartUtils.removeSegment(this.props.design.rows, segmentId),
        columns: PivotChartUtils.removeSegment(this.props.design.columns, segmentId)
        });

      return this.props.onDesignChange(design);
    };

    handleInsertBeforeSegment = segmentId => {
      const design = _.extend({}, this.props.design, {
        rows: PivotChartUtils.insertBeforeSegment(this.props.design.rows, segmentId),
        columns: PivotChartUtils.insertBeforeSegment(this.props.design.columns, segmentId)
        });

      return this.props.onDesignChange(design);
    };

    handleInsertAfterSegment = segmentId => {
      const design = _.extend({}, this.props.design, {
        rows: PivotChartUtils.insertAfterSegment(this.props.design.rows, segmentId),
        columns: PivotChartUtils.insertAfterSegment(this.props.design.columns, segmentId)
        });

      return this.props.onDesignChange(design);
    };

    handleAddChildSegment = segmentId => {
      const design = _.extend({}, this.props.design, {
        rows: PivotChartUtils.addChildSegment(this.props.design.rows, segmentId),
        columns: PivotChartUtils.addChildSegment(this.props.design.columns, segmentId)
        });

      return this.props.onDesignChange(design);
    };

    handleSummarizeSegment = segmentId => {
      const design = PivotChartUtils.summarizeSegment(this.props.design, segmentId, "Summary");

      return this.props.onDesignChange(design);
    };

    renderHeader() {
      return R('div', {style: { paddingLeft: 10, paddingRight: 10 }},
        R(TextComponent, {
          design: this.props.design.header,
          onDesignChange: this.props.onDesignChange ? this.handleHeaderChange : undefined,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          exprValues: this.props.data.header || {},
          width: this.props.width
        }
        )
      );
    }

    renderFooter() {
      return R('div', {style: { paddingLeft: 10, paddingRight: 10 }},
        R(TextComponent, {
          design: this.props.design.footer,
          onDesignChange: this.props.onDesignChange ? this.handleFooterChange : undefined,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          exprValues: this.props.data.footer || {},
          width: this.props.width
        }
        )
      );
    }

    renderEditSegmentModal() {
      if (!this.state.editSegment) {
        return;
      }

      const segmentType = PivotChartUtils.findSegment(this.props.design.rows, this.state.editSegment.id) ? "row" : "column";

      return R(ActionCancelModalComponent, {
        header: `Edit ${segmentType}`,
        onAction: this.handleSaveEditSegment,
        onCancel: this.handleCancelEditSegment
      },
          R(SegmentDesignerComponent, {
            segment: this.state.editSegment,
            table: this.props.design.table,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            segmentType,
            onChange: segment => this.setState({editSegment: segment}),
            filters: this.props.filters
          }
          )
      );
    }

    renderEditIntersectionModal() {
      if (!this.state.editIntersectionId) {
        return;
      }

      return R(ActionCancelModalComponent, {
        header: "Edit Value",
        onAction: this.handleSaveEditIntersection,
        onCancel: this.handleCancelEditIntersection
      },
          R(IntersectionDesignerComponent, {
            intersection: this.state.editIntersection,
            table: this.props.design.table,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            onChange: intersection => this.setState({editIntersection: intersection}),
            filters: this.props.filters
          }
          )
      );
    }

    render() {
      const layout = new PivotChartLayoutBuilder({schema: this.props.schema}).buildLayout(this.props.design, this.props.data, this.context.locale);

      return R('div', {style: { width: this.props.width, height: this.props.height }},
        this.renderHeader(),
        this.renderEditSegmentModal(),
        this.renderEditIntersectionModal(),
        R('div', {key: "layout", style: { margin: 5, marginTop: 12, overflowX: "auto", padding: 7 }}, // Allow table to scroll since tables have hard minimum widths, Leave room for gear menu
          R(PivotChartLayoutComponent, { 
            layout,
            editable: (this.props.onDesignChange != null),
            onEditSection: (this.props.onDesignChange != null) ? this.handleEditSection : undefined,
            onRemoveSegment: (this.props.onDesignChange != null) ? this.handleRemoveSegment : undefined,
            onInsertBeforeSegment: (this.props.onDesignChange != null) ? this.handleInsertBeforeSegment : undefined,
            onInsertAfterSegment: (this.props.onDesignChange != null) ? this.handleInsertAfterSegment : undefined,
            onAddChildSegment: (this.props.onDesignChange != null) ? this.handleAddChildSegment : undefined,
            onSummarizeSegment: (this.props.onDesignChange != null) ? this.handleSummarizeSegment : undefined
          }
          )
        ),

        this.renderFooter());
    }
  };
  PivotChartViewComponent.initClass();
  return PivotChartViewComponent;
})();
