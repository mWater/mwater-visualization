var ConsoleDataSource, DirectConsoleDataSource, DirectDashboardDataSource, DirectDatagridDataSource, DirectMapDataSource, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

ConsoleDataSource = require('./ConsoleDataSource');

DirectDashboardDataSource = require('../dashboards/DirectDashboardDataSource');

DirectMapDataSource = require('../maps/DirectMapDataSource');

DirectDatagridDataSource = require('../datagrids/DirectDatagridDataSource');

module.exports = DirectConsoleDataSource = (function(superClass) {
  extend(DirectConsoleDataSource, superClass);

  function DirectConsoleDataSource(options) {
    this.options = options;
  }

  DirectConsoleDataSource.prototype.getDashboardTabDataSource = function(tabId) {
    return new DirectDashboardDataSource({
      schema: this.options.schema,
      dataSource: this.options.dataSource,
      apiUrl: this.options.apiUrl,
      client: this.options.client,
      design: _.findWhere(this.options.design.tabs, {
        id: tabId
      }).design
    });
  };

  return DirectConsoleDataSource;

})(ConsoleDataSource);
