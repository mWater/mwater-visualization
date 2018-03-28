var DropdownWidgetComponent, H, MarkdownWidget, MarkdownWidgetComponent, MarkdownWidgetDesignerComponent, MarkdownWidgetViewComponent, ModalWindowComponent, PropTypes, React, Widget, _, markdown,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

_ = require('lodash');

Widget = require('./Widget');

DropdownWidgetComponent = require('./DropdownWidgetComponent');

markdown = require("markdown").markdown;

ModalWindowComponent = require('react-library/lib/ModalWindowComponent');

module.exports = MarkdownWidget = (function(superClass) {
  extend(MarkdownWidget, superClass);

  function MarkdownWidget() {
    return MarkdownWidget.__super__.constructor.apply(this, arguments);
  }

  MarkdownWidget.prototype.createViewElement = function(options) {
    return React.createElement(MarkdownWidgetComponent, {
      design: options.design,
      onDesignChange: options.onDesignChange,
      width: options.width,
      height: options.height,
      standardWidth: options.standardWidth
    });
  };

  MarkdownWidget.prototype.isAutoHeight = function() {
    return true;
  };

  return MarkdownWidget;

})(Widget);

MarkdownWidgetComponent = (function(superClass) {
  extend(MarkdownWidgetComponent, superClass);

  MarkdownWidgetComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    width: PropTypes.number,
    height: PropTypes.number,
    standardWidth: PropTypes.number
  };

  function MarkdownWidgetComponent(props) {
    this.handleEditDesignChange = bind(this.handleEditDesignChange, this);
    this.handleEndEditing = bind(this.handleEndEditing, this);
    this.handleStartEditing = bind(this.handleStartEditing, this);
    MarkdownWidgetComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      editDesign: null
    };
  }

  MarkdownWidgetComponent.prototype.handleStartEditing = function() {
    return this.setState({
      editDesign: this.props.design
    });
  };

  MarkdownWidgetComponent.prototype.handleEndEditing = function() {
    this.props.onDesignChange(this.state.editDesign);
    return this.setState({
      editDesign: null
    });
  };

  MarkdownWidgetComponent.prototype.handleEditDesignChange = function(design) {
    return this.setState({
      editDesign: design
    });
  };

  MarkdownWidgetComponent.prototype.renderEditor = function() {
    var chart, content, editor, width;
    if (!this.state.editDesign) {
      return null;
    }
    editor = React.createElement(MarkdownWidgetDesignerComponent, {
      design: this.state.editDesign,
      onDesignChange: this.handleEditDesignChange
    });
    width = Math.min(document.body.clientWidth / 2, this.props.width);
    chart = this.renderContent(this.state.editDesign);
    content = H.div({
      style: {
        height: "100%",
        width: "100%"
      }
    }, H.div({
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        border: "solid 2px #EEE",
        borderRadius: 8,
        padding: 10,
        width: width + 20,
        height: this.props.height + 20
      }
    }, chart), H.div({
      style: {
        width: "100%",
        height: "100%",
        paddingLeft: width + 40
      }
    }, H.div({
      style: {
        width: "100%",
        height: "100%",
        overflowY: "auto",
        paddingLeft: 20,
        borderLeft: "solid 3px #AAA"
      }
    }, editor)));
    return React.createElement(ModalWindowComponent, {
      isOpen: true,
      onRequestClose: this.handleEndEditing
    }, content);
  };

  MarkdownWidgetComponent.prototype.renderContent = function(design) {
    return React.createElement(MarkdownWidgetViewComponent, {
      design: design,
      width: this.props.width,
      height: this.props.height,
      standardWidth: this.props.standardWidth
    });
  };

  MarkdownWidgetComponent.prototype.render = function() {
    var dropdownItems;
    dropdownItems = [];
    if (this.props.onDesignChange != null) {
      dropdownItems.push({
        label: "Edit",
        icon: "pencil",
        onClick: this.handleStartEditing
      });
    }
    return H.div({
      onDoubleClick: this.handleStartEditing
    }, this.props.onDesignChange != null ? this.renderEditor() : void 0, React.createElement(DropdownWidgetComponent, {
      width: this.props.width,
      height: this.props.height,
      dropdownItems: dropdownItems
    }, this.renderContent(this.props.design)));
  };

  return MarkdownWidgetComponent;

})(React.Component);

MarkdownWidgetViewComponent = (function(superClass) {
  extend(MarkdownWidgetViewComponent, superClass);

  function MarkdownWidgetViewComponent() {
    return MarkdownWidgetViewComponent.__super__.constructor.apply(this, arguments);
  }

  MarkdownWidgetViewComponent.propTypes = {
    design: PropTypes.object.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    standardWidth: PropTypes.number
  };

  MarkdownWidgetViewComponent.prototype.render = function() {
    return H.div({
      style: {
        width: this.props.standardWidth,
        height: this.props.height && this.props.standardWidth && this.props.width ? this.props.height * (this.props.standardWidth / this.props.width) : void 0,
        transform: this.props.height && this.props.standardWidth && this.props.width ? "scale(" + (this.props.width / this.props.standardWidth) + ", " + (this.props.width / this.props.standardWidth) + ")" : void 0,
        transformOrigin: this.props.height && this.props.standardWidth && this.props.width ? "0 0" : void 0
      },
      className: "mwater-visualization-markdown",
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
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired
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
      style: {
        width: "100%",
        height: "100%"
      },
      value: this.props.design.markdown,
      onChange: this.handleMarkdownChange
    });
  };

  return MarkdownWidgetDesignerComponent;

})(React.Component);
