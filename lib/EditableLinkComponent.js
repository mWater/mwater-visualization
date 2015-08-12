var EditableLinkComponent, H, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

module.exports = EditableLinkComponent = (function(superClass) {
  extend(EditableLinkComponent, superClass);

  function EditableLinkComponent() {
    this.renderDropdownItem = bind(this.renderDropdownItem, this);
    return EditableLinkComponent.__super__.constructor.apply(this, arguments);
  }

  EditableLinkComponent.propTypes = {
    onClick: React.PropTypes.func,
    onRemove: React.PropTypes.func,
    dropdownItems: React.PropTypes.array,
    onDropdownItemClicked: React.PropTypes.func
  };

  EditableLinkComponent.prototype.renderRemove = function() {
    if (this.props.onRemove) {
      return H.span({
        className: "editable-link-remove",
        onClick: this.props.onRemove
      }, H.span({
        className: "glyphicon glyphicon-remove"
      }));
    }
  };

  EditableLinkComponent.prototype.renderDropdownItem = function(item) {
    var id, key, name;
    id = item.id || item.value;
    name = item.name || item.label;
    if (name == null) {
      return H.li({
        className: "divider"
      });
    }
    key = id;
    if (!_.isString(key)) {
      key = JSON.stringify(key);
    }
    return H.li({
      key: key
    }, H.a({
      key: id,
      onClick: this.props.onDropdownItemClicked.bind(null, id)
    }, name));
  };

  EditableLinkComponent.prototype.render = function() {
    var elem;
    elem = H.div({
      className: "editable-link",
      "data-toggle": "dropdown"
    }, H.div({
      style: {
        display: "inline-block"
      },
      onClick: this.props.onClick
    }, this.props.children), this.renderRemove());
    if (this.props.dropdownItems) {
      return H.div({
        className: "dropdown",
        style: {
          display: "inline-block"
        }
      }, elem, H.ul({
        className: "dropdown-menu",
        style: {
          cursor: "pointer"
        }
      }, _.map(this.props.dropdownItems, this.renderDropdownItem)));
    } else {
      return elem;
    }
  };

  return EditableLinkComponent;

})(React.Component);
