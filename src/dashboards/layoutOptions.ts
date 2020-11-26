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
}

// /** Sample widths by bucket */
// export const sampleWidthsByBucket: { [bucket in WidthBucket]: number } = {
//   sm: 400,
//   md: 768,
//   lg: 1024,
//   xl: 1280
// }

// /** Minimum widths by bucket */
// export const minWidthsByBucket: { [bucket in WidthBucket]: number | null } = {
//   sm: null,
//   md: 700,
//   lg: 1000,
//   xl: 1200
// }

// /** Determine which width bucket to use */
// export function determineBucket(width: number) {
//   if (width > minWidthsByBucket["xl"]!) {
//     return "xl"
//   }
//   if (width > minWidthsByBucket["lg"]!) {
//     return "lg"
//   }
//   if (width > minWidthsByBucket["md"]!) {
//     return "md"
//   }
//   return "sm"


/** Get default layout options for a theme */
export function getDefaultLayoutOptions(theme: DashboardTheme | undefined): BlocksLayoutOptions {
  theme = theme || "default"

  return {
    collapseColumnsWidth: 600,
    minimumWidth: theme == "story" ? 400 : 1000,
    belowMinimumWidth: "scroll",
    maximumWidth: theme == "story" ? 1000 : 1600
  }
}

export function getLayoutOptions(design: DashboardDesign): BlocksLayoutOptions {
  return design.layoutOptions || getDefaultLayoutOptions(design.style)
}