import { Expr } from "mwater-expressions";
/** Axis

An axis is an expression with optional aggregation, transform and color mapping
In ggplot2 parlance, an "aesthetic"

It contains:
 expr: expression
 aggr: DEPRECATED: optional aggregation (e.g. sum)
 xform: optional transformation to be applied. object with `type` field. See below
 colorMap: optional array of color mappings. See below
 excludedValues: Array of post-xform values to exclude when displaying.
 format: optional d3-format format for numeric values. Default if null is ","

## Xforms

types:


*/
export interface Axis {
    expr: Expr;
    /**
     * `bin`: convert into bins. always has `numBins` integer and `min` and `max`. Can have `excludeUpper` and/or `excludeLower` to remove open bin on top or bottem. type enum
     * `date`: convert to complete date e.g. `2015-02-08`. type date
     * `year`: year only e.g. `2015-01-01`. type date
     * `yearmonth`: year and month only e.g. `2015-02-01`. type date
     * `yearquarter`: year and quarter only e.g. `2015-01`. type enum
     * `yearweek`: year and week (ISO) only e.g. `2015-31`. type enum
     * `month`: month only e.g. `02`. type enum
     * `week`: ISO week of year e.g. `01` for the first week that contains January 4th
     * `ranges`: convert to ranges. type enum. `ranges` is array of { id (unique id), label (optional label), minValue (null for none), maxValue (null for none), minOpen (true for >, false for >=), maxOpen (true for <, false for <=) }
     * `floor`: convert to floor. type enum
     */
    xform?: "bin" | "date" | "year" | "yearmonth" | "month" | "week" | "ranges" | "yearweek" | "yearquarter" | "floor";
    colorMap?: ColorMap;
    /** optional array of category values which define the order in which categories should be rendered */
    drawOrder?: any[];
    /** optional labels for categories. Indexed by JSON of category value */
    categoryLabels?: {
        [valueJson: string]: string;
    };
    /** optional string for null category */
    nullLabel?: string;
    excludedValues?: any[];
    format?: string;
}
/**
 * Color map
 * Array of { value: post-transform value of expression, color: html color }
 * The color map is kept in sync with the values of the axis after transformation.
 * The order is not important.
 */
export declare type ColorMap = [ColorMapItem];
export interface ColorMapItem {
    value: any;
    color: string;
}
