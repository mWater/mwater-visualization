var BlocksLayoutManager, DirectWidgetDataSource, EditPopupComponent, H, ModalWindowComponent, PopupFilterJoinsEditComponent, PropTypes, R, React, WidgetFactory, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

ModalWindowComponent = require('react-library/lib/ModalWindowComponent');

BlocksLayoutManager = require('../layouts/blocks/BlocksLayoutManager');

WidgetFactory = require('../widgets/WidgetFactory');

DirectWidgetDataSource = require('../widgets/DirectWidgetDataSource');

PopupFilterJoinsEditComponent = require('./PopupFilterJoinsEditComponent');

module.exports = EditPopupComponent = (function(superClass) {
  extend(EditPopupComponent, superClass);

  EditPopupComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired,
    table: PropTypes.string.isRequired,
    idTable: PropTypes.string.isRequired,
    defaultPopupFilterJoins: PropTypes.object.isRequired
  };

  function EditPopupComponent() {
    this.handleRemovePopup = bind(this.handleRemovePopup, this);
    this.handleItemsChange = bind(this.handleItemsChange, this);
    EditPopupComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      editing: false
    };
  }

  EditPopupComponent.prototype.handleItemsChange = function(items) {
    var design, popup;
    popup = this.props.design.popup || {};
    popup = _.extend({}, popup, {
      items: items
    });
    design = _.extend({}, this.props.design, {
      popup: popup
    });
    return this.props.onDesignChange(design);
  };

  EditPopupComponent.prototype.handleRemovePopup = function() {
    var design;
    design = _.omit(this.props.design, "popup");
    return this.props.onDesignChange(design);
  };

  EditPopupComponent.prototype.render = function() {
    var ref;
    return H.div(null, H.a({
      className: "btn btn-link",
      onClick: ((function(_this) {
        return function() {
          return _this.setState({
            editing: true
          });
        };
      })(this))
    }, H.i({
      className: "fa fa-pencil"
    }), " Customize Popup"), this.props.design.popup ? H.a({
      className: "btn btn-link",
      onClick: this.handleRemovePopup
    }, H.i({
      className: "fa fa-times"
    }), " Remove Popup") : void 0, this.props.design.popup ? R(PopupFilterJoinsEditComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      idTable: this.props.idTable,
      defaultPopupFilterJoins: this.props.defaultPopupFilterJoins,
      popup: this.props.design.popup,
      design: this.props.design.popupFilterJoins,
      onDesignChange: (function(_this) {
        return function(popupFilterJoins) {
          return _this.props.onDesignChange(_.extend({}, _this.props.design, {
            popupFilterJoins: popupFilterJoins
          }));
        };
      })(this)
    }) : void 0, this.state.editing ? R(ModalWindowComponent, {
      isOpen: true,
      onRequestClose: ((function(_this) {
        return function() {
          return _this.setState({
            editing: false
          });
        };
      })(this))
    }, new BlocksLayoutManager().renderLayout({
      items: (ref = this.props.design.popup) != null ? ref.items : void 0,
      style: "popup",
      onItemsChange: this.handleItemsChange,
      disableMaps: true,
      renderWidget: (function(_this) {
        return function(options) {
          var widget, widgetDataSource;
          widget = WidgetFactory.createWidget(options.type);
          widgetDataSource = new DirectWidgetDataSource({
            widget: widget,
            schema: _this.props.schema,
            dataSource: _this.props.dataSource
          });
          return widget.createViewElement({
            schema: _this.props.schema,
            dataSource: _this.props.dataSource,
            widgetDataSource: widgetDataSource,
            design: options.design,
            scope: null,
            filters: [],
            onScopeChange: null,
            onDesignChange: options.onDesignChange,
            width: options.width,
            height: options.height,
            standardWidth: options.standardWidth,
            singleRowTable: _this.props.table
          });
        };
      })(this)
    })) : void 0);
  };

  return EditPopupComponent;

})(React.Component);
