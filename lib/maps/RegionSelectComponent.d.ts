import React from 'react'
import { Schema, DataSource } from 'mwater-expressions';

/** Allows selecting of a single region */
export default class RegionSelectComponent extends React.Component<{
  schema: Schema
  dataSource: DataSource
  /** _id of region */
  region: number | null    
  onChange: (region: number, level: number) => void
  /** Default "All Countries" */
  placeholder?: string 
  /** e.g. "admin_regions" */
  regionsTable: string
  /** Maximum region level allowed */
  maxLevel?: number 
}> {}
