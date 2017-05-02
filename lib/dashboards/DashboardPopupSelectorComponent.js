var DashboardPopupComponent, DashboardPopupSelectorComponent, H, R, React, _, ui, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

uuid = require('uuid');

ui = require('react-library/lib/bootstrap');

DashboardPopupComponent = require('./DashboardPopupComponent');

module.exports = DashboardPopupSelectorComponent = (function(superClass) {
  extend(DashboardPopupSelectorComponent, superClass);

  function DashboardPopupSelectorComponent() {
    this.handleRemovePopup = bind(this.handleRemovePopup, this);
    this.handleEditPopup = bind(this.handleEditPopup, this);
    this.handleAddPopup = bind(this.handleAddPopup, this);
    return DashboardPopupSelectorComponent.__super__.constructor.apply(this, arguments);
  }

  DashboardPopupSelectorComponent.propTypes = {
    popups: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
      design: React.PropTypes.object.isRequired
    })).isRequired,
    onPopupsChange: React.PropTypes.func,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    widgetDataSource: React.PropTypes.object.isRequired,
    onSystemAction: React.PropTypes.func,
    namedStrings: React.PropTypes.object,
    getSystemActions: React.PropTypes.func,
    filters: React.PropTypes.arrayOf(React.PropTypes.shape({
      table: React.PropTypes.string.isRequired,
      jsonql: React.PropTypes.object.isRequired
    })),
    popupId: React.PropTypes.string,
    onPopupIdChange: React.PropTypes.func.isRequired
  };

  DashboardPopupSelectorComponent.prototype.handleAddPopup = function() {
    var popup, popups;
    popup = {
      id: uuid(),
      design: {
        items: {
          id: "root",
          type: "root",
          blocks: []
        },
        layout: "blocks"
      }
    };
    popups = (this.props.popups || []).slice();
    popups.push(popup);
    this.props.onPopupsChange(popups);
    this.props.onPopupIdChange(popup.id);
    return this.dashboardPopupComponent.show(popup.id);
  };

  DashboardPopupSelectorComponent.prototype.handleEditPopup = function() {
    var popup;
    popup = _.findWhere(this.props.popups, {
      id: this.props.popupId
    });
    if (!popup) {
      return;
    }
    return this.dashboardPopupComponent.show(popup.id);
  };

  DashboardPopupSelectorComponent.prototype.handleRemovePopup = function() {
    var popups;
    popups = _.filter(this.props.popups, (function(_this) {
      return function(popup) {
        return popup.id !== _this.props.popupId;
      };
    })(this));
    this.props.onPopupsChange(popups);
    return this.props.onPopupIdChange(null);
  };

  DashboardPopupSelectorComponent.prototype.render = function() {
    return H.div(null, R(DashboardPopupComponent, {
      ref: (function(_this) {
        return function(c) {
          return _this.dashboardPopupComponent = c;
        };
      })(this),
      popups: this.props.popups,
      onPopupsChange: this.props.onPopupsChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      widgetDataSource: this.props.widgetDataSource,
      onSystemAction: this.props.onSystemAction,
      getSystemActions: this.props.getSystemActions,
      namedStrings: this.props.namedStrings,
      filters: this.props.filters
    }), !this.props.popupId ? H.a({
      className: "btn btn-link",
      onClick: this.handleAddPopup
    }, H.i({
      className: "fa fa-pencil"
    }), " Design Popup") : H.div(null, H.a({
      className: "btn btn-link",
      onClick: this.handleEditPopup
    }, H.i({
      className: "fa fa-pencil"
    }), " Customize Popup"), H.a({
      className: "btn btn-link",
      onClick: this.handleRemovePopup
    }, H.i({
      className: "fa fa-times"
    }), " Remove Popup")));
  };

  return DashboardPopupSelectorComponent;

})(React.Component);
