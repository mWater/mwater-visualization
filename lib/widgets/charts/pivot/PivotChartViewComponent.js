var ActionCancelModalComponent, ExprUtils, H, IntersectionDesignerComponent, PivotChartLayoutBuilder, PivotChartLayoutComponent, PivotChartUtils, PivotChartViewComponent, R, React, ReactDOM, SegmentDesignerComponent, TextComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

ReactDOM = require('react-dom');

R = React.createElement;

H = React.DOM;

ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent');

ExprUtils = require('mwater-expressions').ExprUtils;

TextComponent = require('../../text/TextComponent');

PivotChartUtils = require('./PivotChartUtils');

PivotChartLayoutComponent = require('./PivotChartLayoutComponent');

PivotChartLayoutBuilder = require('./PivotChartLayoutBuilder');

SegmentDesignerComponent = require('./SegmentDesignerComponent');

IntersectionDesignerComponent = require('./IntersectionDesignerComponent');

module.exports = PivotChartViewComponent = (function(superClass) {
  extend(PivotChartViewComponent, superClass);

  PivotChartViewComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    data: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func,
    width: React.PropTypes.number.isRequired,
    standardWidth: React.PropTypes.number,
    scope: React.PropTypes.any,
    onScopeChange: React.PropTypes.func
  };

  PivotChartViewComponent.contextTypes = {
    locale: React.PropTypes.string
  };

  function PivotChartViewComponent() {
    this.handleAddChildSegment = bind(this.handleAddChildSegment, this);
    this.handleInsertAfterSegment = bind(this.handleInsertAfterSegment, this);
    this.handleInsertBeforeSegment = bind(this.handleInsertBeforeSegment, this);
    this.handleRemoveSegment = bind(this.handleRemoveSegment, this);
    this.handleCancelEditIntersection = bind(this.handleCancelEditIntersection, this);
    this.handleSaveEditIntersection = bind(this.handleSaveEditIntersection, this);
    this.handleCancelEditSegment = bind(this.handleCancelEditSegment, this);
    this.handleSaveEditSegment = bind(this.handleSaveEditSegment, this);
    this.handleEditSection = bind(this.handleEditSection, this);
    this.handleFooterChange = bind(this.handleFooterChange, this);
    this.handleHeaderChange = bind(this.handleHeaderChange, this);
    PivotChartViewComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      editSegment: null,
      editIntersectionId: null,
      editIntersection: null
    };
  }

  PivotChartViewComponent.prototype.handleHeaderChange = function(header) {
    return this.props.onDesignChange(_.extend({}, this.props.design, {
      header: header
    }));
  };

  PivotChartViewComponent.prototype.handleFooterChange = function(footer) {
    return this.props.onDesignChange(_.extend({}, this.props.design, {
      footer: footer
    }));
  };

  PivotChartViewComponent.prototype.handleEditSection = function(sectionId) {
    var segment;
    if (sectionId.match(":")) {
      return this.setState({
        editIntersectionId: sectionId,
        editIntersection: this.props.design.intersections[sectionId] || {}
      });
    } else {
      segment = PivotChartUtils.findSegment(this.props.design.rows, sectionId) || PivotChartUtils.findSegment(this.props.design.columns, sectionId);
      return this.setState({
        editSegment: segment
      });
    }
  };

  PivotChartViewComponent.prototype.handleSaveEditSegment = function() {
    var design, segment;
    segment = this.state.editSegment;
    if (segment.label == null) {
      segment = _.extend({}, segment, {
        label: ""
      });
    }
    design = _.extend({}, this.props.design, {
      rows: PivotChartUtils.replaceSegment(this.props.design.rows, segment),
      columns: PivotChartUtils.replaceSegment(this.props.design.columns, segment)
    });
    this.props.onDesignChange(design);
    return this.setState({
      editSegment: null
    });
  };

  PivotChartViewComponent.prototype.handleCancelEditSegment = function() {
    return this.setState({
      editSegment: null
    });
  };

  PivotChartViewComponent.prototype.handleSaveEditIntersection = function() {
    var design, intersections;
    intersections = _.clone(this.props.design.intersections);
    intersections[this.state.editIntersectionId] = this.state.editIntersection;
    design = _.extend({}, this.props.design, {
      intersections: intersections
    });
    this.props.onDesignChange(design);
    return this.setState({
      editIntersectionId: null,
      editIntersection: null
    });
  };

  PivotChartViewComponent.prototype.handleCancelEditIntersection = function() {
    return this.setState({
      editIntersectionId: null,
      editIntersection: null
    });
  };

  PivotChartViewComponent.prototype.handleRemoveSegment = function(segmentId) {
    var design;
    design = _.extend({}, this.props.design, {
      rows: PivotChartUtils.removeSegment(this.props.design.rows, segmentId),
      columns: PivotChartUtils.removeSegment(this.props.design.columns, segmentId)
    });
    return this.props.onDesignChange(design);
  };

  PivotChartViewComponent.prototype.handleInsertBeforeSegment = function(segmentId) {
    var design;
    design = _.extend({}, this.props.design, {
      rows: PivotChartUtils.insertBeforeSegment(this.props.design.rows, segmentId),
      columns: PivotChartUtils.insertBeforeSegment(this.props.design.columns, segmentId)
    });
    return this.props.onDesignChange(design);
  };

  PivotChartViewComponent.prototype.handleInsertAfterSegment = function(segmentId) {
    var design;
    design = _.extend({}, this.props.design, {
      rows: PivotChartUtils.insertAfterSegment(this.props.design.rows, segmentId),
      columns: PivotChartUtils.insertAfterSegment(this.props.design.columns, segmentId)
    });
    return this.props.onDesignChange(design);
  };

  PivotChartViewComponent.prototype.handleAddChildSegment = function(segmentId) {
    var design;
    design = _.extend({}, this.props.design, {
      rows: PivotChartUtils.addChildSegment(this.props.design.rows, segmentId),
      columns: PivotChartUtils.addChildSegment(this.props.design.columns, segmentId)
    });
    return this.props.onDesignChange(design);
  };

  PivotChartViewComponent.prototype.renderHeader = function() {
    return H.div({
      ref: "header"
    }, R(TextComponent, {
      design: this.props.design.header,
      onDesignChange: this.props.onDesignChange ? this.handleHeaderChange : void 0,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      exprValues: this.props.data.header || {},
      width: this.props.width,
      standardWidth: this.props.standardWidth
    }));
  };

  PivotChartViewComponent.prototype.renderFooter = function() {
    return H.div({
      ref: "footer"
    }, R(TextComponent, {
      design: this.props.design.footer,
      onDesignChange: this.props.onDesignChange ? this.handleFooterChange : void 0,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      exprValues: this.props.data.footer || {},
      width: this.props.width,
      standardWidth: this.props.standardWidth
    }));
  };

  PivotChartViewComponent.prototype.renderEditSegmentModal = function() {
    var segmentType;
    if (!this.state.editSegment) {
      return;
    }
    segmentType = PivotChartUtils.findSegment(this.props.design.rows, this.state.editSegment.id) ? "row" : "column";
    return R(ActionCancelModalComponent, {
      header: "Edit " + segmentType,
      onAction: this.handleSaveEditSegment,
      onCancel: this.handleCancelEditSegment
    }, R(SegmentDesignerComponent, {
      segment: this.state.editSegment,
      table: this.props.design.table,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      segmentType: segmentType,
      onChange: (function(_this) {
        return function(segment) {
          return _this.setState({
            editSegment: segment
          });
        };
      })(this)
    }));
  };

  PivotChartViewComponent.prototype.renderEditIntersectionModal = function() {
    if (!this.state.editIntersectionId) {
      return;
    }
    return R(ActionCancelModalComponent, {
      header: "Edit Value",
      onAction: this.handleSaveEditIntersection,
      onCancel: this.handleCancelEditIntersection
    }, R(IntersectionDesignerComponent, {
      intersection: this.state.editIntersection,
      table: this.props.design.table,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: (function(_this) {
        return function(intersection) {
          return _this.setState({
            editIntersection: intersection
          });
        };
      })(this)
    }));
  };

  PivotChartViewComponent.prototype.render = function() {
    var layout;
    layout = new PivotChartLayoutBuilder({
      schema: this.props.schema
    }).buildLayout(this.props.design, this.props.data, this.context.locale);
    return H.div({
      style: {
        width: this.props.width,
        height: this.props.height
      }
    }, this.renderHeader(), this.renderEditSegmentModal(), this.renderEditIntersectionModal(), H.div({
      key: "layout",
      style: {
        margin: 10
      }
    }, R(PivotChartLayoutComponent, {
      layout: layout,
      editable: this.props.onDesignChange != null,
      onEditSection: this.props.onDesignChange != null ? this.handleEditSection : void 0,
      onRemoveSegment: this.props.onDesignChange != null ? this.handleRemoveSegment : void 0,
      onInsertBeforeSegment: this.props.onDesignChange != null ? this.handleInsertBeforeSegment : void 0,
      onInsertAfterSegment: this.props.onDesignChange != null ? this.handleInsertAfterSegment : void 0,
      onAddChildSegment: this.props.onDesignChange != null ? this.handleAddChildSegment : void 0
    })), this.renderFooter());
  };

  return PivotChartViewComponent;

})(React.Component);
