import { Expr } from "mwater-expressions";
import { Axis } from "../axes/Axis";
/** Layer which clusters markers, counting them */
export interface ClusterLayerDesign {
    /** table to get data from */
    table: string;
    /** axes (see below) */
    axes: {
        /** locations to cluster */
        geometry: Axis | null;
    };
    /** optional logical expression to filter by */
    filter?: Expr;
    /** color of text. default #FFFFFF */
    textColor?: string;
    /** color of markers that text is drawn on. default #337ab7 */
    fillColor?: string;
    /** minimum zoom level */
    minZoom?: number;
    /** maximum zoom level */
    maxZoom?: number;
}
