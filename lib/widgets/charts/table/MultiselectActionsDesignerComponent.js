var H, MultiselectActionsDesignerComponent, R, React, _, ui,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

ui = require('react-library/lib/bootstrap');

module.exports = MultiselectActionsDesignerComponent = (function(superClass) {
  extend(MultiselectActionsDesignerComponent, superClass);

  function MultiselectActionsDesignerComponent() {
    this.handleActionLabelChange = bind(this.handleActionLabelChange, this);
    this.handleActionChange = bind(this.handleActionChange, this);
    return MultiselectActionsDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  MultiselectActionsDesignerComponent.propTypes = {
    availableActions: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
      name: React.PropTypes.string.isRequired
    })).isRequired,
    multiselectActions: React.PropTypes.arrayOf(React.PropTypes.shape({
      action: React.PropTypes.string.isRequired,
      label: React.PropTypes.string.isRequired
    })),
    onMultiselectActionsChange: React.PropTypes.func.isRequired
  };

  MultiselectActionsDesignerComponent.prototype.handleActionChange = function(action, value) {
    var multiselectActions;
    multiselectActions = (this.props.multiselectActions || []).slice();
    if (value) {
      multiselectActions.push({
        action: action.id,
        label: action.name
      });
    } else {
      multiselectActions = _.filter(multiselectActions, function(ma) {
        return ma.action !== action.id;
      });
    }
    return this.props.onMultiselectActionsChange(multiselectActions);
  };

  MultiselectActionsDesignerComponent.prototype.handleActionLabelChange = function(multiselectAction, label) {
    var i, len, ma, multiselectActions;
    multiselectActions = _.cloneDeep(this.props.multiselectActions || []);
    for (i = 0, len = multiselectActions.length; i < len; i++) {
      ma = multiselectActions[i];
      if (ma.action === multiselectAction.action) {
        ma.label = label;
      }
    }
    return this.props.onMultiselectActionsChange(multiselectActions);
  };

  MultiselectActionsDesignerComponent.prototype.renderAction = function(action) {
    var multiselectAction;
    multiselectAction = _.findWhere(this.props.multiselectActions, {
      action: action.id
    });
    return H.div({
      key: action.id
    }, R(ui.Checkbox, {
      value: multiselectAction != null,
      onChange: this.handleActionChange.bind(null, action)
    }, action.name, multiselectAction ? R(ui.TextInput, {
      size: "sm",
      value: multiselectAction.label,
      onChange: this.handleActionLabelChange.bind(null, multiselectAction)
    }) : void 0));
  };

  MultiselectActionsDesignerComponent.prototype.render = function() {
    return H.div(null, _.map(this.props.availableActions, (function(_this) {
      return function(action) {
        return _this.renderAction(action);
      };
    })(this)));
  };

  return MultiselectActionsDesignerComponent;

})(React.Component);
