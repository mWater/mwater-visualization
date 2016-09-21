var DatagridDataSource, DatagridQueryBuilder, DirectDatagridDataSource;

DatagridDataSource = require('./DatagridDataSource');

DatagridQueryBuilder = require('./DatagridQueryBuilder');

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

  return DirectDatagridDataSource;

})();
