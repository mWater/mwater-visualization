import { DataSource } from "mwater-expressions";
export default class CachingDataSource extends DataSource {
    constructor(options: any);
    performQuery(query: any, cb: any): any;
}
