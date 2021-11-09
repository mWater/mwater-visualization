import React from "react";
import { DataSource, Schema } from "mwater-expressions";
interface QuickfiltersDesignComponentProps {
    /** Design of quickfilters. See README.md */
    design: any;
    /** Called when design changes */
    onDesignChange: any;
    schema: Schema;
    dataSource: DataSource;
    /** List of possible table ids to use */
    tables: any;
}
export default class QuickfiltersDesignComponent extends React.Component<QuickfiltersDesignComponentProps> {
    static defaultProps: {
        design: never[];
    };
    handleDesignChange: (design: any) => any;
    isMergeable(design: any, index: any): boolean;
    renderQuickfilter(item: any, index: any): React.CElement<any, QuickfilterDesignComponent>;
    handleAdd: () => any;
    handleRemove: (index: any) => any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
interface QuickfilterDesignComponentProps {
    /** Design of a single quickfilters. See README.md */
    design: any;
    onChange: any;
    onRemove: any;
    /** True if can be merged */
    mergeable?: boolean;
    schema: Schema;
    dataSource: DataSource;
    tables: any;
}
interface QuickfilterDesignComponentState {
    table: any;
}
declare class QuickfilterDesignComponent extends React.Component<QuickfilterDesignComponentProps, QuickfilterDesignComponentState> {
    constructor(props: any);
    handleTableChange: (table: any) => any;
    handleExprChange: (expr: any) => any;
    handleLabelChange: (ev: any) => any;
    handleMergedChange: (merged: any) => any;
    handleMultiChange: (multi: any) => any;
    render(): React.CElement<RemovableComponentProps, RemovableComponent>;
}
interface RemovableComponentProps {
    onRemove: any;
}
declare class RemovableComponent extends React.Component<RemovableComponentProps> {
    render(): React.DetailedReactHTMLElement<{
        style: {
            display: "flex";
        };
        className: string;
    }, HTMLElement>;
}
export {};
