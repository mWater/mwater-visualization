var ButtonToggleComponent, EditableLinkComponent, H, OptionComponent, OptionListComponent, R, React, ReactDOM, SectionComponent, SwitchViewComponent, ToggleEditComponent, motion,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

React = require('react');

ReactDOM = require('react-dom');

H = React.DOM;

R = React.createElement;

motion = require('react-motion');

EditableLinkComponent = require('./EditableLinkComponent');

exports.SectionComponent = SectionComponent = (function(superClass) {
  extend(SectionComponent, superClass);

  function SectionComponent() {
    return SectionComponent.__super__.constructor.apply(this, arguments);
  }

  SectionComponent.propTypes = {
    icon: React.PropTypes.string,
    label: React.PropTypes.node
  };

  SectionComponent.prototype.render = function() {
    return H.div({
      style: {
        marginBottom: 15
      }
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon-" + this.props.icon
    }), " ", this.props.label), H.div({
      style: {
        marginLeft: 10
      }
    }, this.props.children));
  };

  return SectionComponent;

})(React.Component);

exports.OptionListComponent = OptionListComponent = (function(superClass) {
  extend(OptionListComponent, superClass);

  function OptionListComponent() {
    return OptionListComponent.__super__.constructor.apply(this, arguments);
  }

  OptionListComponent.propTypes = {
    items: React.PropTypes.array.isRequired,
    hint: React.PropTypes.string
  };

  OptionListComponent.prototype.render = function() {
    return H.div(null, H.div({
      style: {
        color: "#AAA",
        fontStyle: "italic"
      },
      key: "hint"
    }, this.props.hint), H.div({
      className: "mwater-visualization-big-options",
      key: "options"
    }, _.map(this.props.items, (function(_this) {
      return function(item) {
        return R(OptionComponent, {
          name: item.name,
          desc: item.desc,
          onClick: item.onClick,
          key: item.name
        });
      };
    })(this))));
  };

  return OptionListComponent;

})(React.Component);

OptionComponent = (function(superClass) {
  extend(OptionComponent, superClass);

  function OptionComponent() {
    return OptionComponent.__super__.constructor.apply(this, arguments);
  }

  OptionComponent.propTypes = {
    name: React.PropTypes.string,
    desc: React.PropTypes.string,
    onClick: React.PropTypes.func.isRequired
  };

  OptionComponent.prototype.render = function() {
    return H.div({
      className: "mwater-visualization-big-option",
      onClick: this.props.onClick
    }, H.div({
      style: {
        fontWeight: "bold"
      }
    }, this.props.name), H.div({
      style: {
        color: "#888"
      }
    }, this.props.desc));
  };

  return OptionComponent;

})(React.Component);

exports.SwitchViewComponent = SwitchViewComponent = (function(superClass) {
  extend(SwitchViewComponent, superClass);

  SwitchViewComponent.propTypes = {
    views: React.PropTypes.object.isRequired,
    viewId: React.PropTypes.string.isRequired
  };

  function SwitchViewComponent(props) {
    this.refCallback = bind(this.refCallback, this);
    this.state = {
      measuring: false
    };
  }

  SwitchViewComponent.prototype.componentWillReceiveProps = function(nextProps) {
    if (nextProps.viewId !== this.props.viewId) {
      return this.setState({
        measuring: true
      });
    }
  };

  SwitchViewComponent.prototype.refCallback = function(id, comp) {
    this.comps = this.comps || {};
    return this.comps[id] = comp;
  };

  SwitchViewComponent.prototype.componentDidUpdate = function(prevProps, prevState) {
    var id, j, len, ref;
    if (this.state.measuring) {
      this.heights = {};
      ref = _.keys(this.props.views);
      for (j = 0, len = ref.length; j < len; j++) {
        id = ref[j];
        this.heights[id] = ReactDOM.findDOMNode(this.comps[id]).clientHeight;
      }
      return this.setState({
        measuring: false
      });
    }
  };

  SwitchViewComponent.prototype.render = function() {
    var id, ref, style, view;
    style = {};
    ref = this.props.views;
    for (id in ref) {
      view = ref[id];
      style[id] = motion.spring(id === this.props.viewId ? 1 : 0);
    }
    return R(motion.Motion, {
      style: style
    }, (function(_this) {
      return function(style) {
        var height, val;
        if (_this.state.measuring) {
          return H.div({
            style: {
              position: "relative"
            }
          }, _.map(_.keys(_this.props.views), function(v) {
            return H.div({
              style: {
                position: "absolute",
                top: 0,
                opacity: style[v]
              },
              ref: _this.refCallback.bind(null, v),
              key: v
            }, _this.props.views[v]);
          }));
        }
        if (style[_this.props.viewId] !== 1) {
          height = 0;
          for (id in style) {
            val = style[id];
            height += val * _this.heights[id];
          }
          return H.div({
            style: {
              position: "relative",
              height: height
            }
          }, _.map(_.keys(_this.props.views), function(v) {
            return H.div({
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                opacity: style[v]
              },
              key: v
            }, _this.props.views[v]);
          }));
        }
        return H.div(null, H.div({
          key: _this.props.viewId
        }, _this.props.views[_this.props.viewId]));
      };
    })(this));
  };

  return SwitchViewComponent;

})(React.Component);

exports.ToggleEditComponent = ToggleEditComponent = (function(superClass) {
  extend(ToggleEditComponent, superClass);

  ToggleEditComponent.propTypes = {
    forceOpen: React.PropTypes.bool,
    initiallyOpen: React.PropTypes.bool,
    label: React.PropTypes.node.isRequired,
    editor: React.PropTypes.any.isRequired,
    onRemove: React.PropTypes.func
  };

  function ToggleEditComponent(props) {
    this.editorRef = bind(this.editorRef, this);
    this.handleToggle = bind(this.handleToggle, this);
    this.open = bind(this.open, this);
    this.close = bind(this.close, this);
    this.state = {
      open: props.initiallyOpen || false
    };
  }

  ToggleEditComponent.prototype.close = function() {
    if (this.editorComp) {
      this.editorHeight = ReactDOM.findDOMNode(this.editorComp).clientHeight;
    }
    return this.setState({
      open: false
    });
  };

  ToggleEditComponent.prototype.open = function() {
    return this.setState({
      open: true
    });
  };

  ToggleEditComponent.prototype.handleToggle = function() {
    return this.setState({
      open: !this.state.open
    });
  };

  ToggleEditComponent.prototype.editorRef = function(editorComp) {
    return this.editorComp = editorComp;
  };

  ToggleEditComponent.prototype.render = function() {
    var editor, isOpen, link;
    editor = this.props.editor;
    if (_.isFunction(editor)) {
      editor = editor(this.close);
    }
    link = R(EditableLinkComponent, {
      onClick: this.open,
      onRemove: this.props.onRemove
    }, this.props.label);
    isOpen = this.state.open || this.props.forceOpen;
    return R(SwitchViewComponent, {
      views: {
        editor: editor,
        link: link
      },
      viewId: isOpen ? "editor" : "link"
    });
  };

  return ToggleEditComponent;

})(React.Component);

exports.ButtonToggleComponent = ButtonToggleComponent = (function(superClass) {
  extend(ButtonToggleComponent, superClass);

  function ButtonToggleComponent() {
    return ButtonToggleComponent.__super__.constructor.apply(this, arguments);
  }

  ButtonToggleComponent.propTypes = {
    value: React.PropTypes.any,
    options: React.PropTypes.arrayOf(React.PropTypes.shape({
      label: React.PropTypes.node.isRequired,
      value: React.PropTypes.any
    })).isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  ButtonToggleComponent.prototype.render = function() {
    return H.div({
      className: "btn-group btn-group-xs"
    }, _.map(this.props.options, (function(_this) {
      return function(option, i) {
        return H.button({
          type: "button",
          className: (option.value === _this.props.value ? "btn btn-primary active" : "btn btn-default"),
          onClick: _this.props.onChange.bind(null, option.value)
        }, option.label);
      };
    })(this)));
  };

  return ButtonToggleComponent;

})(React.Component);
