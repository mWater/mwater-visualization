import React from "react";
interface RegionSelectComponentProps {
    /** Schema to use */
    schema: any;
    dataSource: any;
    /** _id of region */
    region?: number;
    /** Called with (_id, level) */
    onChange: any;
    placeholder?: string;
    /** e.g. "admin_regions" */
    regionsTable: string;
    /** Maximum region level allowed */
    maxLevel?: number;
}
export default class RegionSelectComponent extends React.Component<RegionSelectComponentProps> {
    static defaultProps: {
        placeholder: string;
        regionsTable: string;
    };
    handleChange: (id: any) => any;
    render(): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
}
export {};
