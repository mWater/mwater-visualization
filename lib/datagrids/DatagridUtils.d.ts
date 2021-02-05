import { Schema } from "mwater-expressions";
import { DatagridDesign } from "./DatagridDesign";
export default class DatagridUtils {
    schema: Schema;
    constructor(schema: Schema);
    cleanDesign(design: DatagridDesign): DatagridDesign;
    validateDesign(design: DatagridDesign): string | null;
}
