"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var $,
    PropTypes,
    R,
    React,
    TabbedComponent,
    TabbedDashboard,
    _,
    jsyaml,
    visualization,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

$ = require('jquery');
PropTypes = require('prop-types');
_ = require('lodash');
visualization = require('./index');
jsyaml = require('js-yaml');
TabbedComponent = require('react-library/lib/TabbedComponent');
React = require('react');
R = React.createElement; // Pass in:
// schemaUrl (yaml schema url)
// queryUrl (will replace {query} with query)
// loadDesignUrl (gets the current design)
// saveDesignUrl (sets the current design)
// design (initial design)
// elemId (id of to render into)

exports.loadDashboard = function (options) {
  // First get the schema 
  return $.get(options.schemaUrl, function (schemaYaml) {
    var dataSource, schema, schemaJson, widgetFactory; // Load the schema

    schema = new visualization.Schema();
    schemaJson = jsyaml.safeLoad(schemaYaml);
    schema.loadFromJSON(schemaJson); // Create the data source

    dataSource = new visualization.CachingDataSource({
      perform: function perform(query, cb) {
        var url;
        url = options.queryUrl.replace(/\{query\}/, encodeURIComponent(JSON.stringify(query)));
        return $.getJSON(url, function (rows) {
          return cb(null, rows);
        }).fail(function (xhr) {
          console.error(xhr.responseText);
          return cb(new Error(xhr.responseText));
        });
      }
    }); // Create the widget factory

    widgetFactory = new visualization.WidgetFactory({
      schema: schema,
      dataSource: dataSource
    }); // Get the design

    return $.get(options.loadDesignUrl, function (designString) {
      var design, render, updateDesign;

      if (designString) {
        design = JSON.parse(designString);
      } else {
        // Use default
        design = options.design;
      } // Convert to tabs if not already 


      if (!design.tabs) {
        design = {
          tabs: [{
            name: "Main",
            design: design
          }]
        };
      } // Called to update the design and re-render


      updateDesign = function updateDesign(newDesign) {
        design = newDesign; // Save to database

        $.post(options.saveDesignUrl, {
          userdata: JSON.stringify(design)
        });
        return render();
      }; // Render the dashboard


      render = function render() {
        var elem;
        elem = R(TabbedDashboard, {
          design: design,
          widgetFactory: widgetFactory,
          onDesignChange: updateDesign
        });
        return ReactDOM.render(elem, document.getElementById(options.elemId));
      }; // Initial render


      return render();
    });
  });
};

TabbedDashboard = function () {
  var TabbedDashboard =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(TabbedDashboard, _React$Component);

    function TabbedDashboard() {
      var _this;

      (0, _classCallCheck2.default)(this, TabbedDashboard);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(TabbedDashboard).apply(this, arguments));
      _this.handleDesignChange = _this.handleDesignChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleAddTab = _this.handleAddTab.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleRemoveTab = _this.handleRemoveTab.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.handleRenameTab = _this.handleRenameTab.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      _this.createTab = _this.createTab.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      return _this;
    }

    (0, _createClass2.default)(TabbedDashboard, [{
      key: "handleDesignChange",
      value: function handleDesignChange(index, design) {
        var tabs;
        boundMethodCheck(this, TabbedDashboard);
        tabs = this.props.design.tabs.slice();
        tabs[index] = _.extend({}, tabs[index], {
          design: design
        });
        return this.props.onDesignChange(_.extend({}, this.props.design, {
          tabs: tabs
        }));
      }
    }, {
      key: "handleAddTab",
      value: function handleAddTab() {
        var tabs;
        boundMethodCheck(this, TabbedDashboard);
        tabs = this.props.design.tabs.slice(); // Add new dashboard

        tabs.push({
          name: "Untitled",
          design: {
            items: {}
          }
        });
        return this.props.onDesignChange(_.extend({}, this.props.design, {
          tabs: tabs
        }));
      }
    }, {
      key: "handleRemoveTab",
      value: function handleRemoveTab(index) {
        var tabs;
        boundMethodCheck(this, TabbedDashboard);

        if (!confirm("Permanently remove this tab? This cannot be undone!")) {
          return;
        }

        tabs = this.props.design.tabs.slice();
        tabs.splice(index, 1);
        return this.props.onDesignChange(_.extend({}, this.props.design, {
          tabs: tabs
        }));
      }
    }, {
      key: "handleRenameTab",
      value: function handleRenameTab(index) {
        var name, tabs;
        boundMethodCheck(this, TabbedDashboard);
        name = this.props.design.tabs[index].name;
        name = prompt("Name of tab", name);

        if (name) {
          tabs = this.props.design.tabs.slice();
          tabs[index] = _.extend({}, tabs[index], {
            name: name
          });
          return this.props.onDesignChange(_.extend({}, this.props.design, {
            tabs: tabs
          }));
        }
      }
    }, {
      key: "createTab",
      value: function createTab(tab, index) {
        boundMethodCheck(this, TabbedDashboard);
        return {
          id: "".concat(index),
          label: tab.name,
          elem: R(visualization.DashboardComponent, {
            design: tab.design,
            widgetFactory: this.props.widgetFactory,
            onDesignChange: this.handleDesignChange.bind(null, index),
            extraTitleButtonsElem: [R('a', {
              key: "renametab",
              className: "btn btn-link btn-sm",
              onClick: this.handleRenameTab.bind(null, index)
            }, R('span', {
              className: "glyphicon glyphicon-pencil"
            }), " Rename Tab"), " ", R('a', {
              key: "removetab",
              className: "btn btn-link btn-sm",
              onClick: this.handleRemoveTab.bind(null, index)
            }, R('span', {
              className: "glyphicon glyphicon-remove"
            }), " Remove Tab")]
          })
        };
      }
    }, {
      key: "createTabs",
      value: function createTabs() {
        return _.map(this.props.design.tabs, this.createTab);
      }
    }, {
      key: "render",
      value: function render() {
        return R(TabbedComponent, {
          tabs: this.createTabs(),
          initialTabId: "0",
          onAddTab: this.handleAddTab
        });
      }
    }]);
    return TabbedDashboard;
  }(React.Component);

  ;
  TabbedDashboard.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired,
    widgetFactory: PropTypes.object.isRequired
  };
  return TabbedDashboard;
}.call(void 0);