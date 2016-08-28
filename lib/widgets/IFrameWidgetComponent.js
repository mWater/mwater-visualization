var DropdownWidgetComponent, H, IFrameWidgetComponent, ModalPopupComponent, R, React, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

_ = require('lodash');

DropdownWidgetComponent = require('./DropdownWidgetComponent');

ModalPopupComponent = require('react-library/lib/ModalPopupComponent');

module.exports = IFrameWidgetComponent = (function(superClass) {
  extend(IFrameWidgetComponent, superClass);

  IFrameWidgetComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func,
    width: React.PropTypes.number,
    height: React.PropTypes.number
  };

  function IFrameWidgetComponent(props) {
    this.handleEndEditing = bind(this.handleEndEditing, this);
    this.handleStartEditing = bind(this.handleStartEditing, this);
    IFrameWidgetComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      editing: false,
      editUrl: null
    };
  }

  IFrameWidgetComponent.prototype.handleStartEditing = function() {
    return this.setState({
      editing: true,
      editUrl: this.props.design.url
    });
  };

  IFrameWidgetComponent.prototype.handleEndEditing = function() {
    this.setState({
      editing: false
    });
    return this.props.onDesignChange(_.extend({}, this.props.design, {
      url: this.state.editUrl
    }));
  };

  IFrameWidgetComponent.prototype.renderEditor = function() {
    var content;
    if (!this.state.editing) {
      return null;
    }
    content = H.div({
      className: "form-group"
    }, H.label(null, "URL to embed"), H.input({
      type: "text",
      className: "form-control",
      value: this.state.editUrl || "",
      onChange: (function(_this) {
        return function(ev) {
          return _this.setState({
            editUrl: ev.target.value
          });
        };
      })(this)
    }), H.p({
      className: "help-block"
    }, 'e.g. https://www.youtube.com/embed/dQw4w9WgXcQ'));
    return R(ModalPopupComponent, {
      header: "Configure",
      showCloseX: true,
      onClose: this.handleEndEditing
    }, content);
  };

  IFrameWidgetComponent.prototype.renderEditLink = function() {
    return H.div({
      style: {
        position: "absolute",
        bottom: this.props.height / 2,
        left: 0,
        right: 0,
        textAlign: "center"
      }
    }, H.a({
      className: "btn btn-link",
      onClick: this.handleStartEditing
    }, "Click Here to Configure"));
  };

  IFrameWidgetComponent.prototype.render = function() {
    var dropdownItems;
    dropdownItems = [];
    if (this.props.onDesignChange != null) {
      dropdownItems.push({
        label: "Edit",
        icon: "pencil",
        onClick: this.handleStartEditing
      });
    }
    return R(DropdownWidgetComponent, {
      width: this.props.width,
      height: this.props.height,
      dropdownItems: dropdownItems
    }, this.renderEditor(), this.props.design.url ? H.iframe({
      src: this.props.design.url,
      width: this.props.width,
      height: this.props.height,
      frameborder: 0,
      allowfullscreen: true
    }) : this.props.onDesignChange != null ? this.renderEditLink() : void 0);
  };

  return IFrameWidgetComponent;

})(React.Component);
