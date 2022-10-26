import { Schema } from "mwater-expressions";
import { JsonQLFilter } from "./JsonQLFilter";
export default class ImplicitFilterBuilder {
    schema: Schema;
    constructor(schema: Schema);
    findJoins(filterableTables: any): any;
    extendFilters(filterableTables: string[], filters: JsonQLFilter[]): JsonQLFilter[];
}
