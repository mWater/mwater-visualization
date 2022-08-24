import { Schema } from "mwater-expressions";
import { ExprUtils } from "mwater-expressions";
import AxisBuilder from "../../../axes/AxisBuilder";
import { PivotChartDesign } from "./PivotChartDesign";
import { JsonQLFilter } from "../../../JsonQLFilter";
/** Builds pivot table queries.
 * Result is flat list for each intersection with each row being data for a single cell
 * columns of result are:
 *  value: value of the cell (aggregate)
 *  r0: row segment value (if present)
 *  r1: inner row segment value (if present)
 *  ...
 *  c0: column segment value (if present)
 *  c1: inner column segment value (if present)
 *  ...
 * Also produces queries needed to order row/column segments when ordered
 * These are indexed by the segment id and contain the values in order (already asc/desc corrected)
 * each row containing only { value: }
 */
export default class PivotChartQueryBuilder {
    schema: Schema;
    exprUtils: ExprUtils;
    axisBuilder: AxisBuilder;
    constructor(options: {
        schema: Schema;
    });
    createQueries(design: PivotChartDesign, extraFilters: JsonQLFilter[]): {};
}
