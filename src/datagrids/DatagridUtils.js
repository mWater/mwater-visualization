let DatagridUtils;
import _ from 'lodash';
import update from 'update-object';
import { ExprCleaner } from 'mwater-expressions';
import { ExprUtils } from "mwater-expressions";
import { default as produce } from 'immer';
import { original } from 'immer';

export default DatagridUtils = class DatagridUtils {
  constructor(schema) {
    this.schema = schema;
  }

  // Cleans a datagrid design, removing invalid columns
  cleanDesign(design) {
    const exprCleaner = new ExprCleaner(this.schema);

    // Erase all if table doesn't exist
    if (!this.schema.getTable(design.table)) {
      return {};
    }

    // Clean columns
    design = produce(design, draft => {
      for (let column of draft.columns) {
        if (column.type === "expr") {
          // Determine if subtable
          var table;
          if (column.subtable) {
            const subtable = _.findWhere(design.subtables, {id: column.subtable});

            // Now get destination table
            table = new ExprUtils(this.schema).followJoins(design.table, subtable.joins);
          } else {
            ({
              table
            } = design);
          }

          column.expr = exprCleaner.cleanExpr((column.expr ? original(column.expr) : null), { table, aggrStatuses: ["individual", "literal", "aggregate"] });
        }
      }

    });
    return design;
  }
  
  validateDesign(design) {
    if (!design.table) {
      return "Missing table";
    }

    if (!design.columns?.[0]) {
      return "No columns";
    }
  }
};