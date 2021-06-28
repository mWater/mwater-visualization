import { DashboardDesign } from "./DashboardDesign"

export type DashboardTheme = "default" | "greybg" | "story"

/** Width buckets for dashboards */
export type WidthBucket = "sm" | "md" | "lg" | "xl"

export interface BlocksLayoutOptions {
  /** Width at which to collapse columns. Null to not collapse */
  collapseColumnsWidth: number | null

  /** Width below which scales or scrolls */
  minimumWidth: number | null

  /** What to do when below minimum width */
  belowMinimumWidth: "scale" | "scroll"

  /** Width above which pads */
  maximumWidth: number | null

  /** Width at which to hide quickfilters. Null for never */
  hideQuickfiltersWidth: number | null
}

/** Get default layout options for a theme */
export function getDefaultLayoutOptions(theme: DashboardTheme | undefined): BlocksLayoutOptions {
  theme = theme || "default"

  return {
    collapseColumnsWidth: 600,
    minimumWidth: theme == "story" ? 400 : 600,
    belowMinimumWidth: "scale",
    maximumWidth: theme == "story" ? 1000 : 1600,
    hideQuickfiltersWidth: 600
  }
}

export function getLayoutOptions(design: DashboardDesign): BlocksLayoutOptions {
  return design.layoutOptions || getDefaultLayoutOptions(design.style)
}
