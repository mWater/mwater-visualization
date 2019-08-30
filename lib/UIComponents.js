"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var ButtonToggleComponent,
    LinkComponent,
    OptionComponent,
    OptionListComponent,
    PropTypes,
    R,
    React,
    ReactDOM,
    SectionComponent,
    SwitchViewComponent,
    ToggleEditComponent,
    _,
    motion,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

_ = require('lodash');
PropTypes = require('prop-types');
React = require('react');
ReactDOM = require('react-dom');
R = React.createElement;
motion = require('react-motion');
LinkComponent = require('mwater-expressions-ui').LinkComponent; // Miscellaneous ui components
// Section with a title and icon

exports.SectionComponent = SectionComponent = function () {
  var SectionComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(SectionComponent, _React$Component);

    function SectionComponent() {
      (0, _classCallCheck2["default"])(this, SectionComponent);
      return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(SectionComponent).apply(this, arguments));
    }

    (0, _createClass2["default"])(SectionComponent, [{
      key: "render",
      value: function render() {
        return R('div', {
          style: {
            marginBottom: 15
          }
        }, R('label', {
          className: "text-muted"
        }, this.props.icon && this.props.icon.match(/^fa-/) ? [R('i', {
          className: "fa ".concat(this.props.icon)
        }), " "] : void 0, this.props.icon && this.props.icon.match(/^glyphicon-/) ? [R('span', {
          className: "glyphicon ".concat(this.props.icon)
        }), " "] : void 0, this.props.label), R('div', {
          style: {
            marginLeft: 10
          }
        }, this.props.children));
      }
    }]);
    return SectionComponent;
  }(React.Component);

  ;
  SectionComponent.propTypes = {
    icon: PropTypes.string,
    label: PropTypes.node
  };
  return SectionComponent;
}.call(void 0); // List of options with a name and description each


exports.OptionListComponent = OptionListComponent = function () {
  var OptionListComponent =
  /*#__PURE__*/
  function (_React$Component2) {
    (0, _inherits2["default"])(OptionListComponent, _React$Component2);

    function OptionListComponent() {
      (0, _classCallCheck2["default"])(this, OptionListComponent);
      return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(OptionListComponent).apply(this, arguments));
    }

    (0, _createClass2["default"])(OptionListComponent, [{
      key: "render",
      value: function render() {
        return R('div', null, R('div', {
          style: {
            color: "#AAA",
            fontStyle: "italic"
          },
          key: "hint"
        }, this.props.hint), R('div', {
          className: "mwater-visualization-big-options",
          key: "options"
        }, _.map(this.props.items, function (item, i) {
          return R(OptionComponent, {
            name: item.name,
            desc: item.desc,
            modified: item.modified,
            onClick: item.onClick,
            onRemove: item.onRemove,
            key: i
          });
        })));
      }
    }]);
    return OptionListComponent;
  }(React.Component);

  ;
  OptionListComponent.propTypes = {
    items: PropTypes.array.isRequired,
    // name, desc, modified, onClick, onRemove (optional)
    hint: PropTypes.string
  };
  return OptionListComponent;
}.call(void 0);

OptionComponent = function () {
  // Single option
  var OptionComponent =
  /*#__PURE__*/
  function (_React$Component3) {
    (0, _inherits2["default"])(OptionComponent, _React$Component3);

    function OptionComponent() {
      var _this;

      (0, _classCallCheck2["default"])(this, OptionComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(OptionComponent).apply(this, arguments));
      _this.handleClick = _this.handleClick.bind((0, _assertThisInitialized2["default"])(_this));
      return _this;
    }

    (0, _createClass2["default"])(OptionComponent, [{
      key: "handleClick",
      value: function handleClick(ev) {
        boundMethodCheck(this, OptionComponent);
        ev.stopPropagation();
        return this.props.onRemove();
      }
    }, {
      key: "render",
      value: function render() {
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
      }
    }]);
    return OptionComponent;
  }(React.Component);

  ;
  OptionComponent.propTypes = {
    name: PropTypes.string,
    desc: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    onRemove: PropTypes.func // Displays X to right if present

  };
  return OptionComponent;
}.call(void 0); // Switches views smoothly


exports.SwitchViewComponent = SwitchViewComponent = function () {
  var SwitchViewComponent =
  /*#__PURE__*/
  function (_React$Component4) {
    (0, _inherits2["default"])(SwitchViewComponent, _React$Component4);

    function SwitchViewComponent(props) {
      var _this2;

      (0, _classCallCheck2["default"])(this, SwitchViewComponent);
      _this2 = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(SwitchViewComponent).call(this, props)); // Save components

      _this2.refCallback = _this2.refCallback.bind((0, _assertThisInitialized2["default"])(_this2));
      _this2.state = {
        measuring: false
      };
      return _this2;
    }

    (0, _createClass2["default"])(SwitchViewComponent, [{
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(nextProps) {
        // If view changes, measure all components
        if (nextProps.viewId !== this.props.viewId) {
          return this.setState({
            measuring: true
          });
        }
      }
    }, {
      key: "refCallback",
      value: function refCallback(id, comp) {
        boundMethodCheck(this, SwitchViewComponent);
        this.comps = this.comps || {};
        return this.comps[id] = comp;
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps, prevState) {
        var id, j, len, ref; // If measuring, get the heights to interpolate

        if (this.state.measuring) {
          this.heights = {};
          ref = _.keys(this.props.views); // Get heights

          for (j = 0, len = ref.length; j < len; j++) {
            id = ref[j];
            this.heights[id] = ReactDOM.findDOMNode(this.comps[id]).clientHeight;
          }

          return this.setState({
            measuring: false
          });
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        var id, ref, style, view; // Create the style object that has the opacity for each view

        style = {};
        ref = this.props.views;

        for (id in ref) {
          view = ref[id];
          style[id] = motion.spring(id === this.props.viewId ? 1 : 0, [332, 34 // Stiff, quick spring
          ]);
        }

        return R(motion.Motion, {
          style: style
        }, function (style) {
          var height, val; // If measuring, display all positioned at top

          if (_this3.state.measuring) {
            return R('div', {
              style: {
                position: "relative"
              }
            }, _.map(_.keys(_this3.props.views), function (v) {
              return R('div', {
                style: {
                  position: "absolute",
                  top: 0,
                  opacity: style[v]
                },
                ref: _this3.refCallback.bind(null, v),
                key: v
              }, _this3.props.views[v]);
            }));
          } // If transitioning


          if (style[_this3.props.viewId] !== 1) {
            // Calculate interpolated height
            height = 0;

            for (id in style) {
              val = style[id];
              height += val * _this3.heights[id];
            }

            return R('div', {
              style: {
                position: "relative",
                height: height
              }
            }, _.map(_.keys(_this3.props.views), function (v) {
              return R('div', {
                style: {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  opacity: style[v]
                },
                key: v
              }, _this3.props.views[v]);
            }));
          } // Just display (but wrapped to keep same component)


          return R('div', null, R('div', {
            key: _this3.props.viewId
          }, _this3.props.views[_this3.props.viewId]));
        });
      }
    }]);
    return SwitchViewComponent;
  }(React.Component);

  ;
  SwitchViewComponent.propTypes = {
    views: PropTypes.object.isRequired,
    // Map of view id to view element
    viewId: PropTypes.string.isRequired // Current view id to display

  };
  return SwitchViewComponent;
}.call(void 0); // Shows as editable link that can be clicked to open 
// Editor can be node or can be function that takes onClose function as first parameter


exports.ToggleEditComponent = ToggleEditComponent = function () {
  var ToggleEditComponent =
  /*#__PURE__*/
  function (_React$Component5) {
    (0, _inherits2["default"])(ToggleEditComponent, _React$Component5);

    function ToggleEditComponent(props) {
      var _this4;

      (0, _classCallCheck2["default"])(this, ToggleEditComponent);
      _this4 = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(ToggleEditComponent).call(this, props));
      _this4.close = _this4.close.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.open = _this4.open.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.handleToggle = _this4.handleToggle.bind((0, _assertThisInitialized2["default"])(_this4)); // Save editor comp

      _this4.editorRef = _this4.editorRef.bind((0, _assertThisInitialized2["default"])(_this4));
      _this4.state = {
        open: props.initiallyOpen || false
      };
      return _this4;
    }

    (0, _createClass2["default"])(ToggleEditComponent, [{
      key: "close",
      value: function close() {
        boundMethodCheck(this, ToggleEditComponent); // Save height of editor

        if (this.editorComp) {
          this.editorHeight = ReactDOM.findDOMNode(this.editorComp).clientHeight;
        }

        return this.setState({
          open: false
        });
      }
    }, {
      key: "open",
      value: function open() {
        boundMethodCheck(this, ToggleEditComponent);
        return this.setState({
          open: true
        });
      }
    }, {
      key: "handleToggle",
      value: function handleToggle() {
        boundMethodCheck(this, ToggleEditComponent);
        return this.setState({
          open: !this.state.open
        });
      }
    }, {
      key: "editorRef",
      value: function editorRef(editorComp) {
        boundMethodCheck(this, ToggleEditComponent);
        return this.editorComp = editorComp;
      }
    }, {
      key: "render",
      value: function render() {
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
      }
    }]);
    return ToggleEditComponent;
  }(React.Component);

  ;
  ToggleEditComponent.propTypes = {
    forceOpen: PropTypes.bool,
    initiallyOpen: PropTypes.bool,
    label: PropTypes.node.isRequired,
    editor: PropTypes.any.isRequired,
    onRemove: PropTypes.func
  };
  return ToggleEditComponent;
}.call(void 0); // Switch between several values as a series of radio buttons


exports.ButtonToggleComponent = ButtonToggleComponent = function () {
  var ButtonToggleComponent =
  /*#__PURE__*/
  function (_React$Component6) {
    (0, _inherits2["default"])(ButtonToggleComponent, _React$Component6);

    function ButtonToggleComponent() {
      (0, _classCallCheck2["default"])(this, ButtonToggleComponent);
      return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(ButtonToggleComponent).apply(this, arguments));
    }

    (0, _createClass2["default"])(ButtonToggleComponent, [{
      key: "render",
      value: function render() {
        var _this5 = this;

        return R('div', {
          className: "btn-group btn-group-xs"
        }, _.map(this.props.options, function (option, i) {
          return R('button', {
            type: "button",
            key: option.value,
            className: option.value === _this5.props.value ? "btn btn-default active" : "btn btn-default",
            onClick: _this5.props.onChange.bind(null, option.value)
          }, option.label);
        }));
      }
    }]);
    return ButtonToggleComponent;
  }(React.Component);

  ;
  ButtonToggleComponent.propTypes = {
    value: PropTypes.any,
    options: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.node.isRequired,
      value: PropTypes.any
    })).isRequired,
    // List of layers
    onChange: PropTypes.func.isRequired // Called with value

  };
  return ButtonToggleComponent;
}.call(void 0);