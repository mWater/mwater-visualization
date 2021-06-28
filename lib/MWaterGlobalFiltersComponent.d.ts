import React from "react";
interface MWaterGlobalFiltersComponentProps {
    /** Schema of the database */
    schema: any;
    /** Data source to use to get values */
    dataSource: any;
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
