var QuickfiltersDataSource;

module.exports = QuickfiltersDataSource = (function() {
  function QuickfiltersDataSource() {}

  QuickfiltersDataSource.prototype.getValues = function(index, expr, filters, offset, limit, callback) {
    throw new Error("Not implemented");
  };

  return QuickfiltersDataSource;

})();
