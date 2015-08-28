var jsyaml, visualization;

visualization = require('./index');

jsyaml = require('js-yaml');

exports.loadDashboard = function(options) {
  return $.get(options.schemaUrl, function(schemaYaml) {
    var dataSource, design, render, schema, schemaJson, updateDesign, widgetFactory;
    schema = new visualization.Schema();
    schemaJson = jsyaml.safeLoad(schemaYaml);
    schema.loadFromJSON(schemaJson);
    dataSource = new visualization.CachingDataSource({
      perform: function(query, cb) {
        var url;
        url = options.queryUrl.replace(/\{query\}/, encodeURIComponent(JSON.stringify(query)));
        return $.getJSON(url, function(rows) {
          return cb(null, rows);
        }).fail(function(xhr) {
          console.error(xhr.responseText);
          return cb(new Error(xhr.responseText));
        });
      }
    });
    widgetFactory = new visualization.WidgetFactory({
      schema: schema,
      dataSource: dataSource
    });
    design = options.design;
    updateDesign = function(newDesign) {
      design = newDesign;
      return render();
    };
    render = function() {
      var dashboardElem;
      dashboardElem = React.createElement(visualization.DashboardComponent, {
        design: design,
        widgetFactory: widgetFactory,
        onDesignChange: updateDesign
      });
      return React.render(dashboardElem, document.getElementById(options.elemId));
    };
    return render();
  });
};
