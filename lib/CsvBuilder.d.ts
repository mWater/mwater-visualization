export default class CsvBuilder {
    build(table: any): string;
    _stringifyCsv(table: any, replacer: any): string;
    _csvifyValue(r: any, c: any, value: any): any;
}
