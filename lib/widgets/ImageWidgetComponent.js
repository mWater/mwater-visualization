var AsyncLoadComponent, DropdownWidgetComponent, Dropzone, ExprComponent, H, ImageUploaderComponent, ImageWidgetComponent, ImagelistCarouselComponent, ModalPopupComponent, R, React, TabbedComponent, TableSelectComponent, _, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

_ = require('lodash');

uuid = require('node-uuid');

Dropzone = require('react-dropzone');

AsyncLoadComponent = require('react-library/lib/AsyncLoadComponent');

DropdownWidgetComponent = require('./DropdownWidgetComponent');

ModalPopupComponent = require('react-library/lib/ModalPopupComponent');

TabbedComponent = require('react-library/lib/TabbedComponent');

ExprComponent = require("mwater-expressions-ui").ExprComponent;

TableSelectComponent = require('../TableSelectComponent');

ImageUploaderComponent = require('./ImageUploaderComponent');

ImagelistCarouselComponent = require('./ImagelistCarouselComponent');

module.exports = ImageWidgetComponent = (function(superClass) {
  extend(ImageWidgetComponent, superClass);

  ImageWidgetComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func,
    filters: React.PropTypes.array,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    widgetDataSource: React.PropTypes.object.isRequired,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    singleRowTable: React.PropTypes.string
  };

  function ImageWidgetComponent(props) {
    this.handleExpressionChange = bind(this.handleExpressionChange, this);
    this.onFileUpload = bind(this.onFileUpload, this);
    this.onUrlChange = bind(this.onUrlChange, this);
    this.onCancel = bind(this.onCancel, this);
    this.onSave = bind(this.onSave, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    this.handleStartEditing = bind(this.handleStartEditing, this);
    ImageWidgetComponent.__super__.constructor.call(this, props);
    this.state = {
      data: [],
      error: null,
      editing: false,
      imageUrl: null,
      expr: null,
      table: null,
      uid: null,
      files: null,
      uploading: false,
      currentTab: "url"
    };
  }

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

  ImageWidgetComponent.prototype.setCurrentTab = function() {
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

  ImageWidgetComponent.prototype.handleStartEditing = function() {
    var ref, state;
    this.setCurrentTab();
    state = {
      editing: true,
      imageUrl: this.props.design.imageUrl,
      uid: this.props.design.uid,
      expr: this.props.design.expr,
      table: (ref = this.props.design.expr) != null ? ref.table : void 0
    };
    return this.setState(state);
  };

  ImageWidgetComponent.prototype.handleTableChange = function(table) {
    return this.setState({
      table: table
    });
  };

  ImageWidgetComponent.prototype.renderEditLink = function() {
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
    }, "Click Here to Edit"));
  };

  ImageWidgetComponent.prototype.onSave = function() {
    var updates;
    this.setState({
      editing: false
    });
    updates = {
      imageUrl: this.state.imageUrl,
      uid: this.state.uid,
      expr: this.state.expr
    };
    this.props.onDesignChange(_.extend({}, this.props.design, updates));
  };

  ImageWidgetComponent.prototype.onCancel = function() {
    this.setCurrentTab();
    return this.setState({
      editing: false,
      imageUrl: null,
      uid: null,
      expr: null,
      table: null,
      files: null,
      uploading: false
    });
  };

  ImageWidgetComponent.prototype.renderEditor = function() {
    var content, footer;
    if (!this.state.editing) {
      return null;
    }
    content = R(TabbedComponent, {
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
    });
    footer = H.div(null, H.button({
      key: "save",
      type: "button",
      className: "btn btn-primary",
      onClick: this.onSave
    }, "Save"), H.button({
      key: "cancel",
      type: "button",
      className: "btn btn-default",
      onClick: this.onCancel
    }, "Cancel"));
    return R(ModalPopupComponent, {
      header: this.props.design.url || this.props.design.expr || this.props.design.uid ? "Edit Image" : "Insert Image",
      onClose: this.handleEndEditing,
      scrollDisabled: true,
      footer: footer
    }, content);
  };

  ImageWidgetComponent.prototype.renderUrlEditor = function() {
    return H.div({
      className: "form-group"
    }, H.label(null, "URL of image"), H.input({
      type: "text",
      className: "form-control",
      value: this.state.imageUrl || "",
      onChange: this.onUrlChange
    }), H.p({
      className: "help-block"
    }, 'e.g. http://somesite.com/image.jpg'));
  };

  ImageWidgetComponent.prototype.onUrlChange = function(e) {
    return this.setState({
      imageUrl: e.target.value,
      uid: null,
      expr: null
    });
  };

  ImageWidgetComponent.prototype.renderUploadEditor = function() {
    return R(ImageUploaderComponent, {
      dataSource: this.props.dataSource,
      onUpload: this.onFileUpload,
      uid: this.props.design.uid
    });
  };

  ImageWidgetComponent.prototype.onFileUpload = function(uid) {
    return this.setState({
      imageUrl: null,
      uid: uid,
      expr: null
    });
  };

  ImageWidgetComponent.prototype.renderExpressionEditor = function() {
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

  ImageWidgetComponent.prototype.handleExpressionChange = function(expr) {
    return this.setState({
      imageUrl: null,
      uid: null,
      expr: expr
    });
  };

  ImageWidgetComponent.prototype.renderContent = function() {
    var source;
    if (this.props.design.imageUrl || this.props.design.uid) {
      source = this.props.design.imageUrl || this.props.widgetDataSource.getImageUrl(this.props.design.uid, 1024);
      return H.img({
        style: {
          maxWidth: "100%",
          maxHeight: "100%"
        },
        src: source
      });
    } else {
      return this.renderExpression();
    }
  };

  ImageWidgetComponent.prototype.renderExpression = function() {
    if (this.state.loading) {
      return H.span(null, "Loading");
    } else if (this.state.data) {
      return R(ImagelistCarouselComponent, {
        widgetDataSource: this.props.widgetDataSource,
        imagelist: this.state.data,
        height: this.props.height
      });
    }
  };

  ImageWidgetComponent.prototype.render = function() {
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
    }, this.renderEditor(), !this.props.design.imageUrl && !this.props.design.expr && !this.props.design.uid && this.props.onDesignChange ? this.renderEditLink() : H.div({
      style: {
        position: "relative",
        width: this.props.width,
        height: this.props.height,
        textAlign: "center"
      }
    }, this.renderContent()));
  };

  return ImageWidgetComponent;

})(AsyncLoadComponent);
