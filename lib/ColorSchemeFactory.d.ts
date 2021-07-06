export default class ColorSchemeFactory {
    static createColorScheme(options: any): any[];
    static createColorMapForCategories(categories: any, isCategorical: any): {
        value: any;
        color: any;
    }[];
}
