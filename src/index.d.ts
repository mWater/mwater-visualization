import { Schema, DataSource, Expr } from "mwater-expressions";
import { ReactElement } from "react";  
import React from "react"
import { JsonQL } from "jsonql";
import Widget from "./widgets/Widget";
import { JsonQLFilter } from "./JsonQLFilter";

export { default as LeafletMapComponent, MapBounds, TileLayer, GeoJsonLayer, MapLayer } from "./maps/LeafletMapComponent";

export { default as DateRangeComponent } from "./DateRangeComponent";

export { default as RegionSelectComponent } from './maps/RegionSelectComponent'

export * from './datagrids/DatagridDesign'

export { default as TableSelectComponent } from './TableSelectComponent'

export * from './JsonQLFilter'

export { default as DashboardComponent } from './dashboards/DashboardComponent'
export { default as DashboardDataSource } from './dashboards/DashboardDataSource'
export { default as DirectDashboardDataSource } from './dashboards/DirectDashboardDataSource'
export * from './dashboards/DashboardDesign'
export { MapDesign, MapLayerView } from './maps/MapDesign'

export { default as compressJson } from './compressJson'

export { default as LocaleContextInjector } from './LocaleContextInjector'

export * from './WidgetScope'

export { default as WidgetFactory } from './widgets/WidgetFactory'
export { default as Widget } from './widgets/Widget'

export class MWaterLoaderComponent extends React.Component<{
  apiUrl: string
  client?: string
  share?: string
  /**  user id of logged in user */
  user?: string                              
  /**  Load schema as a specific user (for shared dashboards, etc) */
  asUser?: string         
  /**  Extra tables to load in schema. Forms are not loaded by default as they are too many */                   
  extraTables?: string[]  
  /**  Called when extra tables are changed and schema will be reloaded */
  onExtraTablesChange?: (extraTables: string[]) => void
  /**  Override default add layer component. See AddLayerComponent for details */
  addLayerElementFactory?: any              
  children: (error: any, config: { schema: Schema, dataSource: DataSource }) => ReactElement<any>
}> {}

export class MWaterContextComponent extends React.Component<{
  apiUrl: string
  client?: string
  /**  user id of logged in user */
  user?: string                   
  schema: Schema           
  /**  Extra tables to load in schema. Forms are not loaded by default as they are too many */                   
  extraTables?: string[]  
  /**  Called when extra tables are changed and schema will be reloaded */
  onExtraTablesChange?: (extraTables: string[]) => void
  /**  Override default add layer component. See AddLayerComponent for details */
  addLayerElementFactory?: any              
}> {}

export { default as mWaterLoader } from './mWaterLoader'

export { default as DirectWidgetDataSource } from './widgets/DirectWidgetDataSource'