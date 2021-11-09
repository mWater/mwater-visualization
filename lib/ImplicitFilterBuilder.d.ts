import { Schema } from "mwater-expressions";
export default class ImplicitFilterBuilder {
    schema: Schema;
    constructor(schema: Schema);
    findJoins(filterableTables: any): any;
    extendFilters(filterableTables: any, filters: any): any;
}
