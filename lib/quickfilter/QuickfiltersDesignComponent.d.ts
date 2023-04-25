import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import { Quickfilter } from "./Quickfilter";
export interface QuickfiltersDesignComponentProps {
    /** Design of quickfilters. See README.md */
    design: Quickfilter[];
    /** Called when design changes */
    onDesignChange: (design: Quickfilter[]) => void;
    schema: Schema;
    dataSource: DataSource;
    /** List of possible table ids to use */
    tables: string[];
}
export default class QuickfiltersDesignComponent extends React.Component<QuickfiltersDesignComponentProps> {
    handleDesignChange: (design: any) => void;
    isMergeable(design: any, index: any): boolean;
    renderQuickfilter: (item: any, index: any) => React.CElement<any, QuickfilterDesignComponent>;
    handleAdd: () => void;
    handleRemove: (index: any) => void;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
interface QuickfilterDesignComponentProps {
    /** Design of a single quickfilters. See README.md */
    design: Quickfilter;
    onChange: (design: Quickfilter) => void;
    onRemove: () => void;
    /** True if can be merged */
    mergeable?: boolean;
    schema: Schema;
    dataSource: DataSource;
    tables: string[];
}
interface QuickfilterDesignComponentState {
    table: any;
}
/** Single quickfilter design component */
declare class QuickfilterDesignComponent extends React.Component<QuickfilterDesignComponentProps, QuickfilterDesignComponentState> {
    constructor(props: any);
    handleTableChange: (table: any) => void;
    handleExprChange: (expr: any) => void;
    handleLabelChange: (ev: any) => void;
    handleMergedChange: (merged: any) => void;
    handleMultiChange: (multi: any) => void;
    render(): React.DetailedReactHTMLElement<{}, HTMLElement>;
}
export {};
