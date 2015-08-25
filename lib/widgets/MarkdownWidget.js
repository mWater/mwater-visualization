var H, MarkdownWidget, MarkdownWidgetComponent, MarkdownWidgetDesignerComponent, MarkdownWidgetViewComponent, React, SimpleWidgetComponent, Widget, _, markdown,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

React = require('react');

H = React.DOM;

_ = require('lodash');

Widget = require('./Widget');

SimpleWidgetComponent = require('./SimpleWidgetComponent');

markdown = require("markdown").markdown;

module.exports = MarkdownWidget = (function(superClass) {
  extend(MarkdownWidget, superClass);

  function MarkdownWidget(design) {
    this.design = design;
  }

  MarkdownWidget.prototype.createViewElement = function(options) {
    return React.createElement(MarkdownWidgetComponent, {
      design: this.design,
      onDesignChange: options.onDesignChange,
      onRemove: options.onRemove
    });
  };

  return MarkdownWidget;

})(Widget);

MarkdownWidgetComponent = (function(superClass) {
  extend(MarkdownWidgetComponent, superClass);

  function MarkdownWidgetComponent() {
    this.handleStartEditing = bind(this.handleStartEditing, this);
    return MarkdownWidgetComponent.__super__.constructor.apply(this, arguments);
  }

  MarkdownWidgetComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func,
    width: React.PropTypes.number,
    height: React.PropTypes.number
  };

  MarkdownWidgetComponent.prototype.handleStartEditing = function() {
    return this.refs.simpleWidget.displayEditor();
  };

  MarkdownWidgetComponent.prototype.render = function() {
    var dropdownItems, editor;
    dropdownItems = [
      {
        label: "Edit",
        icon: "pencil",
        onClick: this.handleStartEditing
      }, {
        label: [
          H.span({
            className: "glyphicon glyphicon-remove"
          }), " Remove"
        ],
        onClick: this.props.onRemove
      }
    ];
    editor = React.createElement(MarkdownWidgetDesignerComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    });
    return H.div({
      onDoubleClick: this.handleStartEditing
    }, React.createElement(SimpleWidgetComponent, {
      ref: "simpleWidget",
      editor: editor,
      width: this.props.width,
      height: this.props.height,
      connectMoveHandle: this.props.connectMoveHandle,
      connectResizeHandle: this.props.connectResizeHandle,
      dropdownItems: dropdownItems
    }, React.createElement(MarkdownWidgetViewComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    })));
  };

  return MarkdownWidgetComponent;

})(React.Component);

MarkdownWidgetViewComponent = (function(superClass) {
  extend(MarkdownWidgetViewComponent, superClass);

  function MarkdownWidgetViewComponent() {
    return MarkdownWidgetViewComponent.__super__.constructor.apply(this, arguments);
  }

  MarkdownWidgetViewComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    width: React.PropTypes.number,
    height: React.PropTypes.number
  };

  MarkdownWidgetViewComponent.prototype.render = function() {
    return H.div({
      dangerouslySetInnerHTML: {
        __html: markdown.toHTML(this.props.design.markdown || "")
      }
    });
  };

  return MarkdownWidgetViewComponent;

})(React.Component);

MarkdownWidgetDesignerComponent = (function(superClass) {
  extend(MarkdownWidgetDesignerComponent, superClass);

  function MarkdownWidgetDesignerComponent() {
    this.handleMarkdownChange = bind(this.handleMarkdownChange, this);
    return MarkdownWidgetDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  MarkdownWidgetDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  MarkdownWidgetDesignerComponent.prototype.handleMarkdownChange = function(ev) {
    var design;
    design = _.extend({}, this.props.design, {
      markdown: ev.target.value
    });
    return this.props.onDesignChange(design);
  };

  MarkdownWidgetDesignerComponent.prototype.render = function() {
    return H.textarea({
      className: "form-control",
      rows: 10,
      value: this.props.design.markdown,
      onChange: this.handleMarkdownChange
    });
  };

  return MarkdownWidgetDesignerComponent;

})(React.Component);
