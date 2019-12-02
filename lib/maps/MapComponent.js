"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var AutoSizeComponent,
    MapComponent,
    MapControlComponent,
    MapDesignerComponent,
    MapViewComponent,
    PopoverHelpComponent,
    PropTypes,
    R,
    React,
    UndoStack,
    _,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
MapViewComponent = require('./MapViewComponent');
MapDesignerComponent = require('./MapDesignerComponent');
MapControlComponent = require('./MapControlComponent');
AutoSizeComponent = require('react-library/lib/AutoSizeComponent');
UndoStack = require('../UndoStack');
PopoverHelpComponent = require('react-library/lib/PopoverHelpComponent'); // Map with designer on right

module.exports = MapComponent = function () {
  var MapComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(MapComponent, _React$Component);

    function MapComponent(props) {
      var _this;

      (0, _classCallCheck2["default"])(this, MapComponent);
      _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(MapComponent).call(this, props));
      _this.handleUndo = _this.handleUndo.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleRedo = _this.handleRedo.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleZoomLockClick = _this.handleZoomLockClick.bind((0, _assertThisInitialized2["default"])(_this));
      _this.handleDesignChange = _this.handleDesignChange.bind((0, _assertThisInitialized2["default"])(_this));
      _this.refMapView = _this.refMapView.bind((0, _assertThisInitialized2["default"])(_this));
      _this.state = {
        undoStack: new UndoStack().push(props.design),
        transientDesign: props.design,
        // Temporary design for read-only maps
        zoomLocked: true
      };
      return _this;
    }

    (0, _createClass2["default"])(MapComponent, [{
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(nextProps) {
        // Save on stack
        this.setState({
          undoStack: this.state.undoStack.push(nextProps.design)
        });

        if (!_.isEqual(nextProps.design, this.props.design)) {
          return this.setState({
            transientDesign: nextProps.design
          });
        }
      }
    }, {
      key: "handleUndo",
      value: function handleUndo() {
        var _this2 = this;

        var undoStack;
        boundMethodCheck(this, MapComponent);
        undoStack = this.state.undoStack.undo(); // We need to use callback as state is applied later

        return this.setState({
          undoStack: undoStack
        }, function () {
          return _this2.props.onDesignChange(undoStack.getValue());
        });
      }
    }, {
      key: "handleRedo",
      value: function handleRedo() {
        var _this3 = this;

        var undoStack;
        boundMethodCheck(this, MapComponent);
        undoStack = this.state.undoStack.redo(); // We need to use callback as state is applied later

        return this.setState({
          undoStack: undoStack
        }, function () {
          return _this3.props.onDesignChange(undoStack.getValue());
        });
      } // Gets the current design, whether prop or transient

    }, {
      key: "getDesign",
      value: function getDesign() {
        return this.state.transientDesign || this.props.design;
      }
    }, {
      key: "handleZoomLockClick",
      value: function handleZoomLockClick() {
        boundMethodCheck(this, MapComponent);
        return this.setState({
          zoomLocked: !this.state.zoomLocked
        });
      }
    }, {
      key: "renderActionLinks",
      value: function renderActionLinks() {
        return R('div', null, this.props.onDesignChange != null ? [R('a', {
          key: "lock",
          className: "btn btn-link btn-sm",
          onClick: this.handleZoomLockClick
        }, R('span', {
          className: "fa ".concat(this.state.zoomLocked ? "fa-lock red" : "fa-unlock green"),
          style: {
            marginRight: 5
          }
        }), R(PopoverHelpComponent, {
          placement: "bottom"
        }, 'Changes to zoom level wont be saved in locked mode')), R('a', {
          key: "undo",
          className: "btn btn-link btn-sm ".concat(!this.state.undoStack.canUndo() ? "disabled" : ""),
          onClick: this.handleUndo
        }, R('span', {
          className: "glyphicon glyphicon-triangle-left"
        }), " Undo"), " ", R('a', {
          key: "redo",
          className: "btn btn-link btn-sm ".concat(!this.state.undoStack.canRedo() ? "disabled" : ""),
          onClick: this.handleRedo
        }, R('span', {
          className: "glyphicon glyphicon-triangle-right"
        }), " Redo")] : void 0, this.props.extraTitleButtonsElem);
      }
    }, {
      key: "renderHeader",
      value: function renderHeader() {
        return R('div', {
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 40,
            padding: 4,
            borderBottom: "solid 2px #AAA"
          }
        }, R('div', {
          style: {
            "float": "right"
          }
        }, this.renderActionLinks()), this.props.titleElem);
      }
    }, {
      key: "handleDesignChange",
      value: function handleDesignChange(design) {
        boundMethodCheck(this, MapComponent);

        if (this.props.onDesignChange) {
          return this.props.onDesignChange(design);
        } else {
          return this.setState({
            transientDesign: design
          });
        }
      }
    }, {
      key: "getDesign",
      value: function getDesign() {
        if (this.props.onDesignChange) {
          return this.props.design;
        } else {
          return this.state.transientDesign;
        }
      }
    }, {
      key: "refMapView",
      value: function refMapView(el) {
        boundMethodCheck(this, MapComponent);
        return this.mapView = el;
      }
    }, {
      key: "renderView",
      value: function renderView() {
        return React.createElement(AutoSizeComponent, {
          injectWidth: true,
          injectHeight: true
        }, React.createElement(MapViewComponent, {
          ref: this.refMapView,
          mapDataSource: this.props.mapDataSource,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          design: this.getDesign(),
          onDesignChange: this.handleDesignChange,
          zoomLocked: this.state.zoomLocked,
          onRowClick: this.props.onRowClick,
          extraFilters: this.props.extraFilters
        }));
      }
    }, {
      key: "renderDesigner",
      value: function renderDesigner() {
        if (this.props.onDesignChange) {
          return React.createElement(MapDesignerComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            design: this.getDesign(),
            onDesignChange: this.handleDesignChange
          });
        } else {
          return React.createElement(MapControlComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            design: this.getDesign(),
            onDesignChange: this.handleDesignChange
          });
        }
      }
    }, {
      key: "render",
      value: function render() {
        return R('div', {
          style: {
            width: "100%",
            height: "100%",
            position: "relative"
          }
        }, R('div', {
          style: {
            position: "absolute",
            width: "70%",
            height: "100%",
            paddingTop: 40
          }
        }, this.renderHeader(), R('div', {
          style: {
            width: "100%",
            height: "100%"
          }
        }, this.renderView())), R('div', {
          style: {
            position: "absolute",
            left: "70%",
            width: "30%",
            height: "100%",
            borderLeft: "solid 3px #AAA",
            overflowY: "auto"
          }
        }, this.renderDesigner()));
      }
    }]);
    return MapComponent;
  }(React.Component);

  ;
  MapComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    // Data source to use
    // Data source for the map
    mapDataSource: PropTypes.shape({
      // Gets the data source for a layer
      getLayerDataSource: PropTypes.func.isRequired
    }).isRequired,
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    // Null/undefined for readonly
    onRowClick: PropTypes.func,
    // Called with (tableId, rowId) when item is clicked
    extraFilters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired,
      jsonql: PropTypes.object.isRequired // Extra filters to apply to view

    })),
    titleElem: PropTypes.node,
    // Extra element to include in title at left
    extraTitleButtonsElem: PropTypes.node // Extra elements to add to right

  };
  return MapComponent;
}.call(void 0);