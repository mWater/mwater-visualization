var ActionCancelModalComponent, AutoSizeComponent, DatagridComponent, H, R, React, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

AutoSizeComponent = require('react-library/lib/AutoSizeComponent');

ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent');

module.exports = DatagridComponent = (function(superClass) {
  extend(DatagridComponent, superClass);

  DatagridComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func,
    titleElem: React.PropTypes.node,
    extraTitleButtonsElem: React.PropTypes.node,
    canEditCell: React.PropTypes.func,
    updateCell: React.PropTypes.func,
    onRowDoubleClick: React.PropTypes.func
  };

  function DatagridComponent(props) {
    this.handleCellEditingToggle = bind(this.handleCellEditingToggle, this);
    DatagridComponent.__super__.constructor.call(this, props);
    this.state = {
      editingDesign: null,
      cellEditingEnabled: false
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

  DatagridComponent.prototype.renderCellEdit = function() {
    var label;
    if (!this.props.canEditCell) {
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

  DatagridComponent.prototype.renderEditButton = function(design) {
    if (!this.props.onDesignChange) {
      return null;
    }
    return H.button({
      type: "button",
      className: "btn btn-primary",
      onClick: ((function(_this) {
        return function() {
          return _this.setState({
            editingDesign: design
          });
        };
      })(this))
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
    }, this.renderCellEdit(), this.renderEditButton()), this.props.titleElem);
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
      schema: config.schema,
      dataSource: config.dataSource,
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
    return H.div({
      style: {
        width: "100%",
        height: "100%",
        position: "relative"
      }
    }, this.renderTitleBar(), this.renderEditor(config), H.div({
      style: {
        height: 40,
        padding: 4
      }
    }, H.div({
      style: {
        float: "right"
      }
    }, !readonly ? this.renderCellEdit() : void 0, this.renderExtraTitleButtonsElem(), this.renderDownload(), !readonly ? this.renderEditButton(design) : void 0), this.renderTitleElem()), design.table ? H.div({
      style: {
        position: "absolute",
        top: 40,
        left: 0,
        right: 0,
        bottom: 0
      }
    }, R(AutoSizeComponent, {
      injectWidth: true,
      injectHeight: true
    }, (function(_this) {
      return function(size) {
        return R(DatagridComponent, {
          width: size.width,
          height: size.height,
          pageSize: 100,
          schema: _this.props.schema,
          dataSource: _this.props.dataSource,
          design: design,
          onDesignChange: _this.props.onDesignChange,
          onRowDoubleClick: _this.props.onRowDoubleClick,
          canEditCell: _this.props.canEditCell,
          updateCell: _this.props.updateCell
        });
      };
    })(this))) : void 0);
  };

  return DatagridComponent;

})(React.Component);
