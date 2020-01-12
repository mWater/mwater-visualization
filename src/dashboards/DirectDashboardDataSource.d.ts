import DashboardDataSource from "./DashboardDataSource"
import { Schema, DataSource } from "mwater-expressions";
import { DashboardDesign } from "./DashboardDesign";

/** Uses direct DataSource queries */
export default class DirectDashboardDataSource extends DashboardDataSource {
  /** Create dashboard data source that uses direct jsonql calls */
  constructor(options: {
    /** schema to use */
    schema: Schema

    /** data source to use */
    dataSource: DataSource

    /** design of entire dashboard */
    design: DashboardDesign

    /** API url to use for talking to mWater server */
    apiUrl?: string

    /** client id to use for talking to mWater server */
    client?: string
  })
}
  
