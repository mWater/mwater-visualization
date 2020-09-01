import { LiteralType } from "mwater-expressions";
/** Option for list of format options */
export interface FormatOption {
    value: string;
    label: string;
}
/** Determine if can format type */
export declare function canFormatType(type: LiteralType): boolean;
/** Get available options for formatting a type. Null if not available */
export declare function getFormatOptions(type: LiteralType): FormatOption[] | null;
/** Get default format */
export declare function getDefaultFormat(type: LiteralType): string;
/** Format a value of a specified type as a string. For historical reasons,
 * LayeredCharts multiply by 100 before adding the % sign. Set legacyPercentFormat to true to replicate
 */
export declare function formatValue(type: LiteralType, value: any, format: string | null | undefined, locale?: string, legacyPercentFormat?: boolean): string;
