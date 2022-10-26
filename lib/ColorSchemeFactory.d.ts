import { AxisCategory } from "./axes/Axis";
export default class ColorSchemeFactory {
    static createColorScheme(options: any): any[];
    static createColorMapForCategories(categories: AxisCategory[], isCategorical: any): {
        value: any;
        color: any;
    }[];
}
