var AsyncLoadComponent, AutoSizeComponent, DropdownWidgetComponent, Dropzone, ExprComponent, H, ImageUploaderComponent, ImageWidgetComponent, ImageWidgetDesignComponent, ImagelistCarouselComponent, ModalPopupComponent, PropTypes, R, React, RotatedImageComponent, TabbedComponent, TableSelectComponent, _, classNames, ui, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

R = React.createElement;

_ = require('lodash');

classNames = require('classnames');

ui = require('react-library/lib/bootstrap');

uuid = require('uuid');

Dropzone = require('react-dropzone');

AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent');

AutoSizeComponent = require('react-library/lib/AutoSizeComponent');

DropdownWidgetComponent = require('./DropdownWidgetComponent');

ModalPopupComponent = require('react-library/lib/ModalPopupComponent');

TabbedComponent = require('react-library/lib/TabbedComponent');

ExprComponent = require("mwater-expressions-ui").ExprComponent;

TableSelectComponent = require('../TableSelectComponent');

ImageUploaderComponent = require('./ImageUploaderComponent');

ImagelistCarouselComponent = require('./ImagelistCarouselComponent');

module.exports = ImageWidgetComponent = (function(superClass) {
  extend(ImageWidgetComponent, superClass);

  function ImageWidgetComponent() {
    this.handleStartEditing = bind(this.handleStartEditing, this);
    return ImageWidgetComponent.__super__.constructor.apply(this, arguments);
  }

  ImageWidgetComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    filters: PropTypes.array,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    widgetDataSource: PropTypes.object.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    singleRowTable: PropTypes.string
  };

  ImageWidgetComponent.prototype.isLoadNeeded = function(newProps, oldProps) {
    return newProps.design.expr && (!_.isEqual(newProps.design.expr, oldProps.design.expr) || !_.isEqual(newProps.filters, oldProps.filters));
  };

  ImageWidgetComponent.prototype.load = function(props, prevProps, callback) {
    return props.widgetDataSource.getData(props.design, props.filters, (function(_this) {
      return function(error, data) {
        return callback({
          error: error,
          data: data
        });
      };
    })(this));
  };

  ImageWidgetComponent.prototype.handleStartEditing = function() {
    return this.refs.editor.edit();
  };

  ImageWidgetComponent.prototype.renderEditLink = function() {
    return H.div({
      className: "mwater-visualization-widget-placeholder",
      onClick: this.handleStartEditing
    }, H.i({
      className: "icon fa fa-image"
    }));
  };

  ImageWidgetComponent.prototype.renderEditor = function() {
    return R(ImageWidgetDesignComponent, {
      ref: "editor",
      key: "editor",
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource
    });
  };

  ImageWidgetComponent.prototype.renderExpression = function() {
    if (this.state.loading) {
      return H.span(null, "Loading");
    } else if (this.state.data) {
      if (!_.isArray(this.state.data)) {
        return R(AutoSizeComponent, {
          injectHeight: true
        }, (function(_this) {
          return function(size) {
            return R(ImagelistCarouselComponent, {
              widgetDataSource: _this.props.widgetDataSource,
              imagelist: [_this.state.data],
              height: size.height
            });
          };
        })(this));
      } else {
        return R(AutoSizeComponent, {
          injectHeight: true
        }, (function(_this) {
          return function(size) {
            return R(ImagelistCarouselComponent, {
              widgetDataSource: _this.props.widgetDataSource,
              imagelist: _this.state.data,
              height: size.height
            });
          };
        })(this));
      }
    }
  };

  ImageWidgetComponent.prototype.renderContent = function() {
    var imageHeight, source;
    if (this.props.design.imageUrl || this.props.design.uid) {
      imageHeight = null;
      if (this.props.height <= 160) {
        imageHeight = 160;
      } else if (this.props.height <= 320) {
        imageHeight = 320;
      } else if (this.props.height <= 640) {
        imageHeight = 640;
      } else if (this.props.height <= 1280) {
        imageHeight = 1280;
      }
      source = this.props.design.imageUrl || this.props.widgetDataSource.getImageUrl(this.props.design.uid, imageHeight);
      return R(RotatedImageComponent, {
        url: source,
        rotation: this.props.design.rotation
      });
    } else {
      return this.renderExpression();
    }
  };

  ImageWidgetComponent.prototype.render = function() {
    var captionPosition, dropdownItems;
    dropdownItems = [];
    if (this.props.onDesignChange != null) {
      dropdownItems.push({
        label: "Edit",
        icon: "pencil",
        onClick: this.handleStartEditing
      });
    }
    captionPosition = this.props.design.captionPosition || "bottom";
    return R(DropdownWidgetComponent, {
      width: this.props.width,
      height: this.props.height,
      dropdownItems: dropdownItems
    }, this.renderEditor(), !this.props.design.imageUrl && !this.props.design.expr && !this.props.design.uid && this.props.onDesignChange ? this.renderEditLink() : H.div({
      className: "mwater-visualization-image-widget",
      style: {
        position: "relative",
        width: this.props.width,
        height: this.props.height
      }
    }, captionPosition === "top" ? H.div({
      className: "caption"
    }, this.props.design.caption) : void 0, H.div({
      className: "image"
    }, this.renderContent()), captionPosition === "bottom" ? H.div({
      className: "caption"
    }, this.props.design.caption) : void 0));
  };

  return ImageWidgetComponent;

})(AsyncLoadComponent);

ImageWidgetDesignComponent = (function(superClass) {
  extend(ImageWidgetDesignComponent, superClass);

  ImageWidgetDesignComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired
  };

  function ImageWidgetDesignComponent(props) {
    this.handleCancel = bind(this.handleCancel, this);
    this.handleSave = bind(this.handleSave, this);
    this.handleCaptionPositionChange = bind(this.handleCaptionPositionChange, this);
    this.handleRotationChange = bind(this.handleRotationChange, this);
    this.handleCaptionChange = bind(this.handleCaptionChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    this.handleExpressionChange = bind(this.handleExpressionChange, this);
    this.handleFileUpload = bind(this.handleFileUpload, this);
    this.handleUrlChange = bind(this.handleUrlChange, this);
    this.edit = bind(this.edit, this);
    ImageWidgetDesignComponent.__super__.constructor.call(this, props);
    this.state = {
      data: null,
      error: null,
      editing: false,
      imageUrl: null,
      expr: null,
      table: null,
      uid: null,
      files: null,
      uploading: false,
      caption: null,
      currentTab: "url",
      rotation: null,
      captionPosition: null
    };
  }

  ImageWidgetDesignComponent.prototype.edit = function() {
    var ref, state;
    this.setCurrentTab();
    state = {
      editing: true,
      imageUrl: this.props.design.imageUrl,
      uid: this.props.design.uid,
      expr: this.props.design.expr,
      table: (ref = this.props.design.expr) != null ? ref.table : void 0,
      caption: this.props.design.caption,
      rotation: this.props.design.rotation,
      captionPosition: this.props.design.captionPosition
    };
    return this.setState(state);
  };

  ImageWidgetDesignComponent.prototype.setCurrentTab = function() {
    var tab;
    tab = "upload";
    if (this.props.design.url) {
      tab = "url";
    }
    if (this.props.design.expr) {
      tab = "expression";
    }
    return this.setState({
      currentTab: tab
    });
  };

  ImageWidgetDesignComponent.prototype.handleUrlChange = function(e) {
    return this.setState({
      imageUrl: e.target.value,
      uid: null,
      expr: null
    });
  };

  ImageWidgetDesignComponent.prototype.renderUploadEditor = function() {
    return H.div(null, R(ImageUploaderComponent, {
      dataSource: this.props.dataSource,
      onUpload: this.handleFileUpload,
      uid: this.props.design.uid
    }), this.renderRotation());
  };

  ImageWidgetDesignComponent.prototype.handleFileUpload = function(uid) {
    return this.setState({
      imageUrl: null,
      uid: uid,
      expr: null
    });
  };

  ImageWidgetDesignComponent.prototype.handleExpressionChange = function(expr) {
    return this.setState({
      imageUrl: null,
      uid: null,
      expr: expr
    });
  };

  ImageWidgetDesignComponent.prototype.handleTableChange = function(table) {
    return this.setState({
      table: table
    });
  };

  ImageWidgetDesignComponent.prototype.handleCaptionChange = function(ev) {
    return this.setState({
      caption: ev.target.value
    });
  };

  ImageWidgetDesignComponent.prototype.handleRotationChange = function(rotation) {
    return this.setState({
      rotation: rotation
    });
  };

  ImageWidgetDesignComponent.prototype.handleCaptionPositionChange = function(captionPosition) {
    return this.setState({
      captionPosition: captionPosition
    });
  };

  ImageWidgetDesignComponent.prototype.handleSave = function() {
    var updates;
    this.setState({
      editing: false
    });
    updates = {
      imageUrl: this.state.imageUrl,
      uid: this.state.uid,
      expr: this.state.expr,
      caption: this.state.caption,
      rotation: this.state.rotation,
      captionPosition: this.state.captionPosition
    };
    return this.props.onDesignChange(_.extend({}, this.props.design, updates));
  };

  ImageWidgetDesignComponent.prototype.handleCancel = function() {
    this.setCurrentTab();
    return this.setState({
      editing: false,
      imageUrl: null,
      uid: null,
      expr: null,
      table: null,
      files: null,
      uploading: false,
      captionPosition: null
    });
  };

  ImageWidgetDesignComponent.prototype.renderExpressionEditor = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.i({
      className: "fa fa-database"
    }), " ", "Data Source"), ": ", R(TableSelectComponent, {
      schema: this.props.schema,
      value: this.state.table,
      onChange: this.handleTableChange
    }), H.br(), this.state.table ? H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Field"), ": ", R(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.state.table,
      types: ['image', 'imagelist'],
      value: this.state.expr,
      aggrStatuses: ["individual", "literal"],
      onChange: this.handleExpressionChange
    })) : void 0);
  };

  ImageWidgetDesignComponent.prototype.renderRotation = function() {
    return H.div({
      style: {
        paddingTop: 10
      }
    }, "Rotation: ", R(ui.Radio, {
      value: this.state.rotation || null,
      radioValue: null,
      onChange: this.handleRotationChange,
      inline: true
    }, "0 degrees"), R(ui.Radio, {
      value: this.state.rotation || null,
      radioValue: 90,
      onChange: this.handleRotationChange,
      inline: true
    }, "90 degrees"), R(ui.Radio, {
      value: this.state.rotation || null,
      radioValue: 180,
      onChange: this.handleRotationChange,
      inline: true
    }, "180 degrees"), R(ui.Radio, {
      value: this.state.rotation || null,
      radioValue: 270,
      onChange: this.handleRotationChange,
      inline: true
    }, "270 degrees"));
  };

  ImageWidgetDesignComponent.prototype.renderUrlEditor = function() {
    return H.div({
      className: "form-group"
    }, H.label(null, "URL of image"), H.input({
      type: "text",
      className: "form-control",
      value: this.state.imageUrl || "",
      onChange: this.handleUrlChange
    }), H.p({
      className: "help-block"
    }, 'e.g. http://somesite.com/image.jpg'), this.renderRotation());
  };

  ImageWidgetDesignComponent.prototype.render = function() {
    var content, footer;
    if (!this.state.editing) {
      return null;
    }
    content = H.div(null, H.div({
      className: "form-group"
    }, H.label(null, "Caption"), H.input({
      type: "text",
      className: "form-control",
      value: this.state.caption || "",
      onChange: this.handleCaptionChange,
      placeholder: "Optional caption to display below image"
    })), this.state.caption ? H.div({
      className: "form-group"
    }, H.label(null, "Caption position"), R(ui.Select, {
      options: [
        {
          value: "bottom",
          label: "Bottom"
        }, {
          value: "top",
          label: "Top"
        }
      ],
      value: this.state.captionPosition,
      onChange: this.handleCaptionPositionChange
    })) : void 0, R(TabbedComponent, {
      tabs: [
        {
          id: "upload",
          label: "Upload",
          elem: this.renderUploadEditor()
        }, {
          id: "expression",
          label: "From Data",
          elem: this.renderExpressionEditor()
        }, {
          id: "url",
          label: "From URL",
          elem: this.renderUrlEditor()
        }
      ],
      initialTabId: this.state.currentTab
    }));
    footer = H.div(null, H.button({
      key: "save",
      type: "button",
      className: "btn btn-primary",
      onClick: this.handleSave
    }, "Save"), H.button({
      key: "cancel",
      type: "button",
      className: "btn btn-default",
      onClick: this.handleCancel
    }, "Cancel"));
    return R(ModalPopupComponent, {
      header: "Image",
      scrollDisabled: true,
      footer: footer
    }, content);
  };

  return ImageWidgetDesignComponent;

})(React.Component);

RotatedImageComponent = (function(superClass) {
  extend(RotatedImageComponent, superClass);

  function RotatedImageComponent() {
    return RotatedImageComponent.__super__.constructor.apply(this, arguments);
  }

  RotatedImageComponent.propTypes = {
    url: PropTypes.string.isRequired,
    rotation: PropTypes.number,
    onClick: PropTypes.func,
    caption: PropTypes.string
  };

  RotatedImageComponent.prototype.render = function() {
    return R(AutoSizeComponent, {
      injectWidth: true,
      injectHeight: true
    }, (function(_this) {
      return function(size) {
        var classes, containerStyle, imageStyle;
        imageStyle = {};
        containerStyle = {};
        classes = classNames({
          "rotated": _this.props.rotation,
          "rotate-90": _this.props.rotation && _this.props.rotation === 90,
          "rotate-180": _this.props.rotation && _this.props.rotation === 180,
          "rotate-270": _this.props.rotation && _this.props.rotation === 270
        });
        imageStyle.maxWidth = "100%";
        imageStyle.maxHeight = "100%";
        if (_this.props.rotation === 90 || _this.props.rotation === 270) {
          imageStyle.width = size.height;
        }
        return H.span({
          className: "rotated-image-container",
          style: containerStyle
        }, H.img({
          src: _this.props.url,
          style: imageStyle,
          className: classes,
          onClick: _this.props.onClick,
          alt: _this.props.caption || ""
        }));
      };
    })(this));
  };

  return RotatedImageComponent;

})(React.Component);
