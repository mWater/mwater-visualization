var ActionCancelModalComponent, H, QuickfiltersDesignComponent, R, React, SettingsModalComponent, _, update,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

update = require('update-object');

ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent');

QuickfiltersDesignComponent = require('../quickfilter/QuickfiltersDesignComponent');

module.exports = SettingsModalComponent = (function(superClass) {
  extend(SettingsModalComponent, superClass);

  SettingsModalComponent.propTypes = {
    onDesignChange: React.PropTypes.func.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired
  };

  function SettingsModalComponent(props) {
    this.handleStyleChange = bind(this.handleStyleChange, this);
    this.handleDesignChange = bind(this.handleDesignChange, this);
    this.handleCancel = bind(this.handleCancel, this);
    this.handleSave = bind(this.handleSave, this);
    SettingsModalComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      design: null
    };
  }

  SettingsModalComponent.prototype.show = function(design) {
    return this.setState({
      design: design
    });
  };

  SettingsModalComponent.prototype.handleSave = function() {
    this.props.onDesignChange(this.state.design);
    return this.setState({
      design: null
    });
  };

  SettingsModalComponent.prototype.handleCancel = function() {
    return this.setState({
      design: null
    });
  };

  SettingsModalComponent.prototype.handleDesignChange = function(design) {
    return this.setState({
      design: design
    });
  };

  SettingsModalComponent.prototype.handleStyleChange = function(ev) {
    return this.handleDesignChange(_.extend({}, this.state.design, {
      style: ev.target.value || null
    }));
  };

  SettingsModalComponent.prototype.render = function() {
    if (!this.state.design) {
      return null;
    }
    return R(ActionCancelModalComponent, {
      size: "large",
      onCancel: this.handleCancel,
      onAction: this.handleSave
    }, R(QuickfiltersDesignComponent, {
      design: this.state.design.quickfilters,
      onDesignChange: (function(_this) {
        return function(design) {
          return _this.handleDesignChange(update(_this.state.design, {
            quickfilters: {
              $set: design
            }
          }));
        };
      })(this),
      schema: this.props.schema,
      dataSource: this.props.dataSource
    }), H.br(), H.div({
      className: "form-group"
    }, H.label(null, "Style"), H.select({
      className: "form-control",
      value: this.state.design.style || "",
      onChange: this.handleStyleChange
    }, H.option({
      key: "none",
      value: ""
    }, "Default"), H.option({
      key: "greybg",
      value: "greybg"
    }, "White on Grey"))));
  };

  return SettingsModalComponent;

})(React.Component);
