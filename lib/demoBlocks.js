var $, BlocksDesignerComponent, DemoComponent, DirectWidgetDataSource, MWaterLoaderComponent, R, React, ReactDOM, WidgetFactory, design, widgetDesign,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

ReactDOM = require('react-dom');

R = React.createElement;

$ = require('jquery');

MWaterLoaderComponent = require('./MWaterLoaderComponent');

BlocksDesignerComponent = require('./layouts/blocks/BlocksDesignerComponent');

DirectWidgetDataSource = require('./widgets/DirectWidgetDataSource');

WidgetFactory = require('./widgets/WidgetFactory');

DemoComponent = (function(superClass) {
  extend(DemoComponent, superClass);

  function DemoComponent(props) {
    DemoComponent.__super__.constructor.call(this, props);
    this.state = {
      design: design,
      extraTables: []
    };
  }

  DemoComponent.prototype.render = function() {
    return R(MWaterLoaderComponent, {
      apiUrl: this.props.apiUrl,
      client: this.props.client,
      user: this.props.user,
      onExtraTablesChange: (function(_this) {
        return function(extraTables) {
          return _this.setState({
            extraTables: extraTables
          });
        };
      })(this),
      extraTables: this.state.extraTables
    }, (function(_this) {
      return function(error, config) {
        var renderWidget;
        if (error) {
          alert("Error: " + error.message);
          return null;
        }
        renderWidget = function(options) {
          var widget, widgetDataSource;
          widget = WidgetFactory.createWidget(options.type);
          widgetDataSource = new DirectWidgetDataSource({
            apiUrl: _this.props.apiUrl,
            widget: widget,
            schema: config.schema,
            dataSource: config.dataSource,
            client: _this.props.client
          });
          return React.cloneElement(widget.createViewElement({
            schema: config.schema,
            dataSource: config.dataSource,
            widgetDataSource: widgetDataSource,
            design: options.design,
            onDesignChange: options.onDesignChange,
            scope: null,
            filters: [],
            onScopeChange: function() {
              return alert("TODO");
            }
          }), {
            width: options.width,
            height: widget.isAutoHeight() ? null : options.height,
            standardWidth: options.width
          });
        };
        return R(BlocksDesignerComponent, {
          renderWidget: renderWidget,
          design: _this.state.design,
          onDesignChange: function(design) {
            return _this.setState({
              design: design
            });
          }
        });
      };
    })(this));
  };

  return DemoComponent;

})(React.Component);

$(function() {
  var sample;
  sample = R('div', {
    className: "container-fluid",
    style: {
      height: "100%",
      paddingLeft: 0,
      paddingRight: 0
    }
  }, R('style', null, 'html, body, #main { height: 100% }'), React.createElement(DemoComponent, {
    apiUrl: "https://api.mwater.co/v3/"
  }));
  return ReactDOM.render(sample, document.getElementById("main"));
});

widgetDesign = {
  "version": 1,
  "layers": [
    {
      "axes": {
        "x": {
          "expr": {
            "type": "field",
            "table": "entities.water_point",
            "column": "type"
          },
          "xform": null
        },
        "y": {
          "expr": {
            "type": "id",
            "table": "entities.water_point"
          },
          "aggr": "count",
          "xform": null
        }
      },
      "filter": null,
      "table": "entities.water_point"
    }
  ],
  "type": "bar"
};

design = {
  id: "root",
  type: "root",
  blocks: []
};
