var ActionCancelModalComponent, AutoSizeComponent, DatagridComponent, DatagridDesignerComponent, DatagridUtils, DatagridViewComponent, H, QuickfilterCompiler, QuickfiltersComponent, R, React, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

AutoSizeComponent = require('react-library/lib/AutoSizeComponent');

ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent');

DatagridViewComponent = require('./DatagridViewComponent');

DatagridDesignerComponent = require('./DatagridDesignerComponent');

DatagridUtils = require('./DatagridUtils');

QuickfiltersComponent = require('../quickfilter/QuickfiltersComponent');

QuickfilterCompiler = require('../quickfilter/QuickfilterCompiler');

module.exports = DatagridComponent = (function(superClass) {
  extend(DatagridComponent, superClass);

  DatagridComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    datagridDataSource: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func,
    titleElem: React.PropTypes.node,
    extraTitleButtonsElem: React.PropTypes.node,
    canEditCell: React.PropTypes.func,
    updateCell: React.PropTypes.func,
    onRowDoubleClick: React.PropTypes.func
  };

  function DatagridComponent(props) {
    this.handleEdit = bind(this.handleEdit, this);
    this.handleCellEditingToggle = bind(this.handleCellEditingToggle, this);
    DatagridComponent.__super__.constructor.call(this, props);
    this.state = {
      editingDesign: null,
      cellEditingEnabled: false,
      quickfiltersValues: null
    };
  }

  DatagridComponent.prototype.handleCellEditingToggle = function() {
    if (this.state.cellEditingEnabled) {
      return this.setState({
        cellEditingEnabled: false
      });
    } else {
      if (confirm("Turn on cell editing? This is allow you to edit the live data and is an advanced feature.")) {
        return this.setState({
          cellEditingEnabled: true
        });
      }
    }
  };

  DatagridComponent.prototype.handleEdit = function() {
    return this.setState({
      editingDesign: this.props.design
    });
  };

  DatagridComponent.prototype.renderCellEdit = function() {
    var label;
    if (!this.props.canEditCell || (this.props.onDesignChange == null)) {
      return null;
    }
    label = [
      H.i({
        className: this.state.cellEditingEnabled ? "fa fa-fw fa-check-square" : "fa fa-fw fa-square-o"
      }), " ", "Cell Editing"
    ];
    return H.a({
      key: "cell-edit",
      className: "btn btn-link btn-sm",
      onClick: this.handleCellEditingToggle
    }, label);
  };

  DatagridComponent.prototype.renderEditButton = function() {
    if (!this.props.onDesignChange) {
      return null;
    }
    return H.button({
      type: "button",
      className: "btn btn-primary",
      onClick: this.handleEdit
    }, H.span({
      className: "glyphicon glyphicon-cog"
    }), " ", "Settings");
  };

  DatagridComponent.prototype.renderTitleBar = function() {
    return H.div({
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 40,
        padding: 4
      }
    }, H.div({
      style: {
        float: "right"
      }
    }, this.renderCellEdit(), this.renderEditButton(), this.props.extraTitleButtonsElem), this.props.titleElem);
  };

  DatagridComponent.prototype.renderQuickfilter = function() {
    return H.div({
      style: {
        position: "absolute",
        top: 40,
        left: 0,
        right: 0,
        height: 50
      }
    }, R(QuickfiltersComponent, {
      design: this.props.design.quickfilters,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      values: this.state.quickfiltersValues,
      table: this.props.design.table,
      onValuesChange: (function(_this) {
        return function(values) {
          return _this.setState({
            quickfiltersValues: values
          });
        };
      })(this)
    }));
  };

  DatagridComponent.prototype.renderEditor = function() {
    if (!this.state.editingDesign) {
      return;
    }
    return R(ActionCancelModalComponent, {
      onAction: (function(_this) {
        return function() {
          _this.props.onDesignChange(_this.state.editingDesign);
          return _this.setState({
            editingDesign: null
          });
        };
      })(this),
      onCancel: (function(_this) {
        return function() {
          return _this.setState({
            editingDesign: null
          });
        };
      })(this),
      size: "large"
    }, R(DatagridDesignerComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      design: this.state.editingDesign,
      onDesignChange: (function(_this) {
        return function(design) {
          return _this.setState({
            editingDesign: design
          });
        };
      })(this)
    }));
  };

  DatagridComponent.prototype.render = function() {
    var filters, hasQuickfilters, ref;
    filters = new QuickfilterCompiler(this.props.schema).compile(this.props.design.quickfilters, this.state.quickfiltersValues);
    hasQuickfilters = ((ref = this.props.design.quickfilters) != null ? ref[0] : void 0) != null;
    return H.div({
      style: {
        width: "100%",
        height: "100%",
        position: "relative",
        paddingTop: (hasQuickfilters ? 90 : 40)
      }
    }, this.renderTitleBar(), this.renderQuickfilter(), this.renderEditor(), this.props.design.table ? R(AutoSizeComponent, {
      injectWidth: true,
      injectHeight: true
    }, (function(_this) {
      return function(size) {
        var design;
        design = new DatagridUtils(_this.props.schema).cleanDesign(_this.props.design);
        if (!new DatagridUtils(_this.props.schema).validateDesign(design)) {
          return R(DatagridViewComponent, {
            width: size.width,
            height: size.height,
            pageSize: 100,
            schema: _this.props.schema,
            dataSource: _this.props.dataSource,
            datagridDataSource: _this.props.datagridDataSource,
            design: _this.props.design,
            filters: filters,
            onDesignChange: _this.props.onDesignChange,
            onRowDoubleClick: _this.props.onRowDoubleClick,
            canEditCell: _this.props.canEditCell,
            updateCell: _this.props.updateCell
          });
        } else {
          return H.div({
            style: {
              textAlign: "center",
              marginTop: size.height / 2
            }
          }, H.a({
            onClick: _this.handleEdit
          }, "Click to configure"));
        }
      };
    })(this)) : void 0);
  };

  return DatagridComponent;

})(React.Component);
