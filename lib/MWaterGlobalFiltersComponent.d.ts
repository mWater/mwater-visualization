import React from "react";
import { DataSource, Schema } from "mwater-expressions";
interface MWaterGlobalFiltersComponentProps {
    /** Schema of the database */
    schema: Schema;
    /** Data source to use to get values */
    dataSource: DataSource;
    filterableTables: any;
    globalFilters?: any;
    onChange: any;
}
export default class MWaterGlobalFiltersComponent extends React.Component<MWaterGlobalFiltersComponentProps> {
    handleRegionsChange: (regions: any) => any;
    handleManagedByChange: (managedBy: any) => any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
