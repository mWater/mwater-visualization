let DirectDatagridDataSource;
import DatagridDataSource from './DatagridDataSource';
import DatagridQueryBuilder from './DatagridQueryBuilder';
import QuickfilterUtils from '../quickfilter/QuickfilterUtils';

// Uses direct DataSource queries
export default DirectDatagridDataSource = class DirectDatagridDataSource {
  // Create dashboard data source that uses direct jsonql calls
  // options:
  //   schema: schema to use
  //   dataSource: data source to use
  constructor(options) {
    this.options = options;
  }

  // Gets the rows specified
  getRows(design, offset, limit, filters, callback) {
    const queryBuilder = new DatagridQueryBuilder(this.options.schema);
    
    // Create query to get the page of rows at the specific offset
    const query = queryBuilder.createQuery(design, { 
      offset,
      limit,
      extraFilters: filters
    });

    return this.options.dataSource.performQuery(query, callback);
  }

  // Gets the quickfilters data source
  getQuickfiltersDataSource() {
    return {
      getValues: (index, expr, filters, offset, limit, callback) => {
        // Perform query
        return QuickfilterUtils.findExprValues(expr, this.options.schema, this.options.dataSource, filters, offset, limit, callback);
      }
    };
  }
};
