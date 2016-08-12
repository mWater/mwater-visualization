var BlocksLayoutManager, DirectWidgetDataSource, EditPopupComponent, H, ModalWindowComponent, R, React, WidgetFactory, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

ModalWindowComponent = require('react-library/lib/ModalWindowComponent');

BlocksLayoutManager = require('../layouts/blocks/BlocksLayoutManager');

WidgetFactory = require('../widgets/WidgetFactory');

DirectWidgetDataSource = require('../widgets/DirectWidgetDataSource');

module.exports = EditPopupComponent = (function(superClass) {
  extend(EditPopupComponent, superClass);

  EditPopupComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired,
    table: React.PropTypes.string.isRequired
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
    }), " Remove Popup") : void 0, this.state.editing ? R(ModalWindowComponent, {
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
      onItemsChange: this.handleItemsChange,
      renderWidget: (function(_this) {
        return function(options) {
          var widget, widgetDataSource;
          widget = WidgetFactory.createWidget(options.type);
          widgetDataSource = new DirectWidgetDataSource({
            apiUrl: "https://api.mwater.co/v3/",
            widget: widget,
            design: options.design,
            schema: _this.props.schema,
            dataSource: _this.props.dataSource,
            client: null
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
            width: null,
            height: null,
            standardWidth: null,
            singleRowTable: _this.props.table
          });
        };
      })(this)
    })) : void 0);
  };

  return EditPopupComponent;

})(React.Component);
