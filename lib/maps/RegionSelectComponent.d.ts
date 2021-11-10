import React from "react";
import { DataSource, Schema } from "mwater-expressions";
interface RegionSelectComponentProps {
    schema: Schema;
    dataSource: DataSource;
    /** _id of region */
    region: number | null | undefined;
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
    render(): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
}
export {};
