import React from "react";
import { IdLiteralComponent } from "mwater-expressions-ui";
import { DataSource, Schema } from "mwater-expressions";
export interface RegionSelectComponentProps {
    schema: Schema;
    dataSource: DataSource;
    /** _id of region */
    region: string | number | null | undefined;
    onChange: (region: number | null, level: number | null) => void;
    /** Default "All Countries" */
    placeholder?: string;
    /** e.g. "admin_regions" */
    regionsTable?: string;
    /** Maximum region level allowed */
    maxLevel?: number;
}
export default class RegionSelectComponent extends React.Component<RegionSelectComponentProps> {
    static defaultProps: {
        placeholder: string;
        regionsTable: string;
    };
    handleChange: (id: any) => void;
    render(): React.CElement<import("mwater-expressions-ui/lib/IdLiteralComponent").IdLiteralComponentProps, IdLiteralComponent>;
}
