var DatagridDataSource, DatagridQueryBuilder, DirectDatagridDataSource, QuickfilterUtils;

DatagridDataSource = require('./DatagridDataSource');

DatagridQueryBuilder = require('./DatagridQueryBuilder');

QuickfilterUtils = require('../quickfilter/QuickfilterUtils');

module.exports = DirectDatagridDataSource = (function() {
  function DirectDatagridDataSource(options) {
    this.options = options;
  }

  DirectDatagridDataSource.prototype.getRows = function(design, offset, limit, filters, callback) {
    var query, queryBuilder;
    queryBuilder = new DatagridQueryBuilder(this.options.schema);
    query = queryBuilder.createQuery(design, {
      offset: offset,
      limit: limit,
      extraFilters: filters
    });
    return this.options.dataSource.performQuery(query, callback);
  };

  DirectDatagridDataSource.prototype.getQuickfiltersDataSource = function() {
    return {
      getValues: (function(_this) {
        return function(index, expr, filters, offset, limit, callback) {
          return QuickfilterUtils.findExprValues(expr, _this.options.schema, _this.options.dataSource, filters, offset, limit, callback);
        };
      })(this)
    };
  };

  return DirectDatagridDataSource;

})();
