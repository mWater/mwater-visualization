import { DashboardDesign } from "./DashboardDesign";
export declare type DashboardTheme = "default" | "greybg" | "story";
/** Width buckets for dashboards */
export declare type WidthBucket = "sm" | "md" | "lg" | "xl";
export interface BlocksLayoutOptions {
    /** Width at which to collapse columns. Null to not collapse */
    collapseColumnsWidth: number | null;
    /** Width below which scales or scrolls */
    minimumWidth: number | null;
    /** What to do when below minimum width */
    belowMinimumWidth: "scale" | "scroll";
    /** Width above which pads */
    maximumWidth: number | null;
    /** Width at which to hide quickfilters. Null for never */
    hideQuickfiltersWidth: number | null;
}
/** Get default layout options for a theme */
export declare function getDefaultLayoutOptions(theme: DashboardTheme | undefined): BlocksLayoutOptions;
export declare function getLayoutOptions(design: DashboardDesign): BlocksLayoutOptions;
