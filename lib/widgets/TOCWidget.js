var BorderComponent, DropdownWidgetComponent, H, ModalPopupComponent, PropTypes, R, React, TOCWidget, TOCWidgetComponent, TOCWidgetDesignerComponent, TOCWidgetViewComponent, Widget, _, ui, update,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

R = React.createElement;

_ = require('lodash');

ui = require('react-library/lib/bootstrap');

update = require('react-library/lib/update');

Widget = require('./Widget');

DropdownWidgetComponent = require('./DropdownWidgetComponent');

ModalPopupComponent = require('react-library/lib/ModalPopupComponent');

module.exports = TOCWidget = (function(superClass) {
  extend(TOCWidget, superClass);

  function TOCWidget() {
    return TOCWidget.__super__.constructor.apply(this, arguments);
  }

  TOCWidget.prototype.createViewElement = function(options) {
    return R(TOCWidgetComponent, {
      design: options.design,
      onDesignChange: options.onDesignChange,
      width: options.width,
      height: options.height,
      tocEntries: options.tocEntries,
      onScrollToTOCEntry: options.onScrollToTOCEntry
    });
  };

  TOCWidget.prototype.isAutoHeight = function() {
    return true;
  };

  return TOCWidget;

})(Widget);

TOCWidgetComponent = (function(superClass) {
  extend(TOCWidgetComponent, superClass);

  TOCWidgetComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    width: PropTypes.number,
    height: PropTypes.number,
    tocEntries: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.any,
      widgetId: PropTypes.string.isRequired,
      level: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired
    })),
    onScrollToTOCEntry: PropTypes.func
  };

  function TOCWidgetComponent(props) {
    this.handleEndEditing = bind(this.handleEndEditing, this);
    this.handleStartEditing = bind(this.handleStartEditing, this);
    TOCWidgetComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      editing: false
    };
  }

  TOCWidgetComponent.prototype.handleStartEditing = function() {
    return this.setState({
      editing: true
    });
  };

  TOCWidgetComponent.prototype.handleEndEditing = function() {
    return this.setState({
      editing: false
    });
  };

  TOCWidgetComponent.prototype.renderEditor = function() {
    var editor;
    if (!this.state.editing) {
      return null;
    }
    editor = R(TOCWidgetDesignerComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    });
    return R(ModalPopupComponent, {
      showCloseX: true,
      header: "Table of Contents Options",
      onClose: this.handleEndEditing
    }, editor);
  };

  TOCWidgetComponent.prototype.renderContent = function() {
    return R(TOCWidgetViewComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      width: this.props.width,
      height: this.props.height,
      tocEntries: this.props.tocEntries,
      onScrollToTOCEntry: this.props.onScrollToTOCEntry
    });
  };

  TOCWidgetComponent.prototype.render = function() {
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
    }, this.props.onDesignChange != null ? this.renderEditor() : void 0, R(DropdownWidgetComponent, {
      width: this.props.width,
      height: this.props.height,
      dropdownItems: dropdownItems
    }, this.renderContent()));
  };

  return TOCWidgetComponent;

})(React.Component);

TOCWidgetViewComponent = (function(superClass) {
  extend(TOCWidgetViewComponent, superClass);

  function TOCWidgetViewComponent() {
    this.handleEntryClick = bind(this.handleEntryClick, this);
    return TOCWidgetViewComponent.__super__.constructor.apply(this, arguments);
  }

  TOCWidgetViewComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    width: PropTypes.number,
    height: PropTypes.number,
    tocEntries: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.any,
      widgetId: PropTypes.string.isRequired,
      level: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired
    })),
    onScrollToTOCEntry: PropTypes.func
  };

  TOCWidgetViewComponent.prototype.handleEntryClick = function(tocEntry) {
    var base;
    return typeof (base = this.props).onScrollToTOCEntry === "function" ? base.onScrollToTOCEntry(tocEntry.widgetId, tocEntry.id) : void 0;
  };

  TOCWidgetViewComponent.prototype.renderTOCEntry = function(tocEntry, index) {
    var i2, indentation, j, k, level, ref, ref1, value;
    indentation = "";
    if (this.props.design.numbering) {
      for (level = j = 1, ref = tocEntry.level; 1 <= ref ? j <= ref : j >= ref; level = 1 <= ref ? ++j : --j) {
        value = 0;
        for (i2 = k = 0, ref1 = index; 0 <= ref1 ? k <= ref1 : k >= ref1; i2 = 0 <= ref1 ? ++k : --k) {
          if (this.props.tocEntries[i2].level === level) {
            value += 1;
          } else if (this.props.tocEntries[i2].level < level) {
            value = 0;
          }
        }
        indentation += value + ".";
      }
      indentation += " ";
    }
    return H.div({
      key: index,
      style: {
        paddingLeft: tocEntry.level * 8 - 8
      }
    }, H.a({
      onClick: this.handleEntryClick.bind(null, tocEntry),
      style: {
        cursor: "pointer"
      }
    }, indentation, H.span(null, tocEntry.text)));
  };

  TOCWidgetViewComponent.prototype.render = function() {
    var border;
    border = (function() {
      switch (this.props.design.borderWeight) {
        case 0:
          return "none";
        case 1:
          return "solid 1px #f4f4f4";
        case 2:
          return "solid 1px #ccc";
        case 3:
          return "solid 1px #888";
      }
    }).call(this);
    return H.div({
      style: {
        width: this.props.standardWidth,
        height: this.props.height,
        border: border,
        padding: 5
      }
    }, H.div({
      style: {
        fontWeight: "bold"
      }
    }, this.props.design.header), _.map(this.props.tocEntries, (function(_this) {
      return function(tocEntry, i) {
        return _this.renderTOCEntry(tocEntry, i);
      };
    })(this)), this.props.onDesignChange && this.props.tocEntries.length === 0 ? H.div({
      className: "text-muted"
    }, "Table of Contents will appear here as text blocks with headings are added to the dashboard") : void 0);
  };

  return TOCWidgetViewComponent;

})(React.Component);

TOCWidgetDesignerComponent = (function(superClass) {
  extend(TOCWidgetDesignerComponent, superClass);

  function TOCWidgetDesignerComponent() {
    this.handleMarkdownChange = bind(this.handleMarkdownChange, this);
    this.update = bind(this.update, this);
    return TOCWidgetDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  TOCWidgetDesignerComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired
  };

  TOCWidgetDesignerComponent.prototype.update = function() {
    return update(this.props.design, this.props.onDesignChange, arguments);
  };

  TOCWidgetDesignerComponent.prototype.handleMarkdownChange = function(ev) {
    var design;
    design = _.extend({}, this.props.design, {
      markdown: ev.target.value
    });
    return this.props.onDesignChange(design);
  };

  TOCWidgetDesignerComponent.prototype.render = function() {
    return H.div(null, R(ui.FormGroup, {
      label: "Header"
    }, R(ui.TextInput, {
      value: this.props.design.header || "",
      onChange: this.update("header"),
      placeholder: "None"
    })), R(ui.FormGroup, {
      label: "Border"
    }, R(BorderComponent, {
      value: this.props.design.borderWeight || 0,
      onChange: this.update("borderWeight")
    })), R(ui.FormGroup, {
      label: "Numbering"
    }, R(ui.Radio, {
      inline: true,
      value: this.props.design.numbering || false,
      radioValue: true,
      onChange: this.update("numbering")
    }, "On"), R(ui.Radio, {
      inline: true,
      value: this.props.design.numbering || false,
      radioValue: false,
      onChange: this.update("numbering")
    }, "Off")));
  };

  return TOCWidgetDesignerComponent;

})(React.Component);

BorderComponent = (function(superClass) {
  extend(BorderComponent, superClass);

  function BorderComponent() {
    return BorderComponent.__super__.constructor.apply(this, arguments);
  }

  BorderComponent.propTypes = {
    value: PropTypes.number,
    defaultValue: PropTypes.number,
    onChange: PropTypes.func.isRequired
  };

  BorderComponent.prototype.render = function() {
    var value;
    value = this.props.value != null ? this.props.value : this.props.defaultValue;
    return H.div(null, R(ui.Radio, {
      inline: true,
      value: value,
      radioValue: 0,
      onChange: this.props.onChange
    }, "None"), R(ui.Radio, {
      inline: true,
      value: value,
      radioValue: 1,
      onChange: this.props.onChange
    }, "Light"), R(ui.Radio, {
      inline: true,
      value: value,
      radioValue: 2,
      onChange: this.props.onChange
    }, "Medium"), R(ui.Radio, {
      inline: true,
      value: value,
      radioValue: 3,
      onChange: this.props.onChange
    }, "Heavy"));
  };

  return BorderComponent;

})(React.Component);
