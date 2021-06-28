import { default as React, Component } from "react"

/** Allows selection of a date range */
export default class DateRangeComponent extends Component<{
  /** Array of [start date, end date] in iso 8601 format */
  value: [string | null, string | null] | null

  /** Array of [start date, end date] in iso 8601 format */
  onChange: (value: [string | null, string | null]) => void

  /** true if for datetime, not date   */
  datetime?: boolean
}> {}
