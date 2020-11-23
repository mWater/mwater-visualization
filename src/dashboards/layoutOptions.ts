import { DashboardDesign } from "./DashboardDesign"

/** Width buckets for dashboards */
export type WidthBucket = "sm" | "md" | "lg" | "xl"

export interface BlocksLayoutOptions {
  /** Width at which to collapse columns. Null to not collapse */
  collapseColumns: WidthBucket | null

  /** Width below w???? */
  minimumWidth?: WidthBucket | null

  maximumWidth?: number
}

/** Sample widths by bucket */
export const sampleWidthsByBucket: { [bucket in WidthBucket]: number } = {
  sm: 400,
  md: 768,
  lg: 1024,
  xl: 1280
}

/** Minimum widths by bucket */
export const minWidthsByBucket: { [bucket in WidthBucket]: number | null } = {
  sm: null,
  md: 700,
  lg: 1000,
  xl: 1200
}

/** Determine which width bucket to use */
export function determineBucket(width: number) {
  if (width > minWidthsByBucket["xl"]!) {
    return "xl"
  }
  if (width > minWidthsByBucket["lg"]!) {
    return "lg"
  }
  if (width > minWidthsByBucket["md"]!) {
    return "md"
  }
  return "sm"
}

/** Get default layout options for a theme */
export function getDefaultLayoutOptions(theme: string | undefined): BlocksLayoutOptions {
  theme = theme || "default"

  return {
    collapseColumns: "sm"
  }
}

export function getLayoutOptions(design: DashboardDesign): BlocksLayoutOptions {
  return design.layoutOptions || getDefaultLayoutOptions(design.style)
}

/** Determine if should collapse columns */
export function shouldCollapseColumns(layoutOptions: BlocksLayoutOptions, width: number) {
  const bucket = determineBucket(width)

  if (bucket == "sm") {
    return layoutOptions.collapseColumns != null
  }
  if (bucket == "md") {
    return layoutOptions.collapseColumns == "md" || layoutOptions.collapseColumns == "lg" || layoutOptions.collapseColumns == "xl"
  }
  if (bucket == "lg") {
    return layoutOptions.collapseColumns == "lg" || layoutOptions.collapseColumns == "xl"
  }
  if (bucket == "xl") {
    return layoutOptions.collapseColumns == "xl"
  }
  return false
}