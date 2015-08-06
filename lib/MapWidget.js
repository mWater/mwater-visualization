var H, LeafletMapComponent, MapWidget, MapWidgetDesignerComponent, MapWidgetViewComponent, React, SimpleWidgetComponent, Widget, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

_ = require('lodash');

Widget = require('./Widget');

SimpleWidgetComponent = require('./SimpleWidgetComponent');

LeafletMapComponent = require('./LeafletMapComponent');

module.exports = MapWidget = (function(superClass) {
  extend(MapWidget, superClass);

  function MapWidget(design) {
    this.design = design;
  }

  MapWidget.prototype.createViewElement = function(options) {
    var dropdownItems;
    dropdownItems = [
      {
        label: [
          H.span({
            className: "glyphicon glyphicon-remove"
          }), " Remove"
        ],
        onClick: options.onRemove
      }
    ];
    return React.createElement(SimpleWidgetComponent, {
      selected: options.selected,
      onSelect: options.onSelect,
      dropdownItems: dropdownItems
    }, React.createElement(MapWidgetViewComponent, {
      design: this.design
    }));
  };

  MapWidget.prototype.createDesignerElement = function(options) {
    return React.createElement(MapWidgetDesignerComponent, {
      design: this.design,
      onDesignChange: options.onDesignChange
    });
  };

  return MapWidget;

})(Widget);

MapWidgetViewComponent = (function(superClass) {
  extend(MapWidgetViewComponent, superClass);

  function MapWidgetViewComponent() {
    return MapWidgetViewComponent.__super__.constructor.apply(this, arguments);
  }

  MapWidgetViewComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    width: React.PropTypes.number,
    height: React.PropTypes.number
  };

  MapWidgetViewComponent.prototype.render = function() {
    return React.createElement(LeafletMapComponent, {
      baseLayerId: "bing_road",
      initialCenter: {
        lat: 0,
        lng: 10
      },
      initialZoom: 5,
      width: this.props.width,
      height: this.props.height
    });
  };

  return MapWidgetViewComponent;

})(React.Component);

MapWidgetDesignerComponent = (function(superClass) {
  extend(MapWidgetDesignerComponent, superClass);

  function MapWidgetDesignerComponent() {
    return MapWidgetDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  MapWidgetDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  MapWidgetDesignerComponent.prototype.render = function() {
    return H.div(null, "No options");
  };

  return MapWidgetDesignerComponent;

})(React.Component);
