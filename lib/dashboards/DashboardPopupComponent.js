var DashboardComponent, DashboardPopupComponent, H, ModalWindowComponent, R, React, _, ui, update,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

ModalWindowComponent = require('react-library/lib/ModalWindowComponent');

ui = require('react-library/lib/bootstrap');

update = require('react-library/lib/update');

DashboardComponent = require('./DashboardComponent');

module.exports = DashboardPopupComponent = (function(superClass) {
  extend(DashboardPopupComponent, superClass);

  DashboardPopupComponent.propTypes = {
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
    filters: React.PropTypes.arrayOf(React.PropTypes.shape({
      table: React.PropTypes.string.isRequired,
      jsonql: React.PropTypes.object.isRequired
    }))
  };

  DashboardPopupComponent.defaultProps = {
    popups: []
  };

  function DashboardPopupComponent() {
    this.handlePopupChange = bind(this.handlePopupChange, this);
    DashboardPopupComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      popupId: false,
      extraFilters: null
    };
  }

  DashboardPopupComponent.prototype.show = function(popupId, extraFilters) {
    return this.setState({
      popupId: popupId,
      extraFilters: extraFilters || []
    });
  };

  DashboardPopupComponent.prototype.handlePopupChange = function(design) {
    var popup, popupIndex, popups;
    popup = _.findWhere(this.props.popups, {
      id: this.state.popupId
    });
    popup = _.extend({}, popup, {
      design: design
    });
    popupIndex = _.findIndex(this.props.popups, {
      id: this.state.popupId
    });
    popups = this.props.popups.slice();
    popups[popupIndex] = popup;
    return this.props.onPopupsChange(popups);
  };

  DashboardPopupComponent.prototype.render = function() {
    var filters, popup;
    if (!this.state.popupId) {
      return null;
    }
    filters = (this.props.filters || []).concat(this.state.extraFilters);
    popup = _.findWhere(this.props.popups, {
      id: this.state.popupId
    });
    if (!popup) {
      return null;
    }
    return R(ModalWindowComponent, {
      onRequestClose: (function(_this) {
        return function() {
          return _this.setState({
            popupId: null
          });
        };
      })(this),
      isOpen: true
    }, R(DashboardComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      dashboardDataSource: this.props.widgetDataSource.getPopupDashboardDataSource(popup.id),
      design: popup.design,
      onDesignChange: this.props.onPopupsChange ? this.handlePopupChange : void 0,
      filters: filters,
      onSystemAction: this.props.onSystemAction,
      namedStrings: this.props.namedStrings,
      popups: this.props.popups,
      onPopupsChange: this.props.onPopupsChange
    }));
  };

  return DashboardPopupComponent;

})(React.Component);
