var ButtonToggleComponent, LinkComponent, OptionComponent, OptionListComponent, PropTypes, R, React, ReactDOM, SectionComponent, SwitchViewComponent, ToggleEditComponent, motion,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

PropTypes = require('prop-types');

React = require('react');

ReactDOM = require('react-dom');

R = React.createElement;

motion = require('react-motion');

LinkComponent = require('mwater-expressions-ui').LinkComponent;

exports.SectionComponent = SectionComponent = (function(superClass) {
  extend(SectionComponent, superClass);

  function SectionComponent() {
    return SectionComponent.__super__.constructor.apply(this, arguments);
  }

  SectionComponent.propTypes = {
    icon: PropTypes.string,
    label: PropTypes.node
  };

  SectionComponent.prototype.render = function() {
    return R('div', {
      style: {
        marginBottom: 15
      }
    }, R('label', {
      className: "text-muted"
    }, this.props.icon && this.props.icon.match(/^fa-/) ? [
      R('i', {
        className: "fa " + this.props.icon
      }), " "
    ] : void 0, this.props.icon && this.props.icon.match(/^glyphicon-/) ? [
      R('span', {
        className: "glyphicon " + this.props.icon
      }), " "
    ] : void 0, this.props.label), R('div', {
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
    items: PropTypes.array.isRequired,
    hint: PropTypes.string
  };

  OptionListComponent.prototype.render = function() {
    return R('div', null, R('div', {
      style: {
        color: "#AAA",
        fontStyle: "italic"
      },
      key: "hint"
    }, this.props.hint), R('div', {
      className: "mwater-visualization-big-options",
      key: "options"
    }, _.map(this.props.items, (function(_this) {
      return function(item, i) {
        return R(OptionComponent, {
          name: item.name,
          desc: item.desc,
          onClick: item.onClick,
          onRemove: item.onRemove,
          key: i
        });
      };
    })(this))));
  };

  return OptionListComponent;

})(React.Component);

OptionComponent = (function(superClass) {
  extend(OptionComponent, superClass);

  function OptionComponent() {
    this.handleClick = bind(this.handleClick, this);
    return OptionComponent.__super__.constructor.apply(this, arguments);
  }

  OptionComponent.propTypes = {
    name: PropTypes.string,
    desc: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    onRemove: PropTypes.func
  };

  OptionComponent.prototype.handleClick = function(ev) {
    ev.stopPropagation();
    return this.props.onRemove();
  };

  OptionComponent.prototype.render = function() {
    return R('div', {
      className: "mwater-visualization-big-option",
      onClick: this.props.onClick
    }, this.props.onRemove ? R('button', {
      type: "button",
      className: "btn btn-link btn-xs pull-right",
      onClick: this.handleClick
    }, R('span', {
      className: "glyphicon glyphicon-remove"
    })) : void 0, R('div', {
      style: {
        fontWeight: "bold"
      }
    }, this.props.name), R('div', {
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
    views: PropTypes.object.isRequired,
    viewId: PropTypes.string.isRequired
  };

  function SwitchViewComponent(props) {
    this.refCallback = bind(this.refCallback, this);
    SwitchViewComponent.__super__.constructor.call(this, props);
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
      style[id] = motion.spring((id === this.props.viewId ? 1 : 0), [332, 34]);
    }
    return R(motion.Motion, {
      style: style
    }, (function(_this) {
      return function(style) {
        var height, val;
        if (_this.state.measuring) {
          return R('div', {
            style: {
              position: "relative"
            }
          }, _.map(_.keys(_this.props.views), function(v) {
            return R('div', {
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
          return R('div', {
            style: {
              position: "relative",
              height: height
            }
          }, _.map(_.keys(_this.props.views), function(v) {
            return R('div', {
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
        return R('div', null, R('div', {
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
    forceOpen: PropTypes.bool,
    initiallyOpen: PropTypes.bool,
    label: PropTypes.node.isRequired,
    editor: PropTypes.any.isRequired,
    onRemove: PropTypes.func
  };

  function ToggleEditComponent(props) {
    this.editorRef = bind(this.editorRef, this);
    this.handleToggle = bind(this.handleToggle, this);
    this.open = bind(this.open, this);
    this.close = bind(this.close, this);
    ToggleEditComponent.__super__.constructor.call(this, props);
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
    link = R(LinkComponent, {
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
    value: PropTypes.any,
    options: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.node.isRequired,
      value: PropTypes.any
    })).isRequired,
    onChange: PropTypes.func.isRequired
  };

  ButtonToggleComponent.prototype.render = function() {
    return R('div', {
      className: "btn-group btn-group-xs"
    }, _.map(this.props.options, (function(_this) {
      return function(option, i) {
        return R('button', {
          type: "button",
          key: option.value,
          className: (option.value === _this.props.value ? "btn btn-default active" : "btn btn-default"),
          onClick: _this.props.onChange.bind(null, option.value)
        }, option.label);
      };
    })(this)));
  };

  return ButtonToggleComponent;

})(React.Component);
